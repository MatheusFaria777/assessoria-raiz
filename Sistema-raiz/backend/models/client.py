from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

client_campaign_groups = Table(
    "client_campaign_groups",
    Base.metadata,
    Column("client_id", Integer, ForeignKey("clients.id"), primary_key=True),
    Column("campaign_group_id", Integer, ForeignKey("campaign_groups.id"), primary_key=True),
)


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Meta Ads
    has_meta = Column(Boolean, default=False)
    meta_account_id = Column(String, nullable=True)
    meta_access_token = Column(Text, nullable=True)  # criptografado
    meta_token_expires = Column(DateTime(timezone=True), nullable=True)

    # Google Ads
    has_google = Column(Boolean, default=False)
    google_customer_id = Column(String, nullable=True)
    google_credentials = Column(Text, nullable=True)  # JSON criptografado

    # Google Sheets
    sheets_id   = Column(String, nullable=True)
    sheets_tabs = Column(Text, nullable=True)  # JSON: {"mensagem": "MENSAGEM", "alcance": "ALCANCE"}

    # Relatório automático
    report_days = Column(String, nullable=True)  # JSON: ["monday", "friday"]

    # Feedback / NPS
    feedback_slug = Column(String, nullable=True, unique=True)  # ex: "rt-motors"

    # Cadência semanal de comunicação
    cadencia_ativa = Column(Boolean, default=True)
    cadencia_contexto = Column(Text, nullable=True)  # notas do cliente para personalizar as mensagens

    # Relacionamentos
    adsets = relationship("Adset", back_populates="client", cascade="all, delete-orphan")
    campaign_groups = relationship("CampaignGroup", secondary=client_campaign_groups, back_populates="clients")
    reports = relationship("Report", back_populates="client", cascade="all, delete-orphan")
    sync_logs = relationship("SyncLog", back_populates="client", cascade="all, delete-orphan")
    upload_queue = relationship("UploadQueueItem", back_populates="client", cascade="all, delete-orphan")
    report_schedules = relationship("ReportSchedule", back_populates="client", cascade="all, delete-orphan")
    feedbacks = relationship("ClientFeedback", back_populates="client", cascade="all, delete-orphan")


class Adset(Base):
    __tablename__ = "adsets"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    label = Column(String, nullable=False)  # ex: "Seminovos", "Motos"
    adset_id = Column(String, nullable=False)
    page_id = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    instagram_actor_id = Column(String, nullable=True)
    store_name = Column(String, nullable=True)
    store_description = Column(Text, nullable=True)
    store_address = Column(String, nullable=True)
    store_phone = Column(String, nullable=True)
    store_whatsapp_display = Column(String, nullable=True)
    store_website = Column(String, nullable=True)
    template_ad_id = Column(String, nullable=True)  # ID de anúncio com WABA configurado para duplicar
    lead_gen_form_id = Column(String, nullable=True)  # ID do formulário instantâneo (lead gen)
    active = Column(Boolean, default=True)

    client = relationship("Client", back_populates="adsets")
    upload_queue = relationship("UploadQueueItem", back_populates="adset")
