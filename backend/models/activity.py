import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.config.database import Base
import enum

class ActivityAction(enum.Enum):
    START_RESOURCE = "START_RESOURCE"
    COMPLETE_RESOURCE = "COMPLETE_RESOURCE"
    SKIP_RESOURCE = "SKIP_RESOURCE"
    BOOKMARK = "BOOKMARK"
    SUBMIT_REFLECTION = "SUBMIT_REFLECTION"
    LIKE = "LIKE"
    NOT_FOR_ME = "NOT_FOR_ME"
    ALREADY_KNEW = "ALREADY_KNEW"

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    recommendation_id = Column(String, nullable=True)
    action = Column(SQLAlchemyEnum(ActivityAction), nullable=False)
    
    completed = Column(Boolean, default=False)
    reflection = Column(String, nullable=True)
    reflection_analysis = Column(JSONB, nullable=True)
    progress_added = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="activities")

class StageTransitionHistory(Base):
    __tablename__ = "stage_transition_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    from_stage = Column(String, nullable=False)
    to_stage = Column(String, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="stage_transitions")
