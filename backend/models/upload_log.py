from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from core.database import Base

class UploadLog(Base):
    __tablename__ = "upload_logs"

    id = Column(Integer, primary_key=True, index=True)
    upload_type = Column(String, index=True) # 'courses' | 'students'
    filename = Column(String)
    total_rows = Column(Integer, default=0)
    created_count = Column(Integer, default=0)
    duplicated_count = Column(Integer, default=0)
    duplicated_items = Column(JSON, default=list) # [{ identifier, name, reason }]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
