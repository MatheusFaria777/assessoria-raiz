from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class ClientCampaign(Base):
    __tablename__ = "client_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    meta_campaign_id = Column(String, nullable=False)
    name = Column(String, nullable=True)          # nome vindo da API Meta
    campaign_type = Column(String, nullable=False) # mensagem, lead, alcance, etc.
    sheet_tab = Column(String, nullable=True)      # aba da planilha para este tipo
    active = Column(Boolean, default=True)

    client = relationship("Client", back_populates="campaigns")
