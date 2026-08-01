import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from backend.models.opportunity import Opportunity, OpportunityHistory, OpportunityFeedback, OpportunityFeedbackType
from backend.models.profile import UserProfile
from backend.opportunities.agent import OpportunityAgent

logger = logging.getLogger(__name__)

class OpportunityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.agent = OpportunityAgent(db)

    async def get_active_opportunities(self, user_id: UUID):
        """Fetches ranked, unexpired opportunities for the user."""
        # Subquery for opportunities that have user feedback (ignored, applied, etc.)
        feedback_subq = (
            select(OpportunityFeedback.opportunity_id)
            .where(OpportunityFeedback.user_id == user_id)
        ).subquery()
        
        query = (
            select(Opportunity, OpportunityHistory)
            .join(OpportunityHistory, Opportunity.id == OpportunityHistory.opportunity_id)
            .where(OpportunityHistory.user_id == user_id)
            .where(Opportunity.is_expired == False)
            .where(Opportunity.id.not_in(select(feedback_subq)))
            .order_by(OpportunityHistory.priority_score.desc())
        )
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "id": opp.id,
                "title": opp.title,
                "description": opp.description,
                "url": opp.url,
                "provider_name": opp.provider_name,
                "category": opp.category,
                "difficulty": opp.difficulty,
                "estimated_time": opp.estimated_time,
                "confidence_score": hist.confidence_score,
                "priority_score": hist.priority_score,
                "ai_explanation": hist.ai_explanation,
                "estimated_impact": hist.estimated_impact
            }
            for opp, hist in rows
        ]

    async def run_discovery_for_user(self, user_id: UUID):
        """Runs the AI Agent to discover and rank live opportunities, then saves them."""
        from backend.services.arc_service import ArcService
        from backend.models.identity_profile import IdentityProfile
        
        # Get or create user profile lazily
        arc_service = ArcService(self.db)
        try:
            profile = await arc_service.initialize_arc(user_id)
            
            id_result = await self.db.execute(select(IdentityProfile).where(IdentityProfile.user_id == user_id))
            identity = id_result.scalar_one_or_none()
            if not identity:
                # Mock identity if not exist
                identity = IdentityProfile(long_term_goal="Growth", aspirations="General Improvement", current_skills=[], interests=[])
        except Exception as e:
            logger.warning(f"Cannot run discovery for missing user {user_id}: {e}")
            return []
            
        # Run agent
        ranked_results = await self.agent.discover_and_rank(profile, identity)
        
        for item in ranked_results:
            raw = item["raw"]
            rank = item["rank"]
            
            # Upsert Opportunity
            opp_query = select(Opportunity).where(Opportunity.url == raw.url)
            opp_result = await self.db.execute(opp_query)
            opp = opp_result.scalar_one_or_none()
            
            if not opp:
                opp = Opportunity(
                    title=raw.title,
                    description=raw.description,
                    url=raw.url,
                    provider_name=raw.provider_name,
                    category=rank.category,
                    difficulty=rank.difficulty,
                    estimated_time=rank.estimated_time
                )
                self.db.add(opp)
                try:
                    await self.db.commit()
                    await self.db.refresh(opp)
                except IntegrityError:
                    await self.db.rollback()
                    continue
                    
            # Check if history already exists for this user and opportunity
            hist_query = select(OpportunityHistory).where(
                OpportunityHistory.user_id == user_id,
                OpportunityHistory.opportunity_id == opp.id
            )
            hist_result = await self.db.execute(hist_query)
            history = hist_result.scalar_one_or_none()
            
            if not history:
                history = OpportunityHistory(
                    user_id=user_id,
                    opportunity_id=opp.id,
                    confidence_score=rank.confidence_score,
                    priority_score=rank.priority_score,
                    ai_explanation=rank.ai_explanation,
                    estimated_impact=rank.estimated_impact
                )
                self.db.add(history)
            else:
                # Update scores if we found it again
                history.confidence_score = rank.confidence_score
                history.priority_score = rank.priority_score
                history.ai_explanation = rank.ai_explanation
                
        await self.db.commit()
        return await self.get_active_opportunities(user_id)

    async def log_feedback(self, user_id: UUID, opportunity_id: UUID, feedback: str):
        """Records user feedback on an opportunity."""
        fb = OpportunityFeedback(
            user_id=user_id,
            opportunity_id=opportunity_id,
            feedback_type=feedback
        )
        self.db.add(fb)
        await self.db.commit()
        return True
