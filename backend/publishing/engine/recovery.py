import logging
from backend.models.publishing import PublishingJob, PublishingStatus
from sqlalchemy.orm import Session
from backend.publishing.scheduler.core import schedule_job
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class FailureRecoveryEngine:
    def __init__(self, db: Session):
        self.db = db
        
    def handle_failure(self, job: PublishingJob, error: Exception) -> PublishingStatus:
        error_msg = str(error)
        
        # Determine error type
        if "401" in error_msg or "Unauthorized" in error_msg:
            logger.warning(f"Auth failure for job {job.id}. Manual intervention required.")
            return PublishingStatus.FAILED
            
        if "429" in error_msg or "Rate limit" in error_msg or "Timeout" in error_msg:
            # Temporary error, attempt retry
            if job.retry_count < 3:
                job.retry_count += 1
                # Exponential backoff
                delay_minutes = 5 * (2 ** (job.retry_count - 1))
                next_run = datetime.utcnow() + timedelta(minutes=delay_minutes)
                
                logger.info(f"Temporary failure for job {job.id}. Retrying at {next_run}")
                
                try:
                    schedule_job(job.id, next_run)
                    job.status = PublishingStatus.SCHEDULED
                    self.db.commit()
                    return PublishingStatus.SCHEDULED
                except Exception as e:
                    logger.error(f"Failed to reschedule job {job.id}: {e}")
                    
        # Default fallback is failure
        logger.error(f"Unrecoverable failure for job {job.id}: {error_msg}")
        return PublishingStatus.FAILED
