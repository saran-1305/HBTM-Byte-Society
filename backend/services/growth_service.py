from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from backend.models.profile import UserProfile
from backend.models.activity import ActivityAction, ActivityLog
from backend.schemas.activity import ReflectionAnalysis
from backend.services.stage_service import StageService
import logging

logger = logging.getLogger(__name__)

class GrowthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.stage_service = StageService(db)
        self.MAX_PROGRESS_PER_RECOMMENDATION = 40.0

    def calculate_progress(self, action: ActivityAction, analysis: ReflectionAnalysis = None) -> float:
        """
        Rules:
        Completed recommendation +15%
        Submitted reflection +20%
        Reflection quality high +15%
        Reflection quality medium +10%
        Reflection quality low +5%
        Skipped recommendation +0%
        Not for me +2%
        Already knew +5%
        """
        added_progress = 0.0
        
        if action == ActivityAction.COMPLETE_RESOURCE:
            added_progress += 15.0
        elif action == ActivityAction.SUBMIT_REFLECTION:
            added_progress += 20.0
            if analysis:
                quality_points = 0
                if analysis.understanding == "high": quality_points += 5
                elif analysis.understanding == "medium": quality_points += 3
                else: quality_points += 1
                
                if analysis.actionability == "high": quality_points += 5
                elif analysis.actionability == "medium": quality_points += 3
                else: quality_points += 1
                
                if analysis.confidence == "high": quality_points += 5
                elif analysis.confidence == "medium": quality_points += 4
                else: quality_points += 3
                
                added_progress += quality_points
        elif action == ActivityAction.SKIP_RESOURCE:
            added_progress += 0.0
        elif action == ActivityAction.NOT_FOR_ME:
            added_progress += 2.0
        elif action == ActivityAction.ALREADY_KNEW:
            added_progress += 5.0
            
        return added_progress

    async def apply_progress(self, user_id: UUID, progress_added: float) -> bool:
        """
        Adds progress to the user's current stage.
        If it reaches >= 100%, triggers a stage transition via StageService.
        Returns True if a stage promotion occurred, False otherwise.
        """
        # Enforce max progress per single interaction (if needed, though this is usually per-recommendation.
        # Here we just clamp the input if it's somehow over 40 for a single event)
        progress_added = min(progress_added, self.MAX_PROGRESS_PER_RECOMMENDATION)
        
        result = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise ValueError("UserProfile not found")
            
        new_progress = profile.stage_progress + progress_added
        promoted = False
        
        if new_progress >= 100.0:
            # Promote User
            await self.stage_service.promote_user(user_id)
            promoted = True
            # Profile state was modified by promote_user
        else:
            profile.stage_progress = new_progress
            self.db.add(profile)
            await self.db.commit()
            
        return promoted
