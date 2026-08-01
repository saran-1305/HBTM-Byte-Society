from pydantic import BaseModel
from backend.data.arc_config import StageName

class StageConfigResponse(BaseModel):
    name: str
    description: str
    primary_content_type: str
    secondary_content_type: str
    reflection_enabled: bool
    wildcard_frequency: int
    stage_color: str
    stage_icon: str

class StageUpdate(BaseModel):
    stage: StageName
