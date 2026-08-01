from typing import Dict, Any
from backend.data.arc_config import ARC_CONFIG, StageName
from backend.schemas.stage import StageConfigResponse

class ConfigService:
    def __init__(self):
        # Cache configuration in memory
        self._config = ARC_CONFIG

    def get_all_configs(self) -> Dict[str, StageConfigResponse]:
        """Returns the full ARC configuration."""
        return {
            stage: StageConfigResponse(**config_data) 
            for stage, config_data in self._config.items()
        }

    def get_stage_config(self, stage: str) -> StageConfigResponse:
        """Returns the configuration for a specific stage."""
        if stage not in self._config:
            raise ValueError(f"Invalid stage: {stage}")
        return StageConfigResponse(**self._config[stage])
