from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import json
import time

from database import get_db
from models.client import Client
from models.report import SyncLog
from config import decrypt
from services.token_manager import get_meta_token
from services.meta import get_account_data as meta_data, grupos_to_tipos
from services import sheets as sheets_svc
from services.campaign_config import get_campaign_map, get_sheet_map, build_tab_candidates, list_client_tabs

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
            data = meta_data(client.meta_account_id, token, req.since, req.until, tipos_cfg, campaign_map=get_campaign_map(client))
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")

    tipos = data.get("tipos", {})
    total_spend = data.get("total_spend", 0.0)
    primary_type = data.get("primary_type")
    results = {}
    errors = []

    if req.sync_type == "weekly":
        sheets_tabs = get_sheet_map(client)
        if not sheets_tabs:
            raise HTTPException(status_code=400, detail="Nenhuma aba configurada para este cliente. Configure em Clientes → aba Campanhas (ou aba Planilha, no formato antigo).")

        # Cada campanha mapeada explicitamente já carrega sua própria aba — duas campanhas do
        # mesmo tipo com abas diferentes escrevem separado em vez de se misturar.
        tab_candidates = build_tab_candidates(client, tipos)

        if not tab_candidates:
            raise HTTPException(
                status_code=400,
                detail=f"Sem dados para o período. Tipos encontrados: {list(tipos.keys())}. Configurados na planilha: {list(sheets_tabs.keys())}."
            )

        try:
            sh = sheets_svc.open_spreadsheet(client.sheets_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Planilha não encontrada: {e}")

        for tab_name, tipo_data in tab_candidates.items():
            r = sheets_svc.write_weekly(
                sheet_id=client.sheets_id, tab_name=tab_name, since=req.since,
                impressoes=tipo_data.get("impressions", 0),
                results=tipo_data.get("results", 0),
                link_clicks=tipo_data.get("link_clicks", 0),
                spend=tipo_data.get("spend", 0.0),
                revenue=tipo_data.get("purchase_value", 0.0),
                sh=sh,
            )
            results[tab_name] = r
            if not r.get("ok"):
                errors.append(f"{tab_name}: {r.get('error')}")

    elif req.sync_type == "monthly":
        total_leads = 0
        if primary_type:
            # Soma todas as campanhas desse tipo — no modo explícito pode ter mais de uma
            total_leads = sum(d.get("results", 0) for d in tipos.values() if d.get("tipo") == primary_type)
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


@router.get("/gaps/{client_id}")
def get_gaps(client_id: int, db: Session = Depends(get_db)):
    """Varre as abas do cliente procurando semanas com linha já existente (data preenchida) mas sem dado."""
    if not sheets_svc.is_configured():
        raise HTTPException(status_code=400, detail="Credenciais do Google Sheets não encontradas no servidor")

    client = db.query(Client).filter(Client.id == client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not client.sheets_id:
        raise HTTPException(status_code=400, detail="Cliente sem planilha configurada")

    tabs = list_client_tabs(client)
    if not tabs:
        return {"gaps": {}}

    try:
        sh = sheets_svc.open_spreadsheet(client.sheets_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Planilha não encontrada: {e}")

    gaps = {}
    for tab in tabs:
        try:
            found = sheets_svc.find_gaps(sh, tab)
            if found:
                gaps[tab] = found
        except Exception:
            continue  # aba não existe ou cabeçalho não reconhecido — ignora, não trava a varredura

    return {"gaps": gaps}


class BackfillRequest(BaseModel):
    client_id: int


@router.post("/backfill")
def backfill_gaps(req: BackfillRequest, db: Session = Depends(get_db)):
    """Preenche todas as semanas em branco encontradas nas abas do cliente, buscando cada uma no Meta."""
    if not sheets_svc.is_configured():
        raise HTTPException(status_code=400, detail="Credenciais do Google Sheets não encontradas no servidor")

    client = db.query(Client).filter(Client.id == req.client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not client.sheets_id:
        raise HTTPException(status_code=400, detail="Cliente sem planilha configurada")
    if not client.has_meta or not client.meta_account_id:
        raise HTTPException(status_code=400, detail="Preenchimento automático só funciona pra clientes com Meta Ads configurado.")

    token = get_meta_token(client, db)
    if not token:
        raise HTTPException(status_code=400, detail="Token Meta não configurado. Configure o System User Token em Configurações → Meta Ads.")

    tabs = list_client_tabs(client)
    if not tabs:
        return {"filled": [], "errors": []}

    try:
        sh = sheets_svc.open_spreadsheet(client.sheets_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Planilha não encontrada: {e}")

    # Junta os buracos de todas as abas por data — a mesma semana pode faltar em mais de uma aba
    gaps_by_date: dict[str, set] = {}
    for tab in tabs:
        try:
            found = sheets_svc.find_gaps(sh, tab)
        except Exception:
            continue
        for date_br in found:
            gaps_by_date.setdefault(date_br, set()).add(tab)

    if not gaps_by_date:
        return {"filled": [], "errors": []}

    tipos_cfg = grupos_to_tipos(client.campaign_groups) if client.campaign_groups else []
    campaign_map = get_campaign_map(client)

    filled = []
    errors = []
    for date_br in sorted(gaps_by_date, key=lambda d: datetime.strptime(d, "%d/%m/%Y")):
        tabs_with_gap = gaps_by_date[date_br]
        d = datetime.strptime(date_br, "%d/%m/%Y").date()
        since = d.isoformat()
        until = (d + timedelta(days=6)).isoformat()

        try:
            data = meta_data(client.meta_account_id, token, since, until, tipos_cfg, campaign_map=campaign_map)
        except Exception as e:
            errors.append(f"{date_br}: erro Meta API — {e}")
            continue

        tab_candidates = build_tab_candidates(client, data.get("tipos", {}))
        wrote_any = False
        for tab_name, tipo_data in tab_candidates.items():
            if tab_name not in tabs_with_gap:
                continue
            res = sheets_svc.write_weekly(
                sheet_id=client.sheets_id, tab_name=tab_name, since=since,
                impressoes=tipo_data.get("impressions", 0),
                results=tipo_data.get("results", 0),
                link_clicks=tipo_data.get("link_clicks", 0),
                spend=tipo_data.get("spend", 0.0),
                revenue=tipo_data.get("purchase_value", 0.0),
                sh=sh,
            )
            if res.get("ok"):
                wrote_any = True
            else:
                errors.append(f"{date_br} ({tab_name}): {res.get('error')}")

        if wrote_any:
            filled.append({"date": date_br, "tabs": sorted(tabs_with_gap)})
        time.sleep(1.5)

    return {"filled": filled, "errors": errors}


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
