from pydantic import BaseModel
from typing import List

class RecommendationItem(BaseModel):
    type: str # 'book', 'video', 'article'
    title: str
    author: str
    tag: str
    match_percentage: int

class CuratorResponse(BaseModel):
    recommendations: List[RecommendationItem]
