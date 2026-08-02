from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from backend.models.community import Certification, CommunityPost, CommunityReply


class CertificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_if_missing(self, user_id: UUID, domain: str) -> Certification:
        existing = await self.get_for_domain(user_id, domain)
        if existing:
            return existing
        cert = Certification(user_id=user_id, domain=domain)
        self.db.add(cert)
        await self.db.flush()
        return cert

    async def get_for_domain(self, user_id: UUID, domain: str) -> Optional[Certification]:
        result = await self.db.execute(
            select(Certification).where(Certification.user_id == user_id, Certification.domain == domain)
        )
        return result.scalar_one_or_none()

    async def get_for_user(self, user_id: UUID) -> List[Certification]:
        result = await self.db.execute(
            select(Certification).where(Certification.user_id == user_id).order_by(desc(Certification.issued_at))
        )
        return result.scalars().all()

    async def has_certification(self, user_id: UUID, domain: str) -> bool:
        cert = await self.get_for_domain(user_id, domain)
        return cert is not None


class CommunityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_post(self, user_id: UUID, domain: str, title: str, description: str) -> CommunityPost:
        post = CommunityPost(user_id=user_id, domain=domain, title=title, description=description)
        self.db.add(post)
        await self.db.flush()
        return post

    async def get_open_posts(self, domains: List[str]) -> List[CommunityPost]:
        if not domains:
            return []
        result = await self.db.execute(
            select(CommunityPost)
            .where(CommunityPost.status == "open", CommunityPost.domain.in_(domains))
            .order_by(desc(CommunityPost.created_at))
        )
        return result.scalars().all()

    async def get_post(self, post_id: UUID) -> Optional[CommunityPost]:
        result = await self.db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
        return result.scalar_one_or_none()

    async def get_posts_for_user(self, user_id: UUID) -> List[CommunityPost]:
        result = await self.db.execute(
            select(CommunityPost).where(CommunityPost.user_id == user_id).order_by(desc(CommunityPost.created_at))
        )
        return result.scalars().all()

    async def create_reply(self, post_id: UUID, responder_user_id: UUID, content: str) -> CommunityReply:
        reply = CommunityReply(post_id=post_id, responder_user_id=responder_user_id, content=content)
        self.db.add(reply)
        await self.db.flush()
        return reply

    async def get_replies(self, post_id: UUID) -> List[CommunityReply]:
        result = await self.db.execute(
            select(CommunityReply).where(CommunityReply.post_id == post_id).order_by(CommunityReply.created_at)
        )
        return result.scalars().all()

    async def mark_resolved(self, post: CommunityPost) -> CommunityPost:
        post.status = "resolved"
        self.db.add(post)
        await self.db.flush()
        return post
