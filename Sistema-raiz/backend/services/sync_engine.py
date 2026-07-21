"""
Motor de planilhamento automático diário.

Roda de segunda a sexta e planilha os dados da semana completa que acabou:
  since = hoje - 7 dias  |  until = ontem

Para cada cliente com planilha configurada:
  1. Lê sheets_tabs (aba por tipo de campanha)
  2. Busca dados da Meta para o período
  3. Chama write_weekly por aba — com auto_append=True
  4. Loga resultado em SyncLog
"""
import json
import logging
from datetime import date
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from models.client import Client
from models.report import SyncLog
from services.cadencia_builder import get_week_range
from services.meta import get_account_data, grupos_to_tipos
from services.token_manager import get_meta_token
from services.sheets import write_weekly, is_configured

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


def _sheets_map(client) -> dict:
    """
    Retorna {tipo: tab_name} para o cliente.
    Prioriza ClientCampaign se configurado, senão sheets_tabs JSON.
    """
    if client.campaigns:
        m = {c.campaign_type: c.sheet_tab for c in client.campaigns if c.active and c.sheet_tab}
        if m:
            return m
    if client.sheets_tabs:
        try:
            return json.loads(client.sheets_tabs)
        except Exception:
            pass
    return {}


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

    s_map = _sheets_map(client)
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
        data  = get_account_data(client.meta_account_id, token, since, until, grupos_cfg)
        tipos = data.get("tipos", {})
    except Exception as e:
        result.update(status="error", error=f"Erro Meta API: {e}")
        return result

    # Escreve em cada aba configurada
    any_written = False
    any_error   = False

    for tipo, tab_name in s_map.items():
        d = tipos.get(tipo, {})
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

    for client in clients:
        if _already_synced(db, client.id, since):
            logger.debug("[sync] %s — já planilhado hoje, pulando", client.name)
            continue

        result = sync_client(client, db, since, until)
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

    db.commit()
    summary = {
        "since": since, "until": until,
        "total": len(client_results),
        "synced": synced, "errors": errors, "skipped": skipped,
        "clients": client_results,
    }
    logger.info("[sync] Concluído — %d planilhados, %d erros, %d sem semana", synced, errors, skipped)
    return summary
