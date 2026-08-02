from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config.database import get_db
from backend.schemas.store import StoreRecommendationResponse
from backend.services.store_service import StoreService
import traceback

router = APIRouter(prefix="/api/store", tags=["Store"])

@router.get("/{user_id}", response_model=StoreRecommendationResponse)
async def get_store_products(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        service = StoreService(db)
        return await service.get_store_recommendations(user_id)
    except Exception as e:
        print(f"Store API Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
