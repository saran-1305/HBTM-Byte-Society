from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from backend.config.database import Base
from sqlalchemy.sql import func

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    type = Column(String, nullable=False) # 'book', 'video', 'article'
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    tag = Column(String, nullable=False)
    match_percentage = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
