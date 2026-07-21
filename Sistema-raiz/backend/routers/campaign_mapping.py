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

router = APIRouter()


class CampaignMappingItem(BaseModel):
    meta_campaign_id: str
    name: Optional[str] = None
    campaign_type: str
    sheet_tab: Optional[str] = None
    active: bool = True


class CampaignMappingBulk(BaseModel):
    campaigns: List[CampaignMappingItem]


VALID_TYPES = {
    "mensagem", "lead", "formulario", "engajamento",
    "vendas", "alcance", "trafego", "consignacao", "vagas", "manutencao", "live",
}


@router.get("/meta-campaigns")
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
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro Meta API: {str(e)}")


@router.get("/campaign-mapping")
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
                "name": m.name,
                "campaign_type": m.campaign_type,
                "sheet_tab": m.sheet_tab,
                "active": m.active,
            }
            for m in mappings
        ]
    }


@router.put("/campaign-mapping")
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
            name=item.name,
            campaign_type=item.campaign_type,
            sheet_tab=item.sheet_tab,
            active=item.active,
        ))
    db.commit()
    return {"ok": True, "count": len(body.campaigns)}
