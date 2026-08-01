import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.config.database import Base
from backend.data.arc_config import StageName

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # ARC Engine Data
    current_stage = Column(String, default=StageName.EXPLORE.value, nullable=False)
    stage_progress = Column(Float, default=0.0, nullable=False)
    arc_started_at = Column(DateTime(timezone=True), server_default=func.now())
    arc_updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    stage_history = Column(JSONB, default=list) # Array of historical stage transitions

    # Growth Engine Data (Phase 4)
    total_completed = Column(Integer, default=0, nullable=False) # Number of resources completed
    total_reflections = Column(Integer, default=0, nullable=False) # Number of reflections submitted
    streak = Column(Integer, default=0, nullable=False) # Current learning streak
    last_activity = Column(DateTime(timezone=True), nullable=True) # Timestamp of last activity
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
