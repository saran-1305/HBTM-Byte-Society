from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

from backend.models.profile import UserProfile
from backend.services.config_service import ConfigService
from backend.services.stage_service import StageService
from backend.services.progress_service import ProgressService
from backend.data.arc_config import StageName

class ArcService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.config_service = ConfigService()
        self.stage_service = StageService()
        self.progress_service = ProgressService()

    async def _get_or_create_profile(self, user_id: UUID) -> UserProfile:
        """Fetches the user's ARC profile, creating it if it doesn't exist."""
        result = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalars().first()
        
        if not profile:
            profile = UserProfile(
                user_id=user_id,
                current_stage=StageName.EXPLORE.value,
                stage_progress=0.0,
                stage_history=[]
            )
            self.db.add(profile)
            await self.db.commit()
            await self.db.refresh(profile)
            
        return profile

    async def get_current_stage(self, user_id: UUID) -> str:
        """Returns the current stage string for a user."""
        profile = await self._get_or_create_profile(user_id)
        return profile.current_stage

    async def get_stage_configuration(self, stage_name: str) -> Dict[str, Any]:
        """Returns the configuration for the specified stage."""
        return self.config_service.get_stage_config(stage_name)

    async def get_stage_progress(self, user_id: UUID) -> float:
        """Returns the current progress (0.0 to 1.0) for a user."""
        profile = await self._get_or_create_profile(user_id)
        return profile.stage_progress

    async def set_stage_progress(self, user_id: UUID, value: float) -> float:
        """Updates the progress for a user."""
        profile = await self._get_or_create_profile(user_id)
        new_progress = self.progress_service.set_progress(value)
        profile.stage_progress = new_progress
        await self.db.commit()
        await self.db.refresh(profile)
        return profile.stage_progress

    async def set_stage(self, user_id: UUID, new_stage: str) -> str:
        """Manually overrides and sets a new stage for a user."""
        if not self.stage_service.validate_stage(new_stage):
            raise ValueError(f"Invalid stage: {new_stage}")
            
        profile = await self._get_or_create_profile(user_id)
        
        # Log history
        history = profile.stage_history or []
        history.append({
            "from": profile.current_stage,
            "to": new_stage,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        profile.current_stage = new_stage
        profile.stage_progress = 0.0 # Reset progress when changing stage
        profile.stage_history = history
        
        await self.db.commit()
        await self.db.refresh(profile)
        return profile.current_stage

    async def reset_arc(self, user_id: UUID) -> UserProfile:
        """Resets the ARC state back to the first stage with 0 progress."""
        profile = await self._get_or_create_profile(user_id)
        
        history = profile.stage_history or []
        history.append({
            "from": profile.current_stage,
            "to": StageName.EXPLORE.value,
            "timestamp": datetime.utcnow().isoformat(),
            "reason": "reset"
        })
        
        profile.current_stage = StageName.EXPLORE.value
        profile.stage_progress = 0.0
        profile.stage_history = history
        
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def initialize_arc(self, user_id: UUID) -> UserProfile:
        """Idempotent initialization of a user's ARC."""
        return await self._get_or_create_profile(user_id)
