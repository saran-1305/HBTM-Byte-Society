import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from backend.config.database import Base


class Certification(Base):
    """
    A persistent, domain-scoped credential auto-issued when a user's ARC evaluation
    reaches Integrate in that domain. Never reissued or revoked once earned.
    """
    __tablename__ = "certifications"
    __table_args__ = (UniqueConstraint('user_id', 'domain', name='uq_certification_user_domain'),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    domain = Column(String, nullable=False)
    issued_at = Column(DateTime(timezone=True), server_default=func.now())


class CommunityPost(Base):
    """A problem posted by a Struggle-stage user, visible to certified mentors in the same domain."""
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="open", nullable=False)  # "open" | "resolved"
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CommunityReply(Base):
    """A reply from a certified mentor to a CommunityPost."""
    __tablename__ = "community_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("community_posts.id"), nullable=False, index=True)
    responder_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
