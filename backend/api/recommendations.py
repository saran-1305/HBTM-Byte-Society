from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config.database import get_db
from backend.services.recommendation.recommendation_service import RecommendationService
from backend.services.recommendation.history_service import HistoryService
from backend.schemas.recommendation import FeedbackRequest, RecommendationResponse, RecommendationListResponse
from typing import Dict, Any

router = APIRouter(tags=["recommendations"])

@router.get("/{user_id}", response_model=RecommendationListResponse)
async def get_recommendation(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get exactly ONE curated recommendation for the user.
    """
    service = RecommendationService(db)
    try:
        response = await service.generate_recommendation(user_id)
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error generating recommendation: {str(e)}")

@router.post("/{user_id}/feedback")
async def submit_feedback(user_id: str, request: FeedbackRequest, db: AsyncSession = Depends(get_db)):
    """
    Submit feedback for a recommendation.
    """
    history_service = HistoryService(db)
    record = await history_service.update_feedback(request.recommendation_id, request.reaction)
    
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
        
    return {"message": "Feedback submitted successfully", "recommendation_id": record.id, "reaction": record.feedback}
