from pydantic import BaseModel, Field
from typing import Dict, Any, List
from backend.data.arc_config import StageName
from backend.schemas.stage import StageConfigResponse

class ArcResponse(BaseModel):
    current_stage: StageName
    progress: float = Field(..., ge=0.0, le=1.0)
    config: StageConfigResponse

class ProgressUpdate(BaseModel):
    value: float = Field(..., ge=0.0, le=1.0)

class ArcConfigResponse(BaseModel):
    stages: Dict[str, StageConfigResponse]
