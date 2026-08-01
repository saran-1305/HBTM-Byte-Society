from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from backend.config.database import Base
from sqlalchemy.sql import func

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source = Column(String, nullable=False) # e.g. "YouTube", "Medium" (or provider name)
    source_type = Column(String, nullable=False) # e.g. "video", "article", "book"
    author = Column(String, nullable=True)
    url = Column(String, nullable=False)
    thumbnail = Column(String, nullable=True)
    category = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    tags = Column(JSON, nullable=True) # List of strings
    difficulty = Column(String, nullable=True) # 'beginner', 'intermediate', 'advanced'
    stage = Column(String, nullable=True) # 'explore', 'commit', 'struggle', etc
    language = Column(String, default='en')
    estimated_time = Column(Integer, nullable=True) # in minutes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    summaries = relationship("KnowledgeSummary", back_populates="knowledge_source", cascade="all, delete-orphan")
    bookmarks = relationship("KnowledgeBookmark", back_populates="knowledge_source", cascade="all, delete-orphan")
    history = relationship("KnowledgeHistory", back_populates="knowledge_source", cascade="all, delete-orphan")
    progress = relationship("UserKnowledgeProgress", back_populates="knowledge_source", cascade="all, delete-orphan")


class KnowledgeSummary(Base):
    __tablename__ = "knowledge_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    knowledge_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_sources.id", ondelete="CASCADE"), nullable=False)
    
    ai_summary = Column(String, nullable=False)
    key_takeaways = Column(JSON, nullable=False) # List of strings
    prerequisites = Column(JSON, nullable=True) # List of strings
    learning_outcomes = Column(JSON, nullable=True) # List of strings
    
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    knowledge_source = relationship("KnowledgeSource", back_populates="summaries")


class KnowledgeTag(Base):
    __tablename__ = "knowledge_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeCategory(Base):
    __tablename__ = "knowledge_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class KnowledgeHistory(Base):
    __tablename__ = "knowledge_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    knowledge_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_sources.id", ondelete="CASCADE"), nullable=False)
    
    action = Column(String, nullable=False) # e.g. "viewed", "completed"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    knowledge_source = relationship("KnowledgeSource", back_populates="history")


class UserKnowledgeProgress(Base):
    __tablename__ = "user_knowledge_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    knowledge_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_sources.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String, nullable=False) # "not_started", "in_progress", "completed"
    completion_percentage = Column(Integer, default=0)
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    knowledge_source = relationship("KnowledgeSource", back_populates="progress")


class KnowledgeBookmark(Base):
    __tablename__ = "knowledge_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    knowledge_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_sources.id", ondelete="CASCADE"), nullable=False)
    
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    knowledge_source = relationship("KnowledgeSource", back_populates="bookmarks")
