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
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
