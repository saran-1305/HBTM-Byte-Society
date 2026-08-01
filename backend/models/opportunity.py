from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.sql import func
import uuid
import enum

from backend.config.database import Base

class OpportunityProviderType(str, enum.Enum):
    DEVPOST = "devpost"
    MLH = "mlh"
    EVENTBRITE = "eventbrite"
    MEETUP = "meetup"
    DUCKDUCKGO = "duckduckgo"
    RSS = "rss"
    CUSTOM = "custom"

class OpportunityFeedbackType(str, enum.Enum):
    APPLIED = "applied"
    BOOKMARKED = "bookmarked"
    IGNORED = "ignored"
    REJECTED = "rejected"
    COMPLETED = "completed"
    LIKED = "liked"

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    url = Column(String, nullable=False, unique=True, index=True)
    provider_name = Column(String, nullable=False)  # Map to OpportunityProviderType
    category = Column(String, nullable=False, index=True) # e.g. Hackathon, Conference
    
    # Details
    required_skills = Column(JSON, default=list)
    location = Column(String, nullable=True)
    is_online = Column(Boolean, default=True)
    difficulty = Column(String, nullable=True) # beginner, intermediate, advanced
    
    # Timing
    deadline = Column(DateTime(timezone=True), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    is_expired = Column(Boolean, default=False)
    
    # Agent metadata
    estimated_time = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OpportunityFeedback(Base):
    """Stores user interaction with opportunities to learn preferences."""
    __tablename__ = "opportunity_feedback"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(PG_UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    feedback_type = Column(String, nullable=False) # Maps to OpportunityFeedbackType
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OpportunityHistory(Base):
    """Tracks what opportunities have been shown to the user (impressions)."""
    __tablename__ = "opportunity_history"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(PG_UUID(as_uuid=True), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    
    # Personalized ranking results specific to this impression
    confidence_score = Column(Float, nullable=False)
    priority_score = Column(Float, nullable=False)
    ai_explanation = Column(String, nullable=False)
    estimated_impact = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
