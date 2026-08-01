from pydantic import BaseModel, Field
from typing import List, Optional

class RankedResource(BaseModel):
    source_index: int = Field(..., description="The index of the resource in the provided list")
    relevance_score: float = Field(..., description="0.0 to 100.0 score of how relevant this is to the user's goals")
    confidence_score: float = Field(..., description="0.0 to 100.0 score of how confident you are in this recommendation")
    recommendation_reason: str = Field(..., description="Detailed reasoning explaining why this is recommended for the user")
    priority: int = Field(..., description="1 for High priority (do this now), 2 for Medium, 3 for Low (do later)")
    recommendation_type: str = Field(..., description="'core' for essential learning, 'supplementary' for extra context")

class CurationResult(BaseModel):
    curated_resources: List[RankedResource] = Field(..., description="List of evaluated and ranked resources")
