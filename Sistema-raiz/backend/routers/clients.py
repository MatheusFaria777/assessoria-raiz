from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List
import json

from database import get_db
from models.client import Client, Adset
from models.campaign_group import CampaignGroup
from schemas.client import ClientCreate, ClientUpdate, ClientOut
from config import encrypt, decrypt

router = APIRouter()


def _mask_token(token: str) -> str:
    if not token or len(token) < 12:
        return ""
    return token[:6] + "..." + token[-4:]


@router.get("/", response_model=List[ClientOut])
def list_clients(db: Session = Depends(get_db)):
    clients = (
        db.query(Client)
        .filter(Client.active == True)
        .order_by(Client.name)
        .options(selectinload(Client.campaign_groups), selectinload(Client.adsets))
        .all()
    )
    return clients


@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return client


@router.post("/", response_model=ClientOut)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    client = Client(
        name=data.name,
        has_meta=data.has_meta,
        meta_account_id=data.meta_account_id,
        meta_access_token=encrypt(data.meta_access_token or ""),
        has_google=data.has_google,
        google_customer_id=data.google_customer_id,
        google_credentials=encrypt(data.google_credentials or ""),
        sheets_id=data.sheets_id,
        sheets_tabs=data.sheets_tabs,
        report_days=data.report_days,
        cadencia_ativa=data.cadencia_ativa,
        cadencia_contexto=data.cadencia_contexto,
    )

    # Associar grupos de campanha
    if data.campaign_group_ids:
        groups = db.query(CampaignGroup).filter(CampaignGroup.id.in_(data.campaign_group_ids)).all()
        client.campaign_groups = groups

    db.add(client)
    db.flush()  # obter o ID do cliente

    # Criar adsets
    for ads_data in data.adsets:
        adset = Adset(client_id=client.id, **ads_data.model_dump())
        db.add(adset)

    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    client.name = data.name
    client.has_meta = data.has_meta
    client.meta_account_id = data.meta_account_id
    if data.meta_access_token and not data.meta_access_token.endswith("..."):
        client.meta_access_token = encrypt(data.meta_access_token)
    client.has_google = data.has_google
    client.google_customer_id = data.google_customer_id
    if data.google_credentials and not data.google_credentials.endswith("..."):
        client.google_credentials = encrypt(data.google_credentials)
    client.sheets_id        = data.sheets_id
    client.sheets_tabs      = data.sheets_tabs
    client.report_days      = data.report_days
    client.cadencia_ativa   = data.cadencia_ativa
    client.cadencia_contexto = data.cadencia_contexto

    # Atualizar grupos
    groups = db.query(CampaignGroup).filter(CampaignGroup.id.in_(data.campaign_group_ids)).all()
    client.campaign_groups = groups

    # Atualizar adsets: update in-place para preservar FK da upload_queue
    existing = {a.id: a for a in db.query(Adset).filter(Adset.client_id == client_id).all()}
    seen_ids = set()
    for ads_data in data.adsets:
        raw = ads_data.model_dump(exclude={'id'})
        adset_id = ads_data.id
        if adset_id and adset_id in existing:
            adset = existing[adset_id]
            for k, v in raw.items():
                setattr(adset, k, v)
            seen_ids.add(adset_id)
        else:
            adset = Adset(client_id=client_id, **raw)
            db.add(adset)
    # Remove apenas os adsets que sumiram do payload e não têm fila pendente
    from models.uploader import UploadQueueItem
    for aid, adset in existing.items():
        if aid not in seen_ids:
            has_queue = db.query(UploadQueueItem.id).filter(UploadQueueItem.adset_id == aid).first()
            if not has_queue:
                db.delete(adset)

    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    client.active = False
    db.commit()
    return {"ok": True}


@router.get("/{client_id}/active-ads")
def active_ads(client_id: int, db: Session = Depends(get_db)):
    from services.meta import get_active_ads
    from services.token_manager import get_meta_token

    client = db.query(Client).filter(Client.id == client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not client.has_meta or not client.meta_account_id:
        raise HTTPException(status_code=400, detail="Cliente sem Meta Ads configurado")

    token = get_meta_token(client, db)
    if not token:
        raise HTTPException(status_code=400, detail="Token Meta não configurado")

    try:
        ads = get_active_ads(client.meta_account_id, token)
        return {"ads": ads, "total": len(ads)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")


@router.get("/{client_id}/token-preview")
def token_preview(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    raw = decrypt(client.meta_access_token or "")
    return {"preview": _mask_token(raw)}
