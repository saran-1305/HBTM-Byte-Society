from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from backend.config.database import Base
from sqlalchemy.sql import func

class IdentityProfile(Base):
    __tablename__ = "identity_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Raw Data / Basic Info
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    
    # Structured Profile (Generated & Updated by Agent)
    aspirations = Column(JSONB, nullable=True)
    interests = Column(JSONB, nullable=True)
    current_skills = Column(JSONB, nullable=True)
    learning_style = Column(String, nullable=True)
    available_time = Column(String, nullable=True)
    strengths = Column(JSONB, nullable=True)
    weaknesses = Column(JSONB, nullable=True)
    habits = Column(JSONB, nullable=True)
    challenges = Column(JSONB, nullable=True)
    preferred_content_types = Column(JSONB, nullable=True)
    long_term_goal = Column(String, nullable=True)
    
    # Extended Identity Agent Outputs
    identity_summary = Column(String, nullable=True)
    core_motivations = Column(JSONB, nullable=True)
    personality_traits = Column(JSONB, nullable=True)
    recommended_learning_approach = Column(String, nullable=True)
    growth_focus_areas = Column(JSONB, nullable=True)
    confidence_score = Column(Integer, nullable=True) # e.g. 0-100 score of how confident the agent is in this profile
    
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # user = relationship("User", back_populates="identity_profile")
