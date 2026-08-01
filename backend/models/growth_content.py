from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from backend.config.database import Base
from datetime import datetime

class GrowthContentType(str, enum.Enum):
    DAILY_INSIGHT = "Daily Growth Insight"
    BOOK_RECOMMENDATION = "Book Recommendation"
    LEARNING_RESOURCE = "Learning Resource"
    REFLECTION_PROMPT = "Reflection Prompt"
    WEEKLY_SUMMARY = "Weekly Growth Summary"
    HABIT_CHALLENGE = "Habit Challenge"
    AI_LEARNING_TIP = "AI Learning Tip"
    INSPIRATIONAL_STORY = "Inspirational Story"

class GrowthContent(Base):
    __tablename__ = "growth_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    content_type = Column(SQLEnum(GrowthContentType))
    generated_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    publishing_jobs = relationship("PublishingJob", back_populates="growth_content")
