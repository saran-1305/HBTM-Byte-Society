from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from uuid import UUID
from pydantic import BaseModel

from backend.config.database import get_db
from backend.services.opportunity_service import OpportunityService

router = APIRouter(tags=["AI Opportunity Discovery Engine"])

class FeedbackRequest(BaseModel):
    opportunity_id: UUID
    feedback: str

@router.get("/{user_id}", summary="Get active opportunities", description="Retrieves the ranked live opportunities tailored to this user.")
async def get_opportunities(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = OpportunityService(db)
    return await service.get_active_opportunities(user_id)

@router.post("/{user_id}/refresh", summary="Trigger autonomous AI Scout", description="Manually triggers the background worker to fetch new live opportunities from the internet.")
async def refresh_opportunities(user_id: UUID, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    service = OpportunityService(db)
    
    # Run synchronously for immediate feedback or background it
    # We will run it asynchronously to avoid timing out the API request if DDG and LLM take a while.
    # However, for demo purposes, running it synchronously to return the new list is preferred.
    
    try:
        new_list = await service.run_discovery_for_user(user_id)
        return {"status": "success", "message": "Discovery complete.", "opportunities": new_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/feedback", summary="Log feedback", description="Logs user interaction (Applied, Ignored, Liked) to train future AI scouting.")
async def submit_feedback(user_id: UUID, payload: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    service = OpportunityService(db)
    success = await service.log_feedback(user_id, payload.opportunity_id, payload.feedback)
    if success:
        return {"status": "feedback logged"}
    raise HTTPException(status_code=400, detail="Failed to log feedback")
