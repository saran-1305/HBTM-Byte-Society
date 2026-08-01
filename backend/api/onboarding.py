from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config.database import get_db
from backend.utils.auth import get_current_user_id
from backend.agents.identity.schemas import (
    OnboardingStartRequest, 
    OnboardingSaveRequest,
    IdentityProfileResponse
)
from backend.agents.identity.service import IdentityService

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

@router.post("/start", response_model=IdentityProfileResponse)
async def start_onboarding(
    data: OnboardingStartRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.start_onboarding(user_id, data)

@router.post("/save", response_model=IdentityProfileResponse)
async def save_onboarding(
    data: OnboardingSaveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.save_onboarding(user_id, data)

@router.put("/update", response_model=IdentityProfileResponse)
async def update_onboarding(
    data: OnboardingSaveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # For now, update and save use the same logic
    service = IdentityService(db)
    return await service.save_onboarding(user_id, data)

@router.get("/profile", response_model=IdentityProfileResponse)
async def get_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.get_profile(user_id)

@router.post("/complete", response_model=IdentityProfileResponse)
async def complete_onboarding(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.complete_onboarding(user_id)
