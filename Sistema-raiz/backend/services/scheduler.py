from apscheduler.schedulers.asyncio import AsyncIOScheduler
import logging

logger = logging.getLogger(__name__)


async def run_token_renewal():
    """Verifica e renova o token Meta se estiver próximo de vencer."""
    from services.meta_token import auto_renew_token
    from database import SessionLocal
    db = SessionLocal()
    try:
        await auto_renew_token(db)
    finally:
        db.close()


async def run_daily_sync():
    """Planilha todos os clientes elegíveis (segunda a sexta às 8h)."""
    from services.sync_engine import run_daily_sync as _sync
    from database import SessionLocal
    db = SessionLocal()
    try:
        _sync(db)
    except Exception as e:
        logger.error("[scheduler] Erro no sync diário: %s", e)
    finally:
        db.close()


async def run_monthly_sync():
    """
    Planilhamento mensal — primeira segunda do mês às 8h.
    Escreve o mês anterior na aba VISÃO GERAL de cada cliente.
    """
    from services.sync_engine import run_monthly_sync as _sync_monthly
    from database import SessionLocal
    db = SessionLocal()
    try:
        _sync_monthly(db)
    except Exception as e:
        logger.error("[scheduler] Erro no sync mensal: %s", e)
    finally:
        db.close()


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")

    # Renovação automática do token Meta todos os dias às 9h
    scheduler.add_job(
        run_token_renewal,
        trigger="cron",
        hour=9, minute=0,
        id="token_renewal",
        replace_existing=True,
    )

    # Planilhamento semanal — segunda a sexta às 8h
    scheduler.add_job(
        run_daily_sync,
        trigger="cron",
        day_of_week="mon-fri",
        hour=8, minute=0,
        id="daily_sync",
        replace_existing=True,
    )

    # Planilhamento mensal — primeira segunda do mês às 8h
    # day="1-7" + day_of_week="mon" = primeira segunda do mês
    scheduler.add_job(
        run_monthly_sync,
        trigger="cron",
        day_of_week="mon",
        day="1-7",
        hour=8, minute=5,  # 5 min depois do semanal
        id="monthly_sync",
        replace_existing=True,
    )

    return scheduler
