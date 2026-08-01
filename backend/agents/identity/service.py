import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from backend.agents.identity.repository import IdentityRepository
from backend.agents.identity.controller import identity_agent
from backend.agents.identity.schemas import OnboardingStartRequest, OnboardingSaveRequest

class IdentityService:
    def __init__(self, db: AsyncSession):
        self.repo = IdentityRepository(db)

    async def start_onboarding(self, user_id: str, data: OnboardingStartRequest):
        uid = uuid.UUID(user_id)
        profile = await self.repo.get_by_user_id(uid)
        if profile:
            raise HTTPException(status_code=400, detail="Onboarding already started")
        
        return await self.repo.create_profile(uid, data.model_dump(exclude_unset=True))

    async def save_onboarding(self, user_id: str, data: OnboardingSaveRequest):
        uid = uuid.UUID(user_id)
        profile = await self.repo.get_by_user_id(uid)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found. Start onboarding first.")
        
        return await self.repo.update_profile(uid, data.model_dump(exclude_unset=True))

    async def complete_onboarding(self, user_id: str):
        uid = uuid.UUID(user_id)
        profile = await self.repo.get_by_user_id(uid)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Convert profile to dictionary, removing non-relevant fields for the agent
        profile_data = {
            "full_name": profile.full_name,
            "age": profile.age,
            "occupation": profile.occupation,
            "aspirations": profile.aspirations,
            "interests": profile.interests,
            "current_skills": profile.current_skills,
            "learning_style": profile.learning_style,
            "available_time": profile.available_time,
            "strengths": profile.strengths,
            "weaknesses": profile.weaknesses,
            "habits": profile.habits,
            "challenges": profile.challenges,
            "preferred_content_types": profile.preferred_content_types,
            "long_term_goal": profile.long_term_goal
        }
        
        # Invoke Agent
        agent_output = await identity_agent.generate_identity_profile(profile_data)
        
        # Save Agent Output
        update_data = agent_output.model_dump()
        update_data["onboarding_completed"] = True
        
        # Clear old AI generated data so it gets regenerated on next dashboard visit
        from sqlalchemy.future import select
        from backend.models.recommendation import Recommendation
        from backend.models.growth_plan import GrowthMilestone
        from backend.models.habits import Habit
        
        res_r = await self.repo.db.execute(select(Recommendation).where(Recommendation.user_id == uid))
        for r in res_r.scalars().all():
            await self.repo.db.delete(r)
            
        res_m = await self.repo.db.execute(select(GrowthMilestone).where(GrowthMilestone.user_id == uid))
        for m in res_m.scalars().all():
            await self.repo.db.delete(m)
            
        res_h = await self.repo.db.execute(select(Habit).where(Habit.user_id == uid))
        for h in res_h.scalars().all():
            await self.repo.db.delete(h)
            
        await self.repo.db.commit()
        
        return await self.repo.update_profile(uid, update_data)

    async def get_profile(self, user_id: str):
        uid = uuid.UUID(user_id)
        profile = await self.repo.get_by_user_id(uid)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
