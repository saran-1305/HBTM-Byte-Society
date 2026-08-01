from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from backend.config.database import get_db
from backend.utils.auth import get_current_user_id
from backend.repositories.growth_repo import CuratorRepository
from backend.agents.identity.repository import IdentityRepository
from backend.agents.curator.controller import curator_agent

router = APIRouter()

@router.get("/")
async def get_recommendations(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    uid = uuid.UUID(user_id)
    repo = CuratorRepository(db)
    
    # Check if we already have recommendations
    existing = await repo.get_recommendations(uid)
    if existing:
        return existing
        
    # If not, lazy generate them!
    id_repo = IdentityRepository(db)
    profile = await id_repo.get_by_user_id(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Identity profile not found")
        
    profile_data = {
        "identity_summary": profile.identity_summary,
        "core_motivations": profile.core_motivations,
        "recommended_learning_approach": profile.recommended_learning_approach,
        "growth_focus_areas": profile.growth_focus_areas
    }
    
    curator_output = await curator_agent.generate_recommendations(profile_data)
    await repo.save_recommendations(uid, curator_output.recommendations)
    
    # Return newly generated
    return await repo.get_recommendations(uid)
