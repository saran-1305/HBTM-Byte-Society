import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.services.identity.identity_service import IdentityService
from backend.schemas.identity import IdentityProfileCreate
from backend.services.arc_service import ArcService
import uuid

engine = create_async_engine('postgresql+asyncpg://postgres:Saran%40130507@localhost:5432/hbtm')
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test():
    async with async_session() as db:
        user_id = "123e4567-e89b-12d3-a456-426614174000"
        profile_data = IdentityProfileCreate(
            full_name="saran",
            age=20,
            occupation="learner",
            long_term_goal="chief",
            aspirations=["chief"],
            habits=[]
        )
        
        service = IdentityService(db)
        profile = await service.create_or_update_profile(user_id, profile_data)
        
        arc_service = ArcService(db)
        await arc_service.record_observation(
            user_id=uuid.UUID(user_id),
            observation_type="Identity Updated",
            source_module="identity",
            title="Updated Core Identity & Goals",
            description=f"User clarified their goal: {profile_data.long_term_goal}",
            confidence=1.0,
            trigger_evaluation=True
        )

asyncio.run(test())
