from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class UploadQueueItem(Base):
    __tablename__ = "upload_queue"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    adset_id = Column(Integer, ForeignKey("adsets.id"), nullable=False)
    instagram_url = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending / processing / done / error
    ai_copy = Column(Text, nullable=True)        # copy gerada pela IA
    meta_ad_id = Column(String, nullable=True)   # ID retornado pela Meta API
    error_message = Column(Text, nullable=True)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    client = relationship("Client", back_populates="upload_queue")
    adset = relationship("Adset", back_populates="upload_queue")
