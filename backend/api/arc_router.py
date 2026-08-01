from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from backend.config.database import get_db
from backend.services.arc_service import ArcService
from backend.schemas.arc import ARCProfileResponse, ARCObservationResponse, ARCStageHistoryResponse

router = APIRouter(tags=["ARC Intelligence Engine"])

@router.get("/profile/{user_id}", response_model=ARCProfileResponse, summary="Get ARC Profile")
async def get_arc_profile(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    profile = await arc_service.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="ARC Profile not found")
    return profile

@router.get("/history/{user_id}", response_model=List[ARCStageHistoryResponse], summary="Get ARC Stage History")
async def get_arc_history(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    return await arc_service.get_history(user_id)

@router.get("/observations/{user_id}", response_model=List[ARCObservationResponse], summary="Get ARC Observations")
async def get_arc_observations(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    return await arc_service.get_recent_observations(user_id, limit=20)

@router.post("/evaluate/{user_id}", response_model=ARCProfileResponse, summary="Force ARC Evaluation")
async def evaluate_arc_state(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    profile = await arc_service.evaluate_user_state(user_id)
    return profile

# Compatibility endpoint for GrowthEngine UI (if it still needs it)
@router.get("/status/{user_id}", summary="Get dynamic ARC status for Growth Engine")
async def get_arc_status(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    profile = await arc_service.get_profile(user_id)
    
    # Just return some defaults for unlocked stages so Growth Plan doesn't break entirely
    return {
        "current_stage": profile.current_stage,
        "progress": 1.0, 
        "unlocked_stages": [profile.current_stage],
        "next_stage": None,
        "stage_history": []
    }
