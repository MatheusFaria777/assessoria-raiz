"""
Agendamento automático de relatórios.
Roda todo dia às 7h e verifica quais clientes têm aquele dia da semana configurado.
"""
from datetime import date, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
import json
import logging

logger = logging.getLogger(__name__)

# Mapeia nome do dia (em inglês, lowercase) para weekday() do Python (0=Mon)
DAY_MAP = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}


def _week_range_for(ref: date) -> tuple[str, str]:
    """Janela rolante de 7 dias terminando ontem (until=ontem, since=ontem-6)."""
    until = ref - timedelta(days=1)
    since = until - timedelta(days=6)
    return since.isoformat(), until.isoformat()


def _month_range_for(ref: date) -> tuple[str, str]:
    """Retorna o intervalo do mês anterior."""
    first = date(ref.year, ref.month - 1 if ref.month > 1 else 12,
                 1) if ref.month > 1 else date(ref.year - 1, 12, 1)
    last = date(ref.year, ref.month, 1) - timedelta(days=1)
    return first.isoformat(), last.isoformat()


async def run_scheduled_reports():
    """Executado todo dia às 7h — gera relatórios para clientes agendados."""
    from database import SessionLocal
    from models.client import Client
    from models.report import Report
    from config import decrypt
    from services.meta import get_account_data, grupos_to_tipos
    from services.report_builder import format_report

    today = date.today()
    today_name = today.strftime("%A").lower()  # ex: "monday"

    db: Session = SessionLocal()
    try:
        clients = db.query(Client).filter(Client.active == True).all()
        generated = 0

        for client in clients:
            if not client.report_days:
                continue
            try:
                days = json.loads(client.report_days)
            except Exception:
                continue

            if today_name not in days:
                continue

            if not client.has_meta or not client.meta_account_id:
                continue

            from services.token_manager import get_meta_token
            token = get_meta_token(client, db)
            if not token:
                continue

            tipos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else []
            since, until = _week_range_for(today)

            logger.info(f"[scheduler] Gerando relatório auto: {client.name} ({since} → {until})")

            try:
                current = get_account_data(client.meta_account_id, token, since, until, tipos_cfg)

                # Período anterior
                prev_since = (date.fromisoformat(since) - timedelta(days=7)).isoformat()
                prev_until  = (date.fromisoformat(since) - timedelta(days=1)).isoformat()
                try:
                    previous = get_account_data(client.meta_account_id, token, prev_since, prev_until, tipos_cfg)
                except Exception:
                    previous = None

                top_ads = []
                try:
                    from services.meta import get_top_ads
                    top_ads = get_top_ads(
                        client.meta_account_id, token, since, until,
                        tipos_cfg, current.get("primary_type"), n=3,
                    )
                except Exception as e:
                    logger.warning(f"[scheduler] top_ads falhou para {client.name}: {e}")

                content = format_report(
                    client_name=client.name,
                    since=since, until=until,
                    current=current, previous=previous,
                    grupos_cfg=tipos_cfg,
                    summary_text="",
                    top_ads=top_ads,
                    period_type="week",
                )

                report = Report(
                    client_id=client.id, type="week", platform="meta",
                    period_start=date.fromisoformat(since),
                    period_end=date.fromisoformat(until),
                    content=content,
                    raw_data=json.dumps({"current": current}, default=str),
                    status="pending_review",
                    auto_generated=True,
                )
                db.add(report)
                db.commit()
                generated += 1
                logger.info(f"[scheduler] Relatório OK: {client.name}")

                # Sync planilha (se configurada)
                if client.sheets_id and client.sheets_tabs:
                    try:
                        from services import sheets as sheets_svc
                        from models.report import SyncLog
                        sheets_tabs = json.loads(client.sheets_tabs)
                        tipos = current.get("tipos", {})
                        tab_candidates: dict[str, dict] = {}
                        for tipo_name, tipo_data in tipos.items():
                            tab_name = sheets_tabs.get(tipo_name)
                            if tab_name and (tipo_data.get("spend", 0) > 0 or tipo_data.get("results", 0) > 0):
                                if tab_name not in tab_candidates:
                                    tab_candidates[tab_name] = tipo_data

                        sync_errors = []
                        for tab_name, tipo_data in tab_candidates.items():
                            r = sheets_svc.write_weekly(
                                sheet_id=client.sheets_id, tab_name=tab_name, since=since,
                                impressoes=tipo_data.get("impressions", 0),
                                results=tipo_data.get("results", 0),
                                link_clicks=tipo_data.get("link_clicks", 0),
                                spend=tipo_data.get("spend", 0.0),
                                revenue=tipo_data.get("purchase_value", 0.0),
                            )
                            if not r.get("ok"):
                                sync_errors.append(f"{tab_name}: {r.get('error')}")

                        log = SyncLog(
                            client_id=client.id, type="weekly",
                            status="success" if not sync_errors else "error",
                            rows_synced=len(tab_candidates),
                            error_message="; ".join(sync_errors) if sync_errors else None,
                        )
                        db.add(log)
                        db.commit()
                        logger.info(f"[scheduler] Planilha OK: {client.name} ({len(tab_candidates)} aba(s))")
                    except Exception as e:
                        logger.error(f"[scheduler] Erro planilha {client.name}: {e}")
                        db.rollback()
            except Exception as e:
                logger.error(f"[scheduler] ERRO {client.name}: {e}")
                db.rollback()

        logger.info(f"[scheduler] {generated} relatório(s) gerado(s) automaticamente")
    finally:
        db.close()


async def run_token_renewal():
    """Verifica e renova o token Meta se estiver próximo de vencer."""
    from services.meta_token import auto_renew_token
    from database import SessionLocal
    db = SessionLocal()
    try:
        await auto_renew_token(db)
    finally:
        db.close()


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")
    # Relatórios automáticos desativados — geração manual via UI
    # Verifica renovação do token todo dia às 9h
    scheduler.add_job(
        run_token_renewal,
        trigger="cron",
        hour=9, minute=0,
        id="token_renewal",
        replace_existing=True,
    )
    return scheduler
