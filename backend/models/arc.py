import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from backend.config.database import Base
from backend.data.arc_config import StageName

class ARCProfile(Base):
    __tablename__ = "arc_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    current_stage = Column(String, default=StageName.EXPLORE.value, nullable=False)
    stage_started_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # AI Explainability
    current_reasoning = Column(String, nullable=True) # "Why is the user in this stage?"
    ai_observation = Column(String, nullable=True) # "What has the AI noticed lately?"
    suggested_next_action = Column(String, nullable=True) # "What should the user do next?"
    
    last_evaluation_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class ARCObservation(Base):
    """Event-driven log of every activity performed by the user."""
    __tablename__ = "arc_observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    observation_type = Column(String, nullable=False) # e.g. "Reflection Submitted", "Knowledge Completed"
    source_module = Column(String, nullable=False) # e.g. "reflection", "knowledge", "identity"
    title = Column(String, nullable=False) # e.g. "Completed Python Basics"
    description = Column(String, nullable=True)
    metadata_obj = Column(JSONB, nullable=True) # Extra data about the event
    confidence = Column(Float, default=1.0) # Weight of this observation
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ARCStageHistory(Base):
    """Immutable log of stage transitions and the AI's explanation."""
    __tablename__ = "arc_stage_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    previous_stage = Column(String, nullable=True)
    current_stage = Column(String, nullable=False)
    transition_reason = Column(String, nullable=False) # Why did they transition?
    ai_summary = Column(String, nullable=True) # Detailed AI summary of their growth
    
    transitioned_at = Column(DateTime(timezone=True), server_default=func.now())
