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

    # Durable facts the AI has learned about the user across evaluations
    # (recurring struggles, learning preferences, successful patterns)
    memory_notes = Column(JSONB, default=list)

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


class ARCEvaluation(Base):
    """Permanent record of every AI evaluation, whether or not it resulted in a transition."""
    __tablename__ = "arc_evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    stage = Column(String, nullable=False)  # Stage the user was in when evaluated
    decision = Column(String, nullable=False)  # "KEEP" or "CHANGE"

    ai_observation = Column(String, nullable=True)
    reasoning = Column(String, nullable=True)
    transition_explanation = Column(String, nullable=True)

    suggested_actions = Column(JSONB, default=list)  # [{ "action": str, "why": str }, ...]
    evidence_snapshot = Column(JSONB, nullable=True)  # Evidence profile used for this evaluation

    # Structured explainability, distinct from the free-form reasoning prose above
    evidence_used = Column(JSONB, default=list)  # [str, ...] concrete evidence points the AI cited
    recent_changes = Column(String, nullable=True)  # What's different since the last evaluation
    strengths = Column(JSONB, default=list)  # [str, ...]
    weaknesses = Column(JSONB, default=list)  # [str, ...]

    # Forward-looking / narrative framing — makes this read as an ongoing understanding of the
    # user rather than a static stage label
    current_focus = Column(String, nullable=True)
    behaviour_trend = Column(String, nullable=True)
    hidden_opportunity = Column(String, nullable=True)
    future_prediction = Column(String, nullable=True)
    confidence = Column(String, nullable=True)  # "high" | "medium" | "low"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
