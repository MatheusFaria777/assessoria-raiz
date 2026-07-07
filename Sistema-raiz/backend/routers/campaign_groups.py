from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.campaign_group import CampaignGroup
from schemas.campaign_group import CampaignGroupCreate, CampaignGroupUpdate, CampaignGroupOut

router = APIRouter()

DEFAULT_GROUPS = [
    {"name": "Campanhas de Mensagem", "type": "mensagem", "color": "#60a5fa",
     "keywords": '["mensagem","message","conversa","whatsapp","inbox"]'},
    {"name": "Campanhas de Lead", "type": "lead", "color": "#4ade80",
     "keywords": '["formulario","formulário","form","lead","cadastro","ficha","inscricao","inscrição"]'},
    {"name": "Campanhas de Engajamento", "type": "engajamento", "color": "#f97316",
     "keywords": '["engajamento","engagement","post","page","curtida"]'},
    {"name": "Campanhas de Vendas", "type": "vendas", "color": "#f43f5e",
     "keywords": '["venda","vendas","sale","sales","compra","conversao","conversão","purchase"]'},
    {"name": "Campanhas de Alcance", "type": "alcance", "color": "#a78bfa",
     "keywords": '["alcance","reach","awareness","reconhecimento"]'},
    {"name": "Campanhas de Tráfego", "type": "trafego", "color": "#22d3ee",
     "keywords": '["trafego","tráfego","traffic","link","clique","cliques"]'},
    {"name": "Campanhas de Consignação", "type": "consignacao", "color": "#CBA135",
     "keywords": '["consignacao","consignação"]'},
    {"name": "Campanhas de Vagas", "type": "vagas", "color": "#94a3b8",
     "keywords": '["vaga","vagas","emprego","contrat","job","recrutamento","selecao","seleção"]'},
]


@router.get("/", response_model=List[CampaignGroupOut])
def list_groups(db: Session = Depends(get_db)):
    groups = db.query(CampaignGroup).filter(CampaignGroup.active == True).order_by(CampaignGroup.name).all()
    if not groups:
        # Seed dos grupos padrão na primeira vez
        for g in DEFAULT_GROUPS:
            db.add(CampaignGroup(**g, is_global=True))
        db.commit()
        groups = db.query(CampaignGroup).filter(CampaignGroup.active == True).all()
    return groups


@router.post("/", response_model=CampaignGroupOut)
def create_group(data: CampaignGroupCreate, db: Session = Depends(get_db)):
    group = CampaignGroup(**data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/{group_id}", response_model=CampaignGroupOut)
def update_group(group_id: int, data: CampaignGroupUpdate, db: Session = Depends(get_db)):
    group = db.query(CampaignGroup).filter(CampaignGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    for k, v in data.model_dump().items():
        setattr(group, k, v)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(CampaignGroup).filter(CampaignGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    group.active = False
    db.commit()
    return {"ok": True}
