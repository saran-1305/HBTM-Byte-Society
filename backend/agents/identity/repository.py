from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
import uuid

from backend.models.identity_profile import IdentityProfile

class IdentityRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: uuid.UUID) -> IdentityProfile:
        result = await self.db.execute(
            select(IdentityProfile).where(IdentityProfile.user_id == user_id)
        )
        return result.scalars().first()

    async def create_profile(self, user_id: uuid.UUID, initial_data: dict) -> IdentityProfile:
        profile = IdentityProfile(user_id=user_id, **initial_data)
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def update_profile(self, user_id: uuid.UUID, update_data: dict) -> IdentityProfile:
        stmt = (
            update(IdentityProfile)
            .where(IdentityProfile.user_id == user_id)
            .values(**update_data)
            .returning(IdentityProfile)
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.scalars().first()
