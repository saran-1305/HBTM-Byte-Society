from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from backend.config.database import Base
from sqlalchemy.sql import func

class GrowthMilestone(Base):
    __tablename__ = "growth_milestones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False)
    status = Column(String, nullable=False) # 'completed', 'in_progress', 'upcoming'
    target_date = Column(String, nullable=True) # e.g. "Dec 2025"
    progress_percentage = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
