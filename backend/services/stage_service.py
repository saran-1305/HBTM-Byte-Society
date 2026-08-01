from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.data.arc_config import StageName
from backend.models.profile import UserProfile
from backend.models.activity import StageTransitionHistory

class StageService:
    def __init__(self, db: AsyncSession = None):
        self.db = db
        # Define the strict chronological order of stages
        self._ordered_stages = [
            StageName.EXPLORE,
            StageName.COMMIT,
            StageName.STRUGGLE,
            StageName.BREAKTHROUGH,
            StageName.INTEGRATE
        ]

    async def promote_user(self, user_id: UUID) -> None:
        """
        Promotes a user to the next stage if they are not at the final stage.
        Logs the transition to StageTransitionHistory.
        Resets progress to 0.0.
        """
        if not self.db:
            raise ValueError("Database session required for promotion.")

        result = await self.db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise ValueError("UserProfile not found")

        current_stage = profile.current_stage
        next_stage_enum = self.next_stage(current_stage)
        
        if not next_stage_enum:
            # User is at the final stage, clamp progress to 100%
            profile.stage_progress = 100.0
            self.db.add(profile)
            await self.db.commit()
            return

        new_stage = next_stage_enum.value

        # Log transition
        transition = StageTransitionHistory(
            user_id=user_id,
            from_stage=current_stage,
            to_stage=new_stage
        )
        self.db.add(transition)

        # Update profile
        profile.current_stage = new_stage
        profile.stage_progress = 0.0
        
        # Keep backward compatibility with old JSONB history array just in case
        history_list = profile.stage_history if profile.stage_history else []
        history_list.append({"from": current_stage, "to": new_stage})
        profile.stage_history = history_list

        self.db.add(profile)
        await self.db.commit()

    def validate_stage(self, stage_name: str) -> bool:
        """Validates if a given string is a valid stage name."""
        try:
            StageName(stage_name)
            return True
        except ValueError:
            return False

    def next_stage(self, current_stage: str) -> Optional[StageName]:
        """Returns the next stage in the sequence, or None if at the end."""
        try:
            stage_enum = StageName(current_stage)
            current_index = self._ordered_stages.index(stage_enum)
            if current_index + 1 < len(self._ordered_stages):
                return self._ordered_stages[current_index + 1]
            return None
        except ValueError:
            raise ValueError(f"Invalid stage: {current_stage}")

    def previous_stage(self, current_stage: str) -> Optional[StageName]:
        """Returns the previous stage in the sequence, or None if at the start."""
        try:
            stage_enum = StageName(current_stage)
            current_index = self._ordered_stages.index(stage_enum)
            if current_index > 0:
                return self._ordered_stages[current_index - 1]
            return None
        except ValueError:
            raise ValueError(f"Invalid stage: {current_stage}")

    def is_last_stage(self, current_stage: str) -> bool:
        """Checks if the given stage is the final stage."""
        try:
            stage_enum = StageName(current_stage)
            return stage_enum == self._ordered_stages[-1]
        except ValueError:
            raise ValueError(f"Invalid stage: {current_stage}")

    def is_first_stage(self, current_stage: str) -> bool:
        """Checks if the given stage is the first stage."""
        try:
            stage_enum = StageName(current_stage)
            return stage_enum == self._ordered_stages[0]
        except ValueError:
            raise ValueError(f"Invalid stage: {current_stage}")

    def get_all_stages(self) -> List[StageName]:
        """Returns all stage enums in chronological order."""
        return self._ordered_stages.copy()
