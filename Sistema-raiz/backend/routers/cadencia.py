from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models.client import Client
from services.meta import get_account_data, get_top_ads, grupos_to_tipos
from services.token_manager import get_meta_token, get_google_credentials
from services.cadencia_builder import (
    format_segunda, format_quarta, get_week_range, get_month_range, is_first_weekday,
    format_segunda_google, format_quarta_google,
)

router = APIRouter()


def _meta_clients(db: Session) -> list:
    return (
        db.query(Client)
        .filter(Client.active == True, Client.has_meta == True, Client.cadencia_ativa == True)
        .options(selectinload(Client.campaign_groups))
        .order_by(Client.name)
        .all()
    )


def _date_range(weekday: int) -> tuple[str, str, str]:
    """Retorna (since, until, period_type) — mensal na primeira ocorrência do weekday no mês."""
    if is_first_weekday(weekday):
        since, until = get_month_range()
        return since, until, "monthly"
    since, until = get_week_range()
    return since, until, "weekly"


def _google_only_clients(db: Session) -> list:
    """Clientes com Google Ads mas sem Meta (evita duplicatas)."""
    return (
        db.query(Client)
        .filter(
            Client.active == True,
            Client.has_google == True,
            Client.has_meta == False,
            Client.cadencia_ativa == True,
        )
        .order_by(Client.name)
        .all()
    )


@router.get("/segunda")
def cadencia_segunda(db: Session = Depends(get_db)):
    """Gera mensagem de segunda (semanal ou mensal na primeira segunda do mês)."""
    since, until, period_type = _date_range(0)
    results = []

    # --- Meta Ads ---
    for client in _meta_clients(db):
        try:
            token = get_meta_token(client, db)
            if not token:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Token Meta não configurado", "platform": "meta"})
                continue

            grupos_cfg = grupos_to_tipos(client.campaign_groups)
            if not grupos_cfg:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Grupos de campanha não configurados", "platform": "meta"})
                continue

            data = get_account_data(client.meta_account_id, token, since, until, grupos_cfg)
            message = format_segunda(
                client.name, since, until, data, grupos_cfg,
                contexto=client.cadencia_contexto or "",
                period_type=period_type,
            )
            results.append({
                "client_id": client.id,
                "name": client.name,
                "ok": True,
                "message": message,
                "since": since,
                "until": until,
                "total_spend": data.get("total_spend", 0),
                "platform": "meta",
                "period_type": period_type,
            })
        except Exception as e:
            results.append({"client_id": client.id, "name": client.name, "ok": False, "error": str(e), "platform": "meta"})

    # --- Google Ads ---
    google_creds = get_google_credentials(db)
    for client in _google_only_clients(db):
        try:
            if not google_creds:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Credenciais Google não configuradas", "platform": "google"})
                continue
            if not client.google_customer_id:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Customer ID Google não configurado", "platform": "google"})
                continue

            from services.google_ads import get_account_data as google_account_data
            data = google_account_data(client.google_customer_id, google_creds, since, until)
            message = format_segunda_google(
                client.name, since, until, data,
                contexto=client.cadencia_contexto or "",
                period_type=period_type,
            )
            results.append({
                "client_id": client.id,
                "name": client.name,
                "ok": True,
                "message": message,
                "since": since,
                "until": until,
                "total_spend": data.get("total_spend", 0),
                "platform": "google",
                "period_type": period_type,
            })
        except Exception as e:
            print(f"[cadencia/segunda] Google erro {client.name}: {e}", flush=True)
            results.append({"client_id": client.id, "name": client.name, "ok": False, "error": str(e), "platform": "google"})

    return results


@router.get("/quarta")
def cadencia_quarta(db: Session = Depends(get_db)):
    """Gera mensagem de quarta (melhores criativos/keywords — mensal na primeira quarta do mês)."""
    since, until, period_type = _date_range(2)
    results = []

    # --- Meta Ads ---
    for client in _meta_clients(db):
        try:
            token = get_meta_token(client, db)
            if not token:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Token Meta não configurado", "platform": "meta"})
                continue

            grupos_cfg = grupos_to_tipos(client.campaign_groups)
            if not grupos_cfg:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Grupos de campanha não configurados", "platform": "meta"})
                continue

            data = get_account_data(client.meta_account_id, token, since, until, grupos_cfg)
            primary_type = data.get("primary_type")
            top_ads = get_top_ads(
                client.meta_account_id, token, since, until, grupos_cfg, primary_type
            )
            message = format_quarta(
                client.name, top_ads,
                grupos_cfg=grupos_cfg,
                primary_type=primary_type,
                contexto=client.cadencia_contexto or "",
                period_type=period_type,
                since=since,
            )
            results.append({
                "client_id": client.id,
                "name": client.name,
                "ok": True,
                "message": message,
                "top_ads": top_ads,
                "platform": "meta",
                "period_type": period_type,
            })
        except Exception as e:
            results.append({"client_id": client.id, "name": client.name, "ok": False, "error": str(e), "platform": "meta"})

    # --- Google Ads ---
    google_creds = get_google_credentials(db)
    for client in _google_only_clients(db):
        try:
            if not google_creds:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Credenciais Google não configuradas", "platform": "google"})
                continue
            if not client.google_customer_id:
                results.append({"client_id": client.id, "name": client.name, "ok": False, "error": "Customer ID Google não configurado", "platform": "google"})
                continue

            from services.google_ads import get_top_keywords
            top_kws = get_top_keywords(client.google_customer_id, google_creds, since, until)
            message = format_quarta_google(
                client.name, top_kws,
                contexto=client.cadencia_contexto or "",
                period_type=period_type,
                since=since,
            )
            results.append({
                "client_id": client.id,
                "name": client.name,
                "ok": True,
                "message": message,
                "platform": "google",
                "period_type": period_type,
            })
        except Exception as e:
            print(f"[cadencia/quarta] Google erro {client.name}: {e}", flush=True)
            results.append({"client_id": client.id, "name": client.name, "ok": False, "error": str(e), "platform": "google"})

    return results
