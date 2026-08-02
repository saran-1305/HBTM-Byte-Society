from typing import Any, Dict, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.models.identity_profile import IdentityProfile
from backend.models.community import CommunityPost
from backend.repositories.community_repository import CertificationRepository, CommunityRepository
from backend.services.arc_service import ArcService


def _resolve_domain(identity: IdentityProfile) -> str:
    if identity and identity.long_term_goal:
        return identity.long_term_goal
    if identity and identity.aspirations:
        return identity.aspirations[0]
    return "general"


class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cert_repo = CertificationRepository(db)
        self.community_repo = CommunityRepository(db)
        self.arc_service = ArcService(db)

    async def _get_identity(self, user_id: UUID) -> IdentityProfile:
        result = await self.db.execute(select(IdentityProfile).where(IdentityProfile.user_id == user_id))
        return result.scalar_one_or_none()

    async def create_post(self, user_id: UUID, title: str, description: str) -> CommunityPost:
        current_stage = await self.arc_service.get_current_stage(user_id)
        if current_stage != "struggle":
            raise PermissionError("Only users currently in the Struggle stage can post to the community board.")

        identity = await self._get_identity(user_id)
        domain = _resolve_domain(identity)

        post = await self.community_repo.create_post(user_id, domain, title, description)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def list_open_posts_for_mentor(self, user_id: UUID) -> List[CommunityPost]:
        certifications = await self.cert_repo.get_for_user(user_id)
        if not certifications:
            raise PermissionError("Only certified mentors can view the mentor feed.")

        domains = [c.domain for c in certifications]
        posts = await self.community_repo.get_open_posts(domains)
        # A mentor shouldn't see (or reply to) their own post in their own mentor feed.
        return [p for p in posts if p.user_id != user_id]

    async def get_posts_for_user(self, user_id: UUID) -> List[Dict[str, Any]]:
        posts = await self.community_repo.get_posts_for_user(user_id)
        results = []
        for post in posts:
            replies = await self.community_repo.get_replies(post.id)
            results.append({"post": post, "reply_count": len(replies)})
        return results

    async def get_post_detail(self, post_id: UUID) -> Dict[str, Any]:
        post = await self.community_repo.get_post(post_id)
        if not post:
            raise ValueError("Post not found.")
        replies = await self.community_repo.get_replies(post_id)
        return {"post": post, "replies": replies}

    async def reply(self, post_id: UUID, responder_user_id: UUID, content: str):
        post = await self.community_repo.get_post(post_id)
        if not post:
            raise ValueError("Post not found.")

        if post.user_id == responder_user_id:
            raise PermissionError("You can't reply to your own post.")

        is_certified = await self.cert_repo.has_certification(responder_user_id, post.domain)
        if not is_certified:
            raise PermissionError(f"You must be certified in '{post.domain}' to reply to this post.")

        reply = await self.community_repo.create_reply(post_id, responder_user_id, content)
        await self.db.commit()
        await self.db.refresh(reply)
        return reply

    async def resolve_post(self, post_id: UUID, user_id: UUID) -> CommunityPost:
        post = await self.community_repo.get_post(post_id)
        if not post:
            raise ValueError("Post not found.")
        if post.user_id != user_id:
            raise PermissionError("Only the original poster can mark this resolved.")

        post = await self.community_repo.mark_resolved(post)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get_certifications(self, user_id: UUID):
        return await self.cert_repo.get_for_user(user_id)
