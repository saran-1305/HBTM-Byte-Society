from pydantic import BaseModel
from typing import List, Optional

class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    author: str
    url: str
    thumbnail: str
    content_type: str
    domain: str
    stage: str
    estimated_time: str
    difficulty: str
    tags: List[str]

class ScoreBreakdown(BaseModel):
    stage: float
    domain: float
    history: float
    difficulty: float
    total: float

class RankedCandidate(BaseModel):
    candidate: RecommendationItem
    scores: ScoreBreakdown

class RecommendationResponse(BaseModel):
    recommendation: RecommendationItem
    score_breakdown: ScoreBreakdown

class CandidateListResponse(BaseModel):
    candidates: List[RankedCandidate]
