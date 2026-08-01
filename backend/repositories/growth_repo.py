from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from backend.models.recommendation import Recommendation
from backend.models.growth_plan import GrowthMilestone
from backend.models.habits import Habit

class CuratorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_recommendations(self, user_id: uuid.UUID, recommendations_data: list):
        # Clear old recommendations for user if they exist
        res = await self.db.execute(select(Recommendation).where(Recommendation.user_id == user_id))
        old_recs = res.scalars().all()
        for rec in old_recs:
            await self.db.delete(rec)
            
        for data in recommendations_data:
            rec = Recommendation(
                user_id=user_id,
                type=data.type,
                title=data.title,
                author=data.author,
                tag=data.tag,
                match_percentage=data.match_percentage
            )
            self.db.add(rec)
        await self.db.commit()

    async def get_recommendations(self, user_id: uuid.UUID):
        res = await self.db.execute(select(Recommendation).where(Recommendation.user_id == user_id))
        return res.scalars().all()

class PlannerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_plan(self, user_id: uuid.UUID, milestones_data: list, habits_data: list):
        # Clear old
        res_m = await self.db.execute(select(GrowthMilestone).where(GrowthMilestone.user_id == user_id))
        for m in res_m.scalars().all():
            await self.db.delete(m)
            
        res_h = await self.db.execute(select(Habit).where(Habit.user_id == user_id))
        for h in res_h.scalars().all():
            await self.db.delete(h)
            
        for m_data in milestones_data:
            m = GrowthMilestone(
                user_id=user_id,
                title=m_data.title,
                status=m_data.status,
                target_date=m_data.target_date,
                progress_percentage=m_data.progress_percentage
            )
            self.db.add(m)
            
        for h_data in habits_data:
            h = Habit(
                user_id=user_id,
                name=h_data.name,
                completed_minutes=h_data.completed_minutes,
                target_minutes=h_data.target_minutes
            )
            self.db.add(h)
            
        await self.db.commit()

    async def get_milestones(self, user_id: uuid.UUID):
        res = await self.db.execute(select(GrowthMilestone).where(GrowthMilestone.user_id == user_id))
        return res.scalars().all()

    async def get_habits(self, user_id: uuid.UUID):
        res = await self.db.execute(select(Habit).where(Habit.user_id == user_id))
        return res.scalars().all()
