import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.config.database import Base

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    content_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    reasoning = Column(JSON, nullable=False)  # Storing the generated reasoning points
    expected_outcome = Column(String, nullable=True)
    reflection_prompt = Column(String, nullable=True)
    feedback = Column(String, nullable=True)  # 'resonated', 'already_knew', etc.
    url = Column(String, nullable=True) # AI generated URL
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recommendations")
