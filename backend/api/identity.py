from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.config.database import get_db
from backend.utils.auth import get_current_user_id
from backend.agents.identity.schemas import IdentityProfileResponse
from backend.agents.identity.service import IdentityService

router = APIRouter(prefix="/api/identity", tags=["identity"])

@router.get("/summary", response_model=IdentityProfileResponse)
async def get_identity_summary(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    service = IdentityService(db)
    return await service.get_profile(user_id)
