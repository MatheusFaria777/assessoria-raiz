from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from models.client import client_campaign_groups


class CampaignGroup(Base):
    __tablename__ = "campaign_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)   # mensagem / lead / engajamento / vendas / alcance / trafego
    color = Column(String, default="#CBA135")
    keywords = Column(Text, nullable=False)  # JSON: ["mensagem", "message", "whatsapp"]
    platform = Column(String, default="meta")   # meta | google | both
    is_global = Column(Boolean, default=True)   # False = exclusivo de um cliente
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    clients = relationship("Client", secondary=client_campaign_groups, back_populates="campaign_groups")
