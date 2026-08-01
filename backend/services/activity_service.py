from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from backend.models.activity import ActivityLog, ActivityAction
from backend.models.profile import UserProfile
from backend.schemas.activity import ActivityStartRequest, ActivityCompleteRequest, ReflectionSubmitRequest, ReflectionAnalysis
from backend.services.growth_service import GrowthService
from backend.services.reflection_service import ReflectionService

class ActivityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.growth_service = GrowthService(db)
        self.reflection_service = ReflectionService()

    async def log_start(self, user_id: UUID, req: ActivityStartRequest) -> dict:
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.START_RESOURCE
        )
        self.db.add(log)
        await self.db.commit()
        return {"status": "success", "message": "Resource started"}

    async def log_complete(self, user_id: UUID, req: ActivityCompleteRequest) -> dict:
        # Calculate progress
        progress_added = self.growth_service.calculate_progress(ActivityAction.COMPLETE_RESOURCE)
        
        # Apply progress
        promoted = await self.growth_service.apply_progress(user_id, progress_added)
        
        # Update user total_completed
        res = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = res.scalar_one()
        profile.total_completed += 1
        
        # Log activity
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.COMPLETE_RESOURCE,
            completed=True,
            progress_added=progress_added
        )
        self.db.add(log)
        self.db.add(profile)
        await self.db.commit()
        
        return {
            "status": "success",
            "progress_added": progress_added,
            "promoted": promoted
        }

    async def log_reflection(self, user_id: UUID, req: ReflectionSubmitRequest) -> dict:
        # 1. Analyze reflection via LLM
        analysis = await self.reflection_service.analyze_reflection(req)
        
        # 2. Calculate progress based on quality
        progress_added = self.growth_service.calculate_progress(ActivityAction.SUBMIT_REFLECTION, analysis)
        
        # 3. Apply progress
        promoted = await self.growth_service.apply_progress(user_id, progress_added)
        
        # 4. Update user total_reflections
        res = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = res.scalar_one()
        profile.total_reflections += 1
        
        # 5. Log activity
        combined_reflection_text = f"Insight: {req.biggest_insight}\nConfusion: {req.confusion}\nApplication: {req.application}"
        
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.SUBMIT_REFLECTION,
            reflection=combined_reflection_text,
            reflection_analysis=analysis.dict(),
            progress_added=progress_added
        )
        self.db.add(log)
        self.db.add(profile)
        await self.db.commit()
        
        return {
            "status": "success",
            "progress_added": progress_added,
            "promoted": promoted,
            "analysis": analysis
        }
