from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.config.database import get_db
from backend.services.curator_service import CuratorService
from backend.schemas.curator import CuratorResponse

router = APIRouter(tags=["AI Curator Engine (Phase 3)"])

@router.get("/{user_id}", response_model=CuratorResponse, summary="Get AI Curated Recommendation", description="Combines the deterministic recommendation from Phase 2 with the LLM-generated intelligent reasoning from Phase 3.")
async def get_curated_recommendation(user_id: UUID, db: AsyncSession = Depends(get_db)):
    curator_service = CuratorService(db)
    try:
        response = await curator_service.get_curated_recommendation(user_id)
        return response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
