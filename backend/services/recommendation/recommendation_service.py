from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from backend.services.recommendation.context_builder import ContextBuilder
from backend.services.recommendation.retrieval_service import RetrievalService
from backend.services.recommendation.ai_service import AIService
from backend.services.recommendation.reasoning_service import ReasoningService
from backend.services.recommendation.history_service import HistoryService
from backend.models.user import User

class RecommendationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.context_builder = ContextBuilder()
        self.retrieval_service = RetrievalService()
        self.ai_service = AIService()
        self.reasoning_service = ReasoningService(self.ai_service)
        self.history_service = HistoryService(db)

    async def generate_recommendation(self, user_id: str) -> Dict[str, Any]:
        """
        Orchestrates the entire recommendation flow.
        """
        import uuid
        try:
            valid_uuid = uuid.UUID(user_id)
            result = await self.db.execute(select(User).filter(User.id == valid_uuid))
            user = result.scalars().first()
        except ValueError:
            user = None
            valid_uuid = uuid.uuid4()

        if not user:
            print(f"Warning: User {user_id} not found or invalid UUID in DB. Creating a mock user for testing.")
            user_id = str(valid_uuid)
            user = User(id=valid_uuid, email=f"mock_{user_id}@test.com", hashed_password="mock")
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)

        from backend.services.identity.identity_service import IdentityService
        identity_service = IdentityService(self.db)
        
        actual_user_id = str(user.id) if user else user_id
        profile = await identity_service.get_profile(actual_user_id)
        
        if profile:
            user_profile = {
                "aspiration": ", ".join(profile.aspirations) if profile.aspirations else "Grow",
                "stage": "Intermediate", # Defaulting, or map if we add it
                "domain": profile.occupation or "General",
                "habits": profile.habits or []
            }
        else:
            print(f"Warning: No identity profile found for {actual_user_id}. Using fallback.")
            user_profile = {
                "aspiration": "Become a 10x Engineer and confident speaker.",
                "stage": "Beginner",
                "domain": "Software Engineering",
                "habits": ["Read 15m daily"]
            }
        # Get today's cached recommendations first
        actual_user_id = str(user.id) if user else user_id
        todays_history = await self.history_service.get_today(actual_user_id)
        if len(todays_history) >= 5:
            # We already generated a feed today! Return it instantly.
            results = []
            for record in todays_history:
                results.append({
                    "recommendation": {
                        "id": record.id,
                        "content_id": record.content_id,
                        "title": record.title,
                        "type": record.type,
                        "description": "",
                        "estimated_time": "",
                        "url": getattr(record, "url", "")
                    },
                    "reasoning": record.reasoning,
                    "expected_outcome": record.expected_outcome or "",
                    "reflection_prompt": "How did this recommendation help you move closer to your aspiration?",
                    "created_at": str(record.created_at)
                })
            return {"items": results}

        # Get recent history for context
        recent_history = await self.history_service.get_recent(user_id)
        
        # Build Context
        context = self.context_builder.build_context(user_profile, recent_history, available_time=60)
        
        # Retrieve Candidates
        previously_recommended_ids = await self.history_service.avoid_duplicates(user_id)
        candidates = self.retrieval_service.retrieve_candidates(context, previously_recommended_ids)
        
        # Send Context + Candidates to AI
        ai_response = self.ai_service.generate_recommendation(context, candidates)
        recommendations_list = ai_response.get("recommendations", [])
        
        # Fallback if AI didn't format correctly
        if not recommendations_list:
             recommendations_list = [ai_response]
             
        actual_user_id = str(user.id) if user else user_id
        
        results = []
        for rec_data in recommendations_list:
            # Generate Explanation (Reasoning)
            reasoning = self.reasoning_service.generate_reasoning(rec_data, context)
            
            # Save Recommendation
            history_record = await self.history_service.save(actual_user_id, rec_data, reasoning)
            
            # Build Response Item
            results.append({
                "recommendation": {
                    "id": history_record.id,
                    "content_id": history_record.content_id,
                    "title": history_record.title,
                    "type": history_record.type,
                    "description": rec_data.get("description", ""),
                    "estimated_time": rec_data.get("estimated_time", ""),
                    "url": rec_data.get("url", "")
                },
                "reasoning": history_record.reasoning,
                "expected_outcome": history_record.expected_outcome or "",
                "reflection_prompt": "How did this recommendation help you move closer to your aspiration?",
                "created_at": str(history_record.created_at)
            })
        
        return {"items": results}
