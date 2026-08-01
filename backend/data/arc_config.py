from enum import Enum

class StageName(str, Enum):
    EXPLORE = "explore"
    COMMIT = "commit"
    STRUGGLE = "struggle"
    BREAKTHROUGH = "breakthrough"
    INTEGRATE = "integrate"

ARC_CONFIG = {
    StageName.EXPLORE.value: {
        "name": "Explore",
        "description": "Discover possibilities and sample new domains.",
        "primary_content_type": "media",
        "secondary_content_type": "knowledge",
        "reflection_enabled": False,
        "wildcard_frequency": 5,
        "stage_color": "#4A90E2",
        "stage_icon": "compass"
    },
    StageName.COMMIT.value: {
        "name": "Commit",
        "description": "Lock in a goal and build foundational habits.",
        "primary_content_type": "knowledge",
        "secondary_content_type": "action",
        "reflection_enabled": True,
        "wildcard_frequency": 3,
        "stage_color": "#F39C12",
        "stage_icon": "flag"
    },
    StageName.STRUGGLE.value: {
        "name": "Struggle",
        "description": "Push through resistance and overcome obstacles.",
        "primary_content_type": "motivation",
        "secondary_content_type": "action",
        "reflection_enabled": True,
        "wildcard_frequency": 1,
        "stage_color": "#E74C3C",
        "stage_icon": "mountain"
    },
    StageName.BREAKTHROUGH.value: {
        "name": "Breakthrough",
        "description": "Experience paradigm shifts and rapid growth.",
        "primary_content_type": "insight",
        "secondary_content_type": "knowledge",
        "reflection_enabled": True,
        "wildcard_frequency": 2,
        "stage_color": "#9B59B6",
        "stage_icon": "bolt"
    },
    StageName.INTEGRATE.value: {
        "name": "Integrate",
        "description": "Solidify gains and turn them into permanent identity.",
        "primary_content_type": "reflection",
        "secondary_content_type": "teaching",
        "reflection_enabled": True,
        "wildcard_frequency": 4,
        "stage_color": "#2ECC71",
        "stage_icon": "puzzle"
    }
}
