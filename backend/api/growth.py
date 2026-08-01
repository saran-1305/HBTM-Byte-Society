from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from backend.config.database import get_db
from backend.utils.auth import get_current_user_id
from backend.repositories.growth_repo import PlannerRepository
from backend.agents.identity.repository import IdentityRepository
from backend.agents.planner.controller import planner_agent

router = APIRouter()

@router.get("/plan")
async def get_growth_plan(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    uid = uuid.UUID(user_id)
    repo = PlannerRepository(db)
    
    # Check if we already have milestones
    existing_milestones = await repo.get_milestones(uid)
    existing_habits = await repo.get_habits(uid)
    if existing_milestones and existing_habits:
        return {
            "milestones": existing_milestones,
            "habits": existing_habits
        }
        
    # Lazy generate them!
    id_repo = IdentityRepository(db)
    profile = await id_repo.get_by_user_id(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Identity profile not found")
        
    profile_data = {
        "identity_summary": profile.identity_summary,
        "long_term_goal": profile.long_term_goal,
        "available_time": profile.available_time,
        "growth_focus_areas": profile.growth_focus_areas
    }
    
    planner_output = await planner_agent.generate_plan_and_habits(profile_data)
    await repo.save_plan(uid, planner_output.milestones, planner_output.habits)
    
    # Return newly generated
    new_milestones = await repo.get_milestones(uid)
    new_habits = await repo.get_habits(uid)
    
    return {
        "milestones": new_milestones,
        "habits": new_habits
    }
