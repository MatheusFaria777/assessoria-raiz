from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Survey(Base):
    """Definição de um formulário de feedback. Apenas um ativo por vez."""
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)           # ex: "NPS Mensal 2026"
    questions = Column(Text, nullable=False)        # JSON: lista de objetos de pergunta
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    responses = relationship("ClientFeedback", back_populates="survey")


class ClientFeedback(Base):
    """Resposta de um cliente a um survey."""
    __tablename__ = "client_feedback"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    survey_id = Column(Integer, ForeignKey("surveys.id"), nullable=True)
    period = Column(String, nullable=False)         # "2026-05"
    respondent_name = Column(String, nullable=True)

    nps_score = Column(Integer, nullable=True)      # extraído das respostas para queries rápidas
    answers = Column(Text, nullable=False)          # JSON: {"q_id": valor, ...}

    ai_summary = Column(Text, nullable=True)        # JSON gerado pelo Claude
    action_items = Column(Text, nullable=True)      # JSON: lista de itens de ação

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    insights_generated_at = Column(DateTime(timezone=True), nullable=True)

    client = relationship("Client", back_populates="feedbacks")
    survey = relationship("Survey", back_populates="responses")
