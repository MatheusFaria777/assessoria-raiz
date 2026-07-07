from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    type = Column(String, nullable=False)       # weekly / monthly
    platform = Column(String, nullable=False)   # meta / google / combined
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    content = Column(Text, nullable=False)
    raw_data = Column(Text, nullable=True)
    status = Column(String, default="manual")          # manual | pending_review | sent
    auto_generated = Column(Boolean, default=False)
    sent_whatsapp = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="reports")


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    day_of_week = Column(String, nullable=False)   # monday / tuesday / ... / sunday
    report_type = Column(String, default="weekly") # weekly / monthly
    platform = Column(String, default="meta")
    active = Column(Boolean, default=True)

    client = relationship("Client", back_populates="report_schedules")


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    type = Column(String, nullable=False)          # weekly / monthly
    status = Column(String, nullable=False)        # success / error
    rows_synced = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    synced_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="sync_logs")
