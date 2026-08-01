from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.config.database import get_db
from backend.services.recommendation_engine_service import RecommendationEngineService
from backend.services.recommendation_history_service import RecommendationHistoryService
from backend.schemas.candidate import RecommendationResponse, CandidateListResponse

router = APIRouter(tags=["Recommendation Engine Phase 2"])

@router.get("/{user_id}", response_model=RecommendationResponse, summary="Get Top Recommendation", description="Runs the deterministic backend recommendation engine and returns the highest ranked content item along with its score breakdown.")
async def get_recommendation(user_id: UUID, db: AsyncSession = Depends(get_db)):
    engine_service = RecommendationEngineService(db)
    try:
        response = await engine_service.generate_recommendation(user_id)
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{user_id}/candidates", response_model=CandidateListResponse, summary="Get Ranked Candidate List", description="Returns the entire ranked candidate list with all score breakdowns. Useful for debugging and transparency.")
async def get_candidates(user_id: UUID, db: AsyncSession = Depends(get_db)):
    engine_service = RecommendationEngineService(db)
    try:
        ranked = await engine_service.get_ranked_candidates(user_id)
        return CandidateListResponse(candidates=ranked)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/history/{user_id}", summary="Get Recommendation History", description="Returns the full recommendation history for a user.")
async def get_history(user_id: UUID, db: AsyncSession = Depends(get_db)):
    history_service = RecommendationHistoryService(db)
    history = await history_service.get_full_history(user_id)
    return [{"id": h.id, "content_id": h.content_id, "title": h.title, "stage": h.stage, "created_at": h.created_at} for h in history]
