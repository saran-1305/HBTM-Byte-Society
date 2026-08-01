from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config.database import get_db
from backend.schemas.identity import IdentityProfileCreate, IdentityProfileResponse
from backend.services.identity.identity_service import IdentityService
import uuid

router = APIRouter(prefix="/api/identity", tags=["Identity"])

@router.get("/{user_id}", response_model=IdentityProfileResponse)
async def get_identity(user_id: str, db: AsyncSession = Depends(get_db)):
    service = IdentityService(db)
    profile = await service.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Identity profile not found")
    return profile

@router.post("/{user_id}", response_model=IdentityProfileResponse)
async def upsert_identity(user_id: str, profile_data: IdentityProfileCreate, db: AsyncSession = Depends(get_db)):
    service = IdentityService(db)
    try:
        profile = await service.create_or_update_profile(user_id, profile_data)
        
        # Trigger ARC Observation
        from backend.services.arc_service import ArcService
        arc_service = ArcService(db)
        await arc_service.record_observation(
            user_id=uuid.UUID(user_id),
            observation_type="Identity Updated",
            source_module="identity",
            title="Updated Core Identity & Goals",
            description=f"User clarified their goal: {profile_data.long_term_goal}",
            confidence=1.0,
            trigger_evaluation=True
        )
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
