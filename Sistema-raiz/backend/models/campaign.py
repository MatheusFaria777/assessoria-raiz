from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class ClientCampaign(Base):
    __tablename__ = "client_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    meta_campaign_id = Column(String, nullable=False)
    meta_adset_id = Column(String, nullable=True)  # se preenchido, mapeamento é desse conjunto específico
                                                    # dentro da campanha, não da campanha inteira
    name = Column(String, nullable=True)          # nome vindo da API Meta
    label = Column(String, nullable=True)          # nome curto editável, exibido no relatório/cadência
    campaign_type = Column(String, nullable=False) # mensagem, lead, alcance, etc.
    sheet_tab = Column(String, nullable=True)      # aba da planilha para essa campanha/conjunto
    active = Column(Boolean, default=True)

    client = relationship("Client", back_populates="campaigns")
