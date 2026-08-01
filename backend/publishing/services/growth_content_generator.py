import logging
from sqlalchemy.orm import Session
from backend.models.growth_content import GrowthContent, GrowthContentType
from backend.models.publishing import PublishingJob, PublishingStatus, PlatformAccount
from backend.models.user import User
from typing import Optional

logger = logging.getLogger(__name__)

class GrowthContentGenerator:
    def __init__(self, db: Session):
        self.db = db

    def generate_and_queue(self, user_id: str, content_type: GrowthContentType, content_text: str, account_id: Optional[int] = None) -> PublishingJob:
        """
        Takes raw generated content (e.g. from Recommendation Engine), saves it as GrowthContent,
        and automatically queues it for publishing as a PublishingJob.
        """
        # 1. Save Growth Content
        growth_content = GrowthContent(
            user_id=user_id,
            content_type=content_type,
            generated_content=content_text
        )
        self.db.add(growth_content)
        self.db.commit()
        self.db.refresh(growth_content)

        # 2. Find target account (if none specified, use first connected LinkedIn account)
        if not account_id:
            account = self.db.query(PlatformAccount).filter(
                PlatformAccount.is_connected == True,
                PlatformAccount.platform_name == "LinkedIn"
            ).first()
            if account:
                account_id = account.id
            else:
                logger.warning("No connected LinkedIn account found. Job will remain in DRAFT without an account.")

        # 3. Create Publishing Job
        job = PublishingJob(
            growth_content_id=growth_content.id,
            account_id=account_id,
            status=PublishingStatus.DRAFT,
            created_by="Growth Content Generator"
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)

        return job
