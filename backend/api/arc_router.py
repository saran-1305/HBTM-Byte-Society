from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from backend.config.database import get_db
from backend.services.arc_service import ArcService
from backend.schemas.arc import (
    ARCProfileResponse,
    ARCObservationResponse,
    ARCStageHistoryResponse,
    ARCEvaluationResponse,
    ARCEvidenceResponse,
    TimelineItemResponse,
    SuggestedAction,
    ObserveRequest,
)

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

async def _run_evaluation(user_id: UUID, db: AsyncSession) -> ARCEvaluationResponse:
    arc_service = ArcService(db)
    evaluation = await arc_service.evaluate_user_state(user_id)
    return evaluation

@router.post("/evaluate/{user_id}", response_model=ARCEvaluationResponse, summary="Force ARC Evaluation")
async def evaluate_arc_state(user_id: UUID, db: AsyncSession = Depends(get_db)):
    return await _run_evaluation(user_id, db)

@router.post("/re-evaluate/{user_id}", response_model=ARCEvaluationResponse, summary="Trigger a complete AI evaluation")
async def re_evaluate_arc_state(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Runs the full Decision Engine pipeline and returns the fresh evaluation, reasoning, and suggested actions."""
    return await _run_evaluation(user_id, db)

@router.get("/evaluation/{user_id}", response_model=ARCEvaluationResponse, summary="Get Latest ARC Evaluation")
async def get_latest_evaluation(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    evaluation = await arc_service.get_latest_evaluation(user_id)
    if not evaluation:
        # No evaluation yet — run one now so the endpoint never returns empty for an active user.
        evaluation = await arc_service.evaluate_user_state(user_id)
    return evaluation

@router.get("/timeline/{user_id}", response_model=List[TimelineItemResponse], summary="Get ARC Evaluation Timeline")
async def get_arc_timeline(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    return await arc_service.get_timeline(user_id)

@router.get("/suggestions/{user_id}", response_model=List[SuggestedAction], summary="Get Current Suggested Actions")
async def get_arc_suggestions(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    return await arc_service.get_suggested_actions(user_id)

@router.get("/evidence/{user_id}", response_model=ARCEvidenceResponse, summary="Get Evidence Behind the Latest Evaluation")
async def get_arc_evidence(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Returns the raw evidence ARC gathered plus the AI's structured breakdown of what it actually used."""
    arc_service = ArcService(db)
    return await arc_service.get_evidence(user_id)

@router.post("/observe/{user_id}", response_model=ARCObservationResponse, summary="Submit an Observation to ARC")
async def observe(user_id: UUID, req: ObserveRequest, db: AsyncSession = Depends(get_db)):
    """
    Generic intake for any module (or external caller) to feed evidence into ARC without
    needing direct access to ArcService. Internal modules still call ArcService.record_observation
    directly where they already hold the session; this exists for callers that don't.
    """
    arc_service = ArcService(db)
    return await arc_service.record_observation(
        user_id=user_id,
        observation_type=req.observation_type,
        source_module=req.source_module,
        title=req.title,
        description=req.description,
        metadata_obj=req.metadata,
        trigger_evaluation=req.trigger_evaluation,
    )

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
