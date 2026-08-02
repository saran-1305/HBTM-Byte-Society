from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.config.database import get_db
from typing import List
from backend.services.activity_service import ActivityService
from backend.schemas.activity import ActivityStartRequest, ActivityCompleteRequest, ReflectionSubmitRequest, ReflectionHistoryItem

router = APIRouter(tags=["Growth Engine Activity"])

@router.post("/{user_id}/start")
async def start_activity(user_id: UUID, req: ActivityStartRequest, db: AsyncSession = Depends(get_db)):
    service = ActivityService(db)
    try:
        return await service.log_start(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/skip")
async def skip_activity(user_id: UUID, req: ActivityStartRequest, db: AsyncSession = Depends(get_db)):
    service = ActivityService(db)
    try:
        return await service.log_skip(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/complete")
async def complete_activity(user_id: UUID, req: ActivityCompleteRequest, db: AsyncSession = Depends(get_db)):
    service = ActivityService(db)
    try:
        return await service.log_complete(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}/reflection")
async def submit_reflection(user_id: UUID, req: ReflectionSubmitRequest, db: AsyncSession = Depends(get_db)):
    service = ActivityService(db)
    try:
        return await service.log_reflection(user_id, req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/reflections", response_model=List[ReflectionHistoryItem])
async def get_reflections(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = ActivityService(db)
    logs = await service.get_reflection_history(user_id)
    return [
        ReflectionHistoryItem(
            id=str(log.id),
            text=log.reflection or "",
            recommendation_id=log.recommendation_id,
            created_at=log.created_at.isoformat() if log.created_at else "",
        )
        for log in logs
    ]
