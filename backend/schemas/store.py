from pydantic import BaseModel
from typing import List, Optional

class StoreProduct(BaseModel):
    title: str
    description: str
    price: str
    image_url: str
    store_link: str
    brand: Optional[str] = None
    match_percentage: int

class StoreRecommendationResponse(BaseModel):
    user_id: str
    stage: str
    products: List[StoreProduct]
