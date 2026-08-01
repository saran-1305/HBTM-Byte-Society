from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from backend.config.database import get_sync_db
from backend.models.publishing import PublishingJob, PlatformAccount
from backend.models.growth_content import GrowthContentType
from backend.publishing.services.content_publishing_service import ContentPublishingService
from backend.publishing.services.growth_content_generator import GrowthContentGenerator
from backend.publishing.providers.oauth import OAuthHandler
from backend.utils.auth import get_current_user_id
from backend.models.user import User

router = APIRouter(prefix="/api/publishing", tags=["publishing"])

class ScheduleRequest(BaseModel):
    growth_content_id: int
    account_id: int
    scheduled_time: datetime

class GenerateRequest(BaseModel):
    content_type: GrowthContentType
    content_text: str
    account_id: int = None

class OAuthConnectRequest(BaseModel):
    platform: str

@router.get("/accounts")
def get_accounts(db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    accounts = svc.get_accounts()
    return [{"id": a.id, "platform_name": a.platform_name, "is_connected": a.is_connected} for a in accounts]

@router.post("/connect")
def connect_account(req: OAuthConnectRequest, db: Session = Depends(get_sync_db)):
    oauth = OAuthHandler(db)
    try:
        url = oauth.get_authorization_url(req.platform)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/callback")
async def oauth_callback(code: str, state: str, db: Session = Depends(get_sync_db)):
    oauth = OAuthHandler(db)
    if not oauth.validate_state(state, "LinkedIn"):
        raise HTTPException(status_code=400, detail="Invalid state parameter")
    
    try:
        token_data = await oauth.exchange_code_for_token("LinkedIn", code)
        access_token = token_data.get("access_token", "")
        
        # Save the real account
        account = PlatformAccount(
            platform_name="LinkedIn",
            account_name="User LinkedIn Account",
            access_token=access_token,
            is_connected=True
        )
        db.add(account)
        db.commit()
        return {"message": "Account connected successfully", "account_id": account.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to exchange token: {str(e)}")

@router.post("/generate")
def generate_content(req: GenerateRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_sync_db)):
    gen = GrowthContentGenerator(db)
    job = gen.generate_and_queue(user_id, req.content_type, req.content_text, req.account_id)
    return {"message": "Content generated and queued", "job_id": job.id}

@router.post("/schedule")
def schedule_post(req: ScheduleRequest, db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    try:
        job = svc.schedule_growth_content(req.growth_content_id, req.account_id, req.scheduled_time)
        return {"message": "Scheduled successfully", "job_id": job.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/publish/{job_id}")
def publish_now(job_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    try:
        job = svc.publish_now(job_id)
        return {"message": "Publishing started", "status": job.status.value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/approve/{job_id}")
def approve_post(job_id: int, db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    try:
        job = svc.approve_job(job_id)
        return {"message": "Job approved", "status": job.status.value}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/queue")
def get_queue(db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    jobs = svc.get_queue()
    return [{"id": j.id, "status": j.status.value, "scheduled_time": j.scheduled_time, "growth_content_id": j.growth_content_id} for j in jobs]

@router.get("/history")
def get_history(db: Session = Depends(get_sync_db)):
    svc = ContentPublishingService(db)
    jobs = svc.get_publishing_jobs(100)
    return [{"id": j.id, "status": j.status.value, "published_at": j.published_at, "url": j.published_url} for j in jobs]
