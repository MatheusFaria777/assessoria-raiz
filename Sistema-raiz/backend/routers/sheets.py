from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

from database import get_db
from models.client import Client
from models.report import SyncLog
from config import decrypt
from services.token_manager import get_meta_token
from services.meta import get_account_data as meta_data, grupos_to_tipos
from services import sheets as sheets_svc

router = APIRouter()


class SyncRequest(BaseModel):
    client_id: int
    since: str
    until: str
    sync_type: str = "weekly"   # weekly | monthly


class BatchSyncRequest(BaseModel):
    since: str
    until: str
    sync_type: str = "weekly"


@router.post("/sync")
def sync_sheets(req: SyncRequest, db: Session = Depends(get_db)):
    if not sheets_svc.is_configured():
        raise HTTPException(status_code=400, detail="Credenciais do Google Sheets não encontradas no servidor")

    client = db.query(Client).filter(Client.id == req.client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not client.sheets_id:
        raise HTTPException(status_code=400, detail="Cliente sem planilha configurada")

    # Detecta plataforma e busca dados
    is_google = client.has_google and client.google_customer_id and not client.has_meta

    if is_google:
        from services.token_manager import get_google_credentials
        from services.google_ads import get_account_data as google_data
        creds = get_google_credentials(db)
        if not creds:
            raise HTTPException(status_code=400, detail="Credenciais Google Ads não configuradas em Configurações → Google Ads.")
        try:
            data = google_data(client.google_customer_id, creds, req.since, req.until)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Erro Google Ads API: {str(e)}")
        tipos_cfg = []
    else:
        if not client.has_meta or not client.meta_account_id:
            raise HTTPException(status_code=400, detail="Cliente sem plataforma de anúncios configurada.")
        token = get_meta_token(client, db)
        if not token:
            raise HTTPException(status_code=400, detail="Token Meta não configurado. Configure o System User Token em Configurações → Meta Ads.")
        tipos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else []
        try:
            data = meta_data(client.meta_account_id, token, req.since, req.until, tipos_cfg)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")

    tipos = data.get("tipos", {})
    total_spend = data.get("total_spend", 0.0)
    primary_type = data.get("primary_type")
    results = {}
    errors = []

    if req.sync_type == "weekly":
        sheets_tabs = json.loads(client.sheets_tabs or "{}") if client.sheets_tabs else {}
        if not sheets_tabs:
            raise HTTPException(status_code=400, detail="Nenhuma aba configurada para este cliente. Configure em Clientes → aba Planilha.")

        # Agrupa tipos por aba — primeiro com dados vence
        tab_candidates: dict[str, dict] = {}
        for tipo_name, tipo_data in tipos.items():
            tab_name = sheets_tabs.get(tipo_name)
            if not tab_name:
                continue
            if tipo_data.get("spend", 0) == 0 and tipo_data.get("results", 0) == 0:
                continue
            if tab_name not in tab_candidates:
                tab_candidates[tab_name] = tipo_data

        if not tab_candidates:
            raise HTTPException(
                status_code=400,
                detail=f"Sem dados para o período. Tipos encontrados: {list(tipos.keys())}. Configurados na planilha: {list(sheets_tabs.keys())}."
            )

        for tab_name, tipo_data in tab_candidates.items():
            r = sheets_svc.write_weekly(
                sheet_id=client.sheets_id, tab_name=tab_name, since=req.since,
                impressoes=tipo_data.get("impressions", 0),
                results=tipo_data.get("results", 0),
                link_clicks=tipo_data.get("link_clicks", 0),
                spend=tipo_data.get("spend", 0.0),
                revenue=tipo_data.get("purchase_value", 0.0),
            )
            results[tab_name] = r
            if not r.get("ok"):
                errors.append(f"{tab_name}: {r.get('error')}")

    elif req.sync_type == "monthly":
        total_leads = 0
        if primary_type and primary_type in tipos:
            total_leads = tipos[primary_type].get("results", 0)
        elif tipos:
            total_leads = next(iter(tipos.values())).get("results", 0)

        r = sheets_svc.write_monthly(client.sheets_id, req.since, total_spend, total_leads)
        results["monthly"] = r
        if not r.get("ok"):
            errors.append(r.get("error", "Erro desconhecido"))

    # Salva log
    log = SyncLog(
        client_id=client.id, type=req.sync_type,
        status="success" if not errors else "error",
        rows_synced=len(results),
        error_message="; ".join(errors) if errors else None,
    )
    db.add(log)
    db.commit()

    return {"ok": not errors, "results": results, "errors": errors}


@router.post("/sync-batch")
def sync_batch(req: BatchSyncRequest, db: Session = Depends(get_db)):
    """Sincroniza todos os clientes com planilha configurada."""
    clients = db.query(Client).filter(
        Client.active == True,
        Client.sheets_id != None,
        Client.has_meta == True,
    ).all()

    batch_results = []
    for client in clients:
        try:
            r = sync_sheets(
                SyncRequest(client_id=client.id, since=req.since, until=req.until, sync_type=req.sync_type),
                db=db,
            )
            batch_results.append({"client": client.name, "ok": r["ok"], "errors": r.get("errors", [])})
        except HTTPException as e:
            batch_results.append({"client": client.name, "ok": False, "errors": [e.detail]})

    return {"results": batch_results, "total": len(batch_results)}


@router.get("/last-sync/{client_id}")
def last_sync(client_id: int, db: Session = Depends(get_db)):
    log = db.query(SyncLog).filter(SyncLog.client_id == client_id).order_by(SyncLog.synced_at.desc()).first()
    if not log:
        return {"synced_at": None, "status": None, "type": None}
    return {
        "synced_at": log.synced_at.isoformat() if log.synced_at else None,
        "status": log.status,
        "type": log.type,
        "error": log.error_message,
    }
