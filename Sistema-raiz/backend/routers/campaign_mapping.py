"""
Mapeamento explícito de campanhas Meta → tipo + aba de planilha.
Substitui o sistema de keyword detection para clientes configurados.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
from models.client import Client
from models.campaign import ClientCampaign
from services.token_manager import get_meta_token
from services.campaign_config import CAMPAIGN_TYPES, VALID_TYPES, suggest_type, suggest_label

router = APIRouter()


class CampaignMappingItem(BaseModel):
    meta_campaign_id: str
    meta_adset_id: Optional[str] = None  # preenchido = mapeamento é desse conjunto, não da campanha inteira
    name: Optional[str] = None
    label: Optional[str] = None
    campaign_type: str
    sheet_tab: Optional[str] = None
    active: bool = True


class CampaignMappingBulk(BaseModel):
    campaigns: List[CampaignMappingItem]


@router.get("/campaign-mapping/types")
def list_campaign_types():
    """Lista única de tipos de campanha válidos — o frontend consulta em vez de ter cópia própria."""
    return {"types": CAMPAIGN_TYPES}


@router.get("/{client_id}/meta-campaigns")
def list_meta_campaigns(client_id: int, db: Session = Depends(get_db)):
    """Busca campanhas ao vivo da conta Meta do cliente."""
    client = db.query(Client).filter(Client.id == client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    if not client.has_meta or not client.meta_account_id:
        raise HTTPException(status_code=400, detail="Cliente sem Meta Ads configurado")

    token = get_meta_token(client, db)
    if not token:
        raise HTTPException(status_code=400, detail="Token Meta não configurado")

    try:
        from services.meta import get_campaigns_for_account
        campaigns = get_campaigns_for_account(client.meta_account_id, token)
        for c in campaigns:
            c["suggested_type"] = suggest_type(c.get("objective"))
            c["suggested_label"] = suggest_label(c.get("name", ""))
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")


@router.get("/{client_id}/campaigns/{campaign_id}/adsets")
def list_campaign_adsets(client_id: int, campaign_id: str, db: Session = Depends(get_db)):
    """Busca os conjuntos (ad sets) de uma campanha específica — pra separar por vendedor/pessoa."""
    client = db.query(Client).filter(Client.id == client_id, Client.active == True).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    token = get_meta_token(client, db)
    if not token:
        raise HTTPException(status_code=400, detail="Token Meta não configurado")

    try:
        from services.meta import get_adsets_for_campaign
        adsets = get_adsets_for_campaign(client.meta_account_id, token, campaign_id)
        for a in adsets:
            a["suggested_label"] = suggest_label(a.get("name", ""))
        return {"adsets": adsets}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")


@router.get("/{client_id}/campaign-mapping")
def get_campaign_mapping(client_id: int, db: Session = Depends(get_db)):
    """Retorna o mapeamento salvo de campanhas do cliente."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    mappings = db.query(ClientCampaign).filter(ClientCampaign.client_id == client_id).all()
    return {
        "campaigns": [
            {
                "id": m.id,
                "meta_campaign_id": m.meta_campaign_id,
                "meta_adset_id": m.meta_adset_id,
                "name": m.name,
                "label": m.label,
                "campaign_type": m.campaign_type,
                "sheet_tab": m.sheet_tab,
                "active": m.active,
            }
            for m in mappings
        ]
    }


@router.put("/{client_id}/campaign-mapping")
def update_campaign_mapping(client_id: int, body: CampaignMappingBulk, db: Session = Depends(get_db)):
    """Substitui todo o mapeamento de campanhas do cliente (bulk update)."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    for item in body.campaigns:
        if item.campaign_type not in VALID_TYPES:
            raise HTTPException(
                status_code=422,
                detail=f"Tipo inválido: '{item.campaign_type}'. Válidos: {', '.join(sorted(VALID_TYPES))}"
            )

    # Remove mapeamentos antigos e insere os novos
    db.query(ClientCampaign).filter(ClientCampaign.client_id == client_id).delete()
    for item in body.campaigns:
        db.add(ClientCampaign(
            client_id=client_id,
            meta_campaign_id=item.meta_campaign_id,
            meta_adset_id=item.meta_adset_id,
            name=item.name,
            label=item.label,
            campaign_type=item.campaign_type,
            sheet_tab=item.sheet_tab,
            active=item.active,
        ))
    db.commit()
    return {"ok": True, "count": len(body.campaigns)}
