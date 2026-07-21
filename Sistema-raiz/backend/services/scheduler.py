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
