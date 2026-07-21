from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
import time

from database import get_db
from models.client import Client
from services.token_manager import get_meta_token
from services.meta import get_account_balance

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

    clients = db.query(Client).filter(Client.active == True, Client.has_meta == True).all()
    balances = []
    for client in clients:
        if not client.meta_account_id:
            continue
        try:
            token = get_meta_token(client, db)
            if not token:
                continue
            bal = get_account_balance(client.meta_account_id, token)
            balance = bal["balance"]
            # Clientes com cartão de crédito não têm saldo exposto — pula
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
            })
        except Exception:
            pass
    balances.sort(key=lambda x: ({"ok": 2, "warning": 1, "error": 0}[x["level"]], x["client_name"]))
    _budget_cache["data"] = balances
    _budget_cache["ts"] = time.time()
    return {"balances": balances, "cached": False}
