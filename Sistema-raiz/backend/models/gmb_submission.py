from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class GmbSubmission(Base):
    __tablename__ = "gmb_submissions"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    respondent_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    drive_folder_url = Column(String, nullable=True)
    form_data = Column(Text, nullable=True)   # JSON com todas as respostas
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client")
