from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from backend.config.database import Base
from datetime import datetime

class PublishingStatus(str, enum.Enum):
    DRAFT = "Draft"
    REVIEWED = "Reviewed"
    APPROVED = "Approved"
    SCHEDULED = "Scheduled"
    PUBLISHING = "Publishing"
    PUBLISHED = "Published"
    PARTIALLY_PUBLISHED = "Partially Published"
    VERIFIED_PUBLISHED = "Verified Published"
    VERIFICATION_FAILED = "Verification Failed"
    FAILED = "Failed"
    ARCHIVED = "Archived"

class PlatformAccount(Base):
    __tablename__ = "platform_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    platform_name = Column(String, index=True)  # LinkedIn
    account_name = Column(String)
    access_token = Column(String)
    refresh_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    permissions = Column(Text, nullable=True) # JSON stored as string
    platform_user_id = Column(String, nullable=True)
    platform_username = Column(String, nullable=True)
    is_connected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    jobs = relationship("PublishingJob", back_populates="account")

class PublishingApproval(Base):
    __tablename__ = "publishing_approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    growth_content_id = Column(Integer, ForeignKey("growth_contents.id", ondelete="CASCADE"))
    approved_by = Column(String)
    approved_at = Column(DateTime, default=datetime.utcnow)

class PublishingJob(Base):
    __tablename__ = "publishing_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    growth_content_id = Column(Integer, ForeignKey("growth_contents.id", ondelete="CASCADE"))
    account_id = Column(Integer, ForeignKey("platform_accounts.id", ondelete="CASCADE"))
    status = Column(SQLEnum(PublishingStatus), default=PublishingStatus.APPROVED)
    scheduled_time = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    verified_published_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0)
    readiness_score = Column(Integer, nullable=True)
    validation_report = Column(Text, nullable=True) # JSON stored as string
    platform_post_id = Column(String, nullable=True)
    published_url = Column(String, nullable=True)
    api_response = Column(Text, nullable=True) # JSON stored as string
    request_duration_ms = Column(Integer, nullable=True)
    created_by = Column(String, default="System")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("PlatformAccount", back_populates="jobs")
    growth_content = relationship("GrowthContent", back_populates="publishing_jobs")
    logs = relationship("PublishLog", back_populates="job", cascade="all, delete-orphan")
    errors = relationship("PublishingError", back_populates="job", cascade="all, delete-orphan")
    history = relationship("PublishingHistory", back_populates="job", cascade="all, delete-orphan")

class PublishLog(Base):
    __tablename__ = "publishing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    action = Column(String) # e.g. "Started", "API Request", "API Response"
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="logs")

class PublishingError(Base):
    __tablename__ = "publishing_errors"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    error_message = Column(Text)
    error_code = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="errors")

class PublishingHistory(Base):
    __tablename__ = "publishing_history"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("publishing_jobs.id", ondelete="CASCADE"))
    previous_status = Column(String)
    new_status = Column(String)
    changed_by = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    job = relationship("PublishingJob", back_populates="history")

class OAuthState(Base):
    __tablename__ = "oauth_states"
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, unique=True, index=True)
    platform_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
