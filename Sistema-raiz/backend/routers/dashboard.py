from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date, timedelta
import time

from database import get_db
from models.client import Client
from models.report import SyncLog
from services.token_manager import get_meta_token, get_google_credentials
from services.meta import get_account_balance
from services.google_ads import get_account_balance as get_google_balance

router = APIRouter()

_budget_cache: dict = {"ts": 0, "data": None}
_BUDGET_TTL = 3600  # 1 hora

DAY_NAMES_PT = {
    "monday": "Segunda-feira", "tuesday": "Terça-feira",
    "wednesday": "Quarta-feira", "thursday": "Quinta-feira",
    "friday": "Sexta-feira", "saturday": "Sábado", "sunday": "Domingo",
}

MONTHS_PT = {
    1: "janeiro", 2: "fevereiro", 3: "março", 4: "abril",
    5: "maio", 6: "junho", 7: "julho", 8: "agosto",
    9: "setembro", 10: "outubro", 11: "novembro", 12: "dezembro",
}


@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()
    today_name = today.strftime("%A").lower()
    yesterday = today - timedelta(days=1)
    since = (yesterday - timedelta(days=6)).isoformat()
    until = yesterday.isoformat()

    return {
        "today":          today.isoformat(),
        "today_name": DAY_NAMES_PT.get(today_name, today_name.capitalize()),
        "today_formatted": f"{today.day} de {MONTHS_PT[today.month]} de {today.year}",
        "period": {"since": since, "until": until},
        "scheduled_today": [],
        "pending_review": [],
        "pending_count": 0,
    }


@router.get("/budget-alerts")
def get_budget_alerts(db: Session = Depends(get_db)):
    """Retorna saldo atual de todos os clientes Meta ativos. Cache de 1h."""
    if _budget_cache["data"] is not None and (time.time() - _budget_cache["ts"]) < _BUDGET_TTL:
        return {"balances": _budget_cache["data"], "cached": True}

    # Meta Ads — clientes pré-pagos
    meta_clients = db.query(Client).filter(Client.active == True, Client.has_meta == True).all()
    # Google Ads PIX — clientes só Google (sem Meta)
    google_pix_clients = db.query(Client).filter(
        Client.active == True,
        Client.has_google == True,
        Client.has_meta == False,
        Client.google_customer_id != None,
    ).all()

    balances = []

    for client in meta_clients:
        if not client.meta_account_id:
            continue
        try:
            token = get_meta_token(client, db)
            if not token:
                continue
            bal = get_account_balance(client.meta_account_id, token)
            balance = bal["balance"]
            if balance is None:
                continue
            level = "ok"
            if balance <= 0:
                level = "error"
            elif balance < 50:
                level = "warning"
            balances.append({
                "client_name": client.name,
                "balance": balance,
                "level": level,
                "platform": "meta",
            })
        except Exception:
            pass

    if google_pix_clients:
        try:
            gcreds = get_google_credentials(db)
        except Exception:
            gcreds = None
        if gcreds:
            for client in google_pix_clients:
                try:
                    bal = get_google_balance(client.google_customer_id, gcreds)
                    balance = bal["balance"]
                    if balance is None:
                        continue
                    level = "ok"
                    if balance <= 0:
                        level = "error"
                    elif balance < 50:
                        level = "warning"
                    balances.append({
                        "client_name": client.name,
                        "balance": balance,
                        "level": level,
                        "platform": "google",
                    })
                except Exception:
                    pass
    balances.sort(key=lambda x: ({"ok": 2, "warning": 1, "error": 0}[x["level"]], x["client_name"]))
    _budget_cache["data"] = balances
    _budget_cache["ts"] = time.time()
    return {"balances": balances, "cached": False}


@router.get("/sync-today")
def get_sync_today(db: Session = Depends(get_db)):
    """Resumo do planilhamento automático do dia de hoje."""
    today = date.today()
    logs = (
        db.query(SyncLog)
        .options(joinedload(SyncLog.client))
        .filter(
            SyncLog.type == "weekly",
            func.date(SyncLog.synced_at) == today,
        )
        .order_by(SyncLog.synced_at.desc())
        .all()
    )
    success_logs = [l for l in logs if l.status == "success"]
    error_logs   = [l for l in logs if l.status == "error"]
    return {
        "date":    today.isoformat(),
        "synced":  len(success_logs),
        "errors":  len(error_logs),
        "clients": [
            {
                "client_id":    l.client_id,
                "client_name":  l.client.name if l.client else "?",
                "status":       l.status,
                "rows_synced":  l.rows_synced,
                "error":        l.error_message,
                "since":        l.period_start,
                "synced_at":    l.synced_at.isoformat() if l.synced_at else None,
            }
            for l in logs
        ],
    }


@router.post("/sync-run")
def trigger_sync(db: Session = Depends(get_db)):
    """Dispara o planilhamento semanal manual imediatamente."""
    from services.sync_engine import run_daily_sync
    try:
        summary = run_daily_sync(db)
        return {"ok": True, **summary}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@router.get("/sync-monthly")
def get_sync_monthly(db: Session = Depends(get_db)):
    """Último planilhamento mensal registrado (qualquer data)."""
    from services.cadencia_builder import get_month_range
    since, _ = get_month_range()   # mês anterior
    logs = (
        db.query(SyncLog)
        .options(joinedload(SyncLog.client))
        .filter(
            SyncLog.type == "monthly",
            SyncLog.period_start == since,
        )
        .order_by(SyncLog.synced_at.desc())
        .all()
    )
    success_logs = [l for l in logs if l.status == "success"]
    error_logs   = [l for l in logs if l.status == "error"]
    return {
        "period": since,
        "synced": len(success_logs),
        "errors": len(error_logs),
        "clients": [
            {
                "client_id":   l.client_id,
                "client_name": l.client.name if l.client else "?",
                "status":      l.status,
                "error":       l.error_message,
                "synced_at":   l.synced_at.isoformat() if l.synced_at else None,
            }
            for l in logs
        ],
    }


@router.post("/sync-monthly-run")
def trigger_monthly_sync(db: Session = Depends(get_db)):
    """Dispara o planilhamento mensal manual imediatamente."""
    from services.sync_engine import run_monthly_sync
    try:
        summary = run_monthly_sync(db)
        return {"ok": True, **summary}
    except Exception as e:
        return {"ok": False, "error": str(e)}
