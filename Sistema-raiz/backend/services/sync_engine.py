"""
Motor de planilhamento automático (semanal e mensal).

Semanal — Segunda a Sexta às 8h:
  since = hoje - 7 dias  |  until = ontem
  Escreve em cada aba configurada em sheets_tabs / ClientCampaign.

Mensal — Primeira segunda do mês às 8h:
  Escreve o mês anterior na aba VISÃO GERAL de cada cliente.
"""
import logging
import time
from datetime import date
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from models.client import Client
from models.report import SyncLog
from services.cadencia_builder import get_week_range, get_month_range
from services.meta import get_account_data, grupos_to_tipos
from services.token_manager import get_meta_token, get_google_credentials
from services.sheets import write_weekly, write_monthly, is_configured
from services.campaign_config import get_campaign_map, get_sheet_map

logger = logging.getLogger(__name__)


def _already_synced(db: Session, client_id: int, since: str) -> bool:
    """True se já existe um sync de sucesso para esse cliente e período hoje."""
    today = date.today()
    return db.query(SyncLog).filter(
        SyncLog.client_id == client_id,
        SyncLog.status == "success",
        SyncLog.period_start == since,
        func.date(SyncLog.synced_at) == today,
    ).first() is not None


def sync_client(client, db: Session, since: str, until: str) -> dict:
    """Planilha um cliente. Retorna dict com resultado."""
    result = {
        "client_id":    client.id,
        "client_name":  client.name,
        "since":        since,
        "until":        until,
        "tabs_synced":  [],
        "tabs_skipped": [],
        "tabs_error":   [],
        "status":       "success",
        "error":        None,
        "appended":     False,
    }

    if not client.sheets_id:
        result.update(status="skipped", error="Planilha não configurada")
        return result

    s_map = get_sheet_map(client)
    if not s_map:
        result.update(status="skipped", error="Nenhuma aba de campanha configurada")
        return result

    if not is_configured():
        result.update(status="error", error="Google Sheets não configurado no servidor")
        return result

    # Busca dados da Meta
    if not (client.has_meta and client.meta_account_id):
        result.update(status="skipped", error="Cliente sem Meta Ads configurado")
        return result

    try:
        token = get_meta_token(client, db)
        if not token:
            result.update(status="error", error="Token Meta não configurado")
            return result

        grupos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else [
            {"tipo": t, "tipo_contagem": "mensagem", "palavras": [], "label": t,
             "metrica": "Resultado", "acao": None, "campo": None}
            for t in s_map
        ]
        data  = get_account_data(client.meta_account_id, token, since, until, grupos_cfg, campaign_map=get_campaign_map(client))
        tipos = data.get("tipos", {})
    except Exception as e:
        result.update(status="error", error=f"Erro Meta API: {e}")
        return result

    # Escreve em cada aba configurada
    any_written = False
    any_error   = False

    for tipo, tab_name in s_map.items():
        d = tipos.get(tipo, {})
        try:
            res = write_weekly(
                sheet_id    = client.sheets_id,
                tab_name    = tab_name,
                since       = since,
                impressoes  = int(d.get("impressions", 0)),
                results     = int(d.get("results", 0)),
                link_clicks = int(d.get("link_clicks", 0)),
                spend       = float(d.get("spend", 0.0)),
                revenue     = float(d.get("purchase_value", 0.0)),
                auto_append = True,
            )
        except Exception as e:
            # Erro da API do Sheets (ex: cota excedida) não pode derrubar o cliente inteiro,
            # muito menos o lote inteiro — vira um erro só dessa aba.
            res = {"ok": False, "error": f"Erro Google Sheets: {e}"}
        if res.get("ok"):
            result["tabs_synced"].append(tab_name)
            if res.get("appended"):
                result["appended"] = True
            any_written = True
        elif "não encontrada" in res.get("error", "") and "Aba" not in res.get("error", ""):
            result["tabs_skipped"].append({"tab": tab_name, "reason": res["error"]})
        else:
            result["tabs_error"].append({"tab": tab_name, "error": res["error"]})
            any_error = True

    if any_error:
        result["status"] = "error"
        result["error"]  = "; ".join(e["error"] for e in result["tabs_error"])
    elif not any_written:
        result["status"] = "not_applicable"

    return result


def run_daily_sync(db: Session) -> dict:
    """
    Roda o sync diário para todos os clientes elegíveis.
    Retorna resumo: {since, until, total, synced, errors, skipped, clients}.
    """
    since, until = get_week_range()
    logger.info("[sync] Iniciando sync diário — período %s a %s", since, until)

    clients = (
        db.query(Client)
        .filter(Client.active == True, Client.sheets_id != None)
        .options(selectinload(Client.campaign_groups), selectinload(Client.campaigns))
        .order_by(Client.name)
        .all()
    )

    synced = 0
    errors = 0
    skipped = 0
    client_results = []

    for i, client in enumerate(clients):
        if _already_synced(db, client.id, since):
            logger.debug("[sync] %s — já planilhado hoje, pulando", client.name)
            continue

        try:
            result = sync_client(client, db, since, until)
        except Exception as e:
            # Um cliente quebrando (ex: cota da API do Google) não pode derrubar o lote inteiro —
            # antes disso acontecia e ninguém depois dele na lista era sincronizado, nem salvo.
            logger.warning("[sync] %s — ERRO inesperado: %s", client.name, e)
            result = {
                "client_id": client.id, "client_name": client.name,
                "tabs_synced": [], "status": "error", "error": str(e),
            }
        client_results.append(result)

        if result["status"] == "success":
            synced += 1
            log = SyncLog(
                client_id    = client.id,
                type         = "weekly",
                status       = "success",
                rows_synced  = len(result["tabs_synced"]),
                period_start = since,
                period_end   = until,
            )
            db.add(log)
            logger.info("[sync] %s — OK (%d abas)", client.name, len(result["tabs_synced"]))

        elif result["status"] == "error":
            errors += 1
            log = SyncLog(
                client_id     = client.id,
                type          = "weekly",
                status        = "error",
                rows_synced   = len(result["tabs_synced"]),
                error_message = result["error"],
                period_start  = since,
                period_end    = until,
            )
            db.add(log)
            logger.warning("[sync] %s — ERRO: %s", client.name, result["error"])

        else:
            skipped += 1

        # Salva o progresso a cada cliente — se algo travar mais na frente, o que já
        # rodou certo não se perde (antes só commitava tudo no final, tudo ou nada).
        db.commit()

        # Pequeno intervalo entre clientes pra não estourar a cota de leitura/escrita
        # do Google Sheets (foi exatamente isso que quebrou o sync de hoje).
        if i < len(clients) - 1:
            time.sleep(1.5)
    summary = {
        "since": since, "until": until,
        "total": len(client_results),
        "synced": synced, "errors": errors, "skipped": skipped,
        "clients": client_results,
    }
    logger.info("[sync] Concluído — %d planilhados, %d erros, %d sem semana", synced, errors, skipped)
    return summary


# ─── Planilhamento mensal ──────────────────────────────────────────────────

def _already_synced_monthly(db: Session, client_id: int, since: str) -> bool:
    """True se já existe sync mensal de sucesso para esse cliente e mês."""
    return db.query(SyncLog).filter(
        SyncLog.client_id == client_id,
        SyncLog.type == "monthly",
        SyncLog.status == "success",
        SyncLog.period_start == since,
    ).first() is not None


def _fetch_monthly_data(client, db: Session, since: str, until: str) -> dict | None:
    """
    Busca dados agregados do mês anterior para um cliente.
    Tenta Meta Ads primeiro; se não tiver, tenta Google Ads.
    Retorna {invest, leads, impressoes, link_clicks, revenue} ou None em caso de erro.
    """
    # Meta Ads
    if client.has_meta and client.meta_account_id:
        try:
            token = get_meta_token(client, db)
            if not token:
                return None
            grupos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else []
            data = get_account_data(client.meta_account_id, token, since, until, grupos_cfg, campaign_map=get_campaign_map(client))
            tipos = data.get("tipos", {})
            total_invest     = sum(t.get("spend", 0) for t in tipos.values())
            total_leads      = sum(t.get("results", 0) for t in tipos.values())
            total_impressoes = sum(t.get("impressions", 0) for t in tipos.values())
            total_clicks     = sum(t.get("link_clicks", 0) for t in tipos.values())
            total_revenue    = sum(t.get("purchase_value", 0) for t in tipos.values())
            return {
                "invest": total_invest, "leads": int(total_leads),
                "impressoes": int(total_impressoes), "link_clicks": int(total_clicks),
                "revenue": total_revenue,
            }
        except Exception as e:
            logger.warning("[sync-monthly] %s — Erro Meta API: %s", client.name, e)
            return None

    # Google Ads
    if client.has_google and client.google_customer_id:
        try:
            from services.google_ads import get_account_data as get_google_data
            gcreds = get_google_credentials(db)
            if not gcreds:
                return None
            data = get_google_data(client.google_customer_id, gcreds, since, until)
            tipos = data.get("tipos", {})
            total_invest     = sum(t.get("spend", 0) for t in tipos.values())
            total_leads      = sum(t.get("results", 0) for t in tipos.values())
            total_impressoes = sum(t.get("impressions", 0) for t in tipos.values())
            total_clicks     = sum(t.get("link_clicks", 0) for t in tipos.values())
            return {
                "invest": total_invest, "leads": int(total_leads),
                "impressoes": int(total_impressoes), "link_clicks": int(total_clicks),
                "revenue": 0.0,
            }
        except Exception as e:
            logger.warning("[sync-monthly] %s — Erro Google API: %s", client.name, e)
            return None

    return None


def run_monthly_sync(db: Session) -> dict:
    """
    Roda o planilhamento mensal: escreve mês anterior na aba VISÃO GERAL de cada cliente.
    Deve ser chamado na primeira segunda do mês às 8h.
    """
    since, until = get_month_range()
    logger.info("[sync-monthly] Iniciando — período %s a %s", since, until)

    clients = (
        db.query(Client)
        .filter(
            Client.active == True,
            Client.sheets_id != None,
        )
        .options(selectinload(Client.campaign_groups), selectinload(Client.campaigns))
        .order_by(Client.name)
        .all()
    )

    synced = 0
    errors = 0
    skipped = 0
    client_results = []

    for i, client in enumerate(clients):
        if _already_synced_monthly(db, client.id, since):
            logger.debug("[sync-monthly] %s — já planilhado, pulando", client.name)
            continue

        if not is_configured():
            logger.error("[sync-monthly] Google Sheets não configurado")
            break

        metrics = _fetch_monthly_data(client, db, since, until)
        if metrics is None:
            skipped += 1
            client_results.append({
                "client_id": client.id, "client_name": client.name,
                "status": "skipped", "error": "Sem dados ou plataforma não configurada",
            })
            continue

        try:
            res = write_monthly(
                sheet_id    = client.sheets_id,
                since       = since,
                invest      = metrics["invest"],
                leads       = metrics["leads"],
                impressoes  = metrics["impressoes"],
                link_clicks = metrics["link_clicks"],
                revenue     = metrics["revenue"],
            )
        except Exception as e:
            # Mesmo motivo do sync semanal: um cliente quebrando (cota da API, etc)
            # não pode derrubar o lote inteiro nem perder o progresso já salvo.
            logger.warning("[sync-monthly] %s — ERRO inesperado: %s", client.name, e)
            res = {"ok": False, "error": str(e)}

        if res.get("ok"):
            synced += 1
            log = SyncLog(
                client_id    = client.id,
                type         = "monthly",
                status       = "success",
                rows_synced  = 1,
                period_start = since,
                period_end   = until,
            )
            db.add(log)
            logger.info("[sync-monthly] %s — OK (%s)", client.name, res.get("month"))
            client_results.append({
                "client_id": client.id, "client_name": client.name,
                "status": "success", "month": res.get("month"),
            })
        else:
            errors += 1
            log = SyncLog(
                client_id     = client.id,
                type          = "monthly",
                status        = "error",
                rows_synced   = 0,
                error_message = res.get("error"),
                period_start  = since,
                period_end    = until,
            )
            db.add(log)
            logger.warning("[sync-monthly] %s — ERRO: %s", client.name, res.get("error"))
            client_results.append({
                "client_id": client.id, "client_name": client.name,
                "status": "error", "error": res.get("error"),
            })

        db.commit()
        if i < len(clients) - 1:
            time.sleep(1.5)

    summary = {
        "since": since, "until": until,
        "total": len(client_results),
        "synced": synced, "errors": errors, "skipped": skipped,
        "clients": client_results,
    }
    logger.info("[sync-monthly] Concluído — %d planilhados, %d erros", synced, errors)
    return summary
