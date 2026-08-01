import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from backend.models.user import User
from backend.models.identity_profile import IdentityProfile
from backend.schemas.identity import IdentityProfileCreate

class IdentityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user_id: str) -> Optional[IdentityProfile]:
        try:
            valid_uuid = uuid.UUID(user_id)
        except ValueError:
            return None
            
        result = await self.db.execute(select(IdentityProfile).filter(IdentityProfile.user_id == valid_uuid))
        return result.scalars().first()

    async def create_or_update_profile(self, user_id: str, profile_data: IdentityProfileCreate) -> IdentityProfile:
        try:
            valid_uuid = uuid.UUID(user_id)
        except ValueError:
            raise ValueError("Invalid user ID format. Must be a valid UUID.")

        # 1. Ensure User exists
        user_result = await self.db.execute(select(User).filter(User.id == valid_uuid))
        user = user_result.scalars().first()
        
        if not user:
            # Create a mock user row so FK constraints don't fail
            user = User(id=valid_uuid, email=f"user_{user_id}@test.com", hashed_password="mock")
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)

        # 2. Upsert IdentityProfile
        existing_profile = await self.get_profile(user_id)
        
        if existing_profile:
            existing_profile.full_name = profile_data.full_name
            existing_profile.age = profile_data.age
            existing_profile.occupation = profile_data.occupation
            existing_profile.aspirations = profile_data.aspirations
            existing_profile.habits = profile_data.habits
            existing_profile.onboarding_completed = True
            await self.db.commit()
            await self.db.refresh(existing_profile)
            return existing_profile
        else:
            new_profile = IdentityProfile(
                user_id=valid_uuid,
                full_name=profile_data.full_name,
                age=profile_data.age,
                occupation=profile_data.occupation,
                aspirations=profile_data.aspirations,
                habits=profile_data.habits,
                onboarding_completed=True
            )
            self.db.add(new_profile)
            await self.db.commit()
            await self.db.refresh(new_profile)
            return new_profile
