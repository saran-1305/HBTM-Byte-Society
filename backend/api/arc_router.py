from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from backend.config.database import get_db
from backend.services.arc_service import ArcService
from backend.services.config_service import ConfigService
from backend.services.stage_service import StageService
from backend.schemas.arc import ArcResponse, ProgressUpdate, ArcConfigResponse
from backend.schemas.stage import StageUpdate
from backend.data.arc_config import StageName

router = APIRouter(tags=["ARC Engine"])

@router.get("/{user_id}", response_model=ArcResponse, summary="Get user ARC state", description="Retrieves the current ARC stage, progress, and stage configuration for a specific user.")
async def get_arc_state(user_id: UUID, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    
    current_stage_name = await arc_service.get_current_stage(user_id)
    progress = await arc_service.get_stage_progress(user_id)
    config = await arc_service.get_stage_configuration(current_stage_name)
    
    return ArcResponse(
        current_stage=StageName(current_stage_name),
        progress=progress,
        config=config
    )

@router.get("/config/all", response_model=ArcConfigResponse, summary="Get full ARC configuration", description="Retrieves the static configuration for all ARC stages.")
async def get_all_configs():
    config_service = ConfigService()
    stages_config = config_service.get_all_configs()
    return ArcConfigResponse(stages=stages_config)

@router.get("/stages/list", response_model=List[StageName], summary="List all ARC stages", description="Returns a chronological list of all valid ARC stages.")
async def list_stages():
    stage_service = StageService()
    return stage_service.get_all_stages()

@router.patch("/{user_id}/progress", response_model=ArcResponse, summary="Update user progress", description="Updates the user's progress in their current stage. Progress must be between 0.0 and 1.0.")
async def update_progress(user_id: UUID, payload: ProgressUpdate, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    
    await arc_service.set_stage_progress(user_id, payload.value)
    
    # Return updated state
    current_stage_name = await arc_service.get_current_stage(user_id)
    progress = await arc_service.get_stage_progress(user_id)
    config = await arc_service.get_stage_configuration(current_stage_name)
    
    return ArcResponse(
        current_stage=StageName(current_stage_name),
        progress=progress,
        config=config
    )

@router.patch("/{user_id}/stage", response_model=ArcResponse, summary="Manually override user stage", description="Manually updates the user's current ARC stage and resets progress to 0.0.")
async def override_stage(user_id: UUID, payload: StageUpdate, db: AsyncSession = Depends(get_db)):
    arc_service = ArcService(db)
    
    try:
        await arc_service.set_stage(user_id, payload.stage.value)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    # Return updated state
    current_stage_name = await arc_service.get_current_stage(user_id)
    progress = await arc_service.get_stage_progress(user_id)
    config = await arc_service.get_stage_configuration(current_stage_name)
    
    return ArcResponse(
        current_stage=StageName(current_stage_name),
        progress=progress,
        config=config
    )

@router.get("/status/{user_id}", summary="Get dynamic ARC status for Growth Engine", description="Returns dynamic progress, unlock status, and transition history.")
async def get_arc_status(user_id: UUID, db: AsyncSession = Depends(get_db)):
    from backend.models.profile import UserProfile
    from sqlalchemy.future import select
    
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    stage_service = StageService(db)
    all_stages = [s.value for s in stage_service.get_all_stages()]
    current_index = all_stages.index(profile.current_stage)
    
    unlocked_stages = all_stages[:current_index + 1]
    next_stage_enum = stage_service.next_stage(profile.current_stage)
    next_stage = next_stage_enum.value if next_stage_enum else None
    
    # We will just fetch the StageTransitionHistory table entries for the user
    from backend.models.activity import StageTransitionHistory
    history_res = await db.execute(
        select(StageTransitionHistory)
        .where(StageTransitionHistory.user_id == user_id)
        .order_by(StageTransitionHistory.completed_at.asc())
    )
    history = history_res.scalars().all()
    
    formatted_history = [
        {
            "from_stage": h.from_stage,
            "to_stage": h.to_stage,
            "completed_at": h.completed_at.isoformat()
        } for h in history
    ]

    return {
        "current_stage": profile.current_stage,
        "progress": profile.stage_progress,
        "unlocked_stages": unlocked_stages,
        "next_stage": next_stage,
        "stage_history": formatted_history
    }

