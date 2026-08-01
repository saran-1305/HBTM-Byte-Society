import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.models.growth_content import GrowthContent
from backend.models.publishing import PublishingJob, PublishingStatus, PlatformAccount
from backend.publishing.orchestrator import PublishingOrchestrator

logger = logging.getLogger(__name__)

class ContentPublishingService:
    def __init__(self, db: Session):
        self.db = db
        self.orchestrator = PublishingOrchestrator(db)

    def schedule_growth_content(self, growth_content_id: int, account_id: int, scheduled_time: datetime, by: str = "User") -> PublishingJob:
        return self.orchestrator.schedule_publish(growth_content_id, account_id, scheduled_time, by)

    def publish_now(self, job_id: int) -> PublishingJob:
        return self.orchestrator.publish_now(job_id)

    def get_publishing_jobs(self, limit: int = 100):
        return self.db.query(PublishingJob).order_by(PublishingJob.created_at.desc()).limit(limit).all()

    def get_accounts(self):
        return self.db.query(PlatformAccount).all()

    def get_queue(self):
        return self.db.query(PublishingJob).filter(
            PublishingJob.status.in_([PublishingStatus.APPROVED, PublishingStatus.SCHEDULED, PublishingStatus.PUBLISHING])
        ).order_by(PublishingJob.scheduled_time.asc()).all()

    def approve_job(self, job_id: int, by: str = "User"):
        job = self.db.query(PublishingJob).filter(PublishingJob.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found")
        if job.status == PublishingStatus.DRAFT:
            job.status = PublishingStatus.APPROVED
            self.db.commit()
            self.db.refresh(job)
        return job
