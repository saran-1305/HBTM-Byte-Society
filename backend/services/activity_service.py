from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List
from uuid import UUID
from backend.models.activity import ActivityLog, ActivityAction
from backend.schemas.activity import ActivityStartRequest, ActivityCompleteRequest, ReflectionSubmitRequest, ReflectionAnalysis
from backend.services.reflection_service import ReflectionService
from backend.services.arc_service import ArcService

class ActivityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.reflection_service = ReflectionService()
        self.arc_service = ArcService(db)

    async def log_start(self, user_id: UUID, req: ActivityStartRequest) -> dict:
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.START_RESOURCE
        )
        self.db.add(log)
        await self.db.commit()

        await self.arc_service.record_observation(
            user_id=user_id,
            observation_type="Recommendation Accepted",
            source_module="recommendation",
            title=f"Started recommendation {req.recommendation_id}",
            trigger_evaluation=False,
        )

        return {"status": "success", "message": "Resource started"}

    async def log_skip(self, user_id: UUID, req: ActivityStartRequest) -> dict:
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.SKIP_RESOURCE
        )
        self.db.add(log)
        await self.db.commit()

        await self.arc_service.record_observation(
            user_id=user_id,
            observation_type="Recommendation Ignored",
            source_module="recommendation",
            title=f"Dismissed recommendation {req.recommendation_id}",
            trigger_evaluation=False,
        )

        return {"status": "success", "message": "Resource skipped"}

    async def log_complete(self, user_id: UUID, req: ActivityCompleteRequest) -> dict:
        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.COMPLETE_RESOURCE,
            completed=True,
        )
        self.db.add(log)
        await self.db.commit()

        # Completion is meaningful evidence on its own — ARC re-evaluates immediately,
        # not just when a reflection follows.
        await self.arc_service.record_observation(
            user_id=user_id,
            observation_type="Resource Completed",
            source_module="activity",
            title=f"Completed recommendation {req.recommendation_id}",
            trigger_evaluation=True,
        )

        return {"status": "success"}

    async def log_reflection(self, user_id: UUID, req: ReflectionSubmitRequest) -> dict:
        # 1. Analyze reflection via LLM
        analysis = await self.reflection_service.analyze_reflection(req)

        # 2. Log activity. `confusion`/`application` are only present for the structured,
        # recommendation-linked reflection modal — a freeform journal entry (no recommendation_id)
        # only has the main text.
        if req.confusion or req.application:
            combined_reflection_text = f"Insight: {req.biggest_insight}\nConfusion: {req.confusion or ''}\nApplication: {req.application or ''}"
        else:
            combined_reflection_text = req.biggest_insight

        log = ActivityLog(
            user_id=user_id,
            recommendation_id=req.recommendation_id,
            action=ActivityAction.SUBMIT_REFLECTION,
            reflection=combined_reflection_text,
            reflection_analysis=analysis.dict(),
        )
        self.db.add(log)
        await self.db.commit()

        # 3. Feed evidence to ARC and trigger a fresh evaluation — a reflection is
        # meaningful enough evidence to warrant re-judging the user's stage.
        title = f"Reflection on recommendation {req.recommendation_id}" if req.recommendation_id else "Freeform reflection submitted"
        await self.arc_service.record_observation(
            user_id=user_id,
            observation_type="Reflection Submitted",
            source_module="reflection",
            title=title,
            description=combined_reflection_text,
            metadata_obj=analysis.dict(),
            trigger_evaluation=True,
        )

        latest_evaluation = await self.arc_service.get_latest_evaluation(user_id)

        return {
            "status": "success",
            "analysis": analysis,
            "evaluation": {
                "stage": latest_evaluation.stage,
                "decision": latest_evaluation.decision,
                "ai_observation": latest_evaluation.ai_observation,
                "reasoning": latest_evaluation.reasoning,
            } if latest_evaluation else None,
        }

    async def get_reflection_history(self, user_id: UUID) -> List[ActivityLog]:
        result = await self.db.execute(
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id, ActivityLog.action == ActivityAction.SUBMIT_REFLECTION)
            .order_by(desc(ActivityLog.created_at))
        )
        return result.scalars().all()
