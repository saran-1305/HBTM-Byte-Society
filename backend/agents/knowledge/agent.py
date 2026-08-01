import json
from typing import List, Dict, Any
from backend.providers.llm import llm_provider
from backend.agents.knowledge.schemas import CurationResult

class KnowledgeAgent:
    def __init__(self):
        self.llm = llm_provider

    async def curate_resources(self, profile_data: Dict[str, Any], raw_sources: List[Dict[str, Any]]) -> CurationResult:
        """
        Evaluate a list of raw knowledge sources against a user's identity profile.
        Returns a structured curation result with scores and reasoning.
        """
        if not raw_sources:
            return CurationResult(curated_resources=[])

        # Prepare source text for the LLM
        sources_text = ""
        for idx, src in enumerate(raw_sources):
            sources_text += f"\n--- Resource {idx} ---\n"
            sources_text += f"Title: {src.get('title')}\n"
            sources_text += f"Author: {src.get('author')}\n"
            sources_text += f"Type: {src.get('source_type')}\n"
            sources_text += f"Description: {src.get('description')}\n"

        prompt = f"""You are the core Knowledge Intelligence Engine for a personal growth platform.
Your task is to analyze a list of raw educational resources and curate the best ones for the user based on their Identity Profile.

USER IDENTITY PROFILE:
{json.dumps(profile_data, indent=2)}

AVAILABLE RESOURCES:
{sources_text}

INSTRUCTIONS:
1. Evaluate each resource against the user's goals, learning style, available time, and current skills.
2. Filter out irrelevant resources (give them a low relevance score or omit them).
3. For the top relevant resources, generate a detailed recommendation reason explaining *why* it fits their specific profile.
4. Assign a Priority (1=High, 2=Medium, 3=Low).
5. Assign a Type ('core' or 'supplementary').
6. Return the results referencing the 'source_index' (0 to {len(raw_sources)-1}).

Respond strictly matching the following JSON schema:
{{
  "curated_resources": [
    {{
      "source_index": 0,
      "relevance_score": 95.5,
      "confidence_score": 90.0,
      "recommendation_reason": "...",
      "priority": 1,
      "recommendation_type": "core"
    }}
  ]
}}
"""

        # Call LLM with structured output
        curated_data_dict = await self.llm.generate_json("You are an expert AI curator.", prompt)
        return CurationResult.model_validate(curated_data_dict)

knowledge_agent = KnowledgeAgent()
