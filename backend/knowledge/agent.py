import json
import logging
import os
from pydantic import BaseModel, Field
from typing import List, Optional
import litellm
from backend.knowledge.providers.base import RawKnowledgeData

logger = logging.getLogger(__name__)

class KnowledgeProcessingResult(BaseModel):
    ai_summary: str = Field(description="A comprehensive summary of the content")
    key_takeaways: List[str] = Field(description="3-5 key actionable takeaways")
    prerequisites: List[str] = Field(description="What the user should know before consuming this")
    learning_outcomes: List[str] = Field(description="What the user will achieve by consuming this")
    difficulty: str = Field(description="One of: beginner, intermediate, advanced")
    stage: str = Field(description="One of: explore, commit, struggle, master")
    estimated_time: int = Field(description="Estimated reading/watch time in minutes")
    category: str = Field(description="Main category of the content")
    tags: List[str] = Field(description="Relevant tags for the content")

class KnowledgeAgent:
    def __init__(self):
        self.primary_model = os.getenv("ANALYSIS_LLM_MODEL", "groq/llama-3.1-8b-instant")
        self.fallback_model = os.getenv("FALLBACK_LLM_MODEL", "openrouter/meta-llama/llama-3.1-8b-instruct")

    async def process_knowledge(self, raw_data: RawKnowledgeData, user_identity=None) -> KnowledgeProcessingResult:
        prompt = f"""
You are an expert AI Knowledge Curator.
Analyze the following content and extract structured insights.

Title: {raw_data.title}
Description/Content: {raw_data.description or raw_data.raw_content or "No detailed description provided."}
Domain: {raw_data.domain or "General"}
Author: {raw_data.author or "Unknown"}

Generate a comprehensive AI summary, key takeaways, prerequisites, learning outcomes, difficulty level, learning stage, estimated time in minutes, a primary category, and relevant tags.
Return the result strictly as a JSON object matching the requested schema.
"""

        try:
            # Primary LiteLLM Call
            response = litellm.completion(
                model=self.primary_model,
                messages=[{"role": "user", "content": prompt}],
                response_format=KnowledgeProcessingResult,
                max_tokens=1024
            )
            content = response.choices[0].message.content
            return KnowledgeProcessingResult.model_validate_json(content)
        except Exception as e:
            logger.warning(f"Primary LLM failed: {e}. Trying fallback...")
            try:
                # Fallback LiteLLM Call
                response = litellm.completion(
                    model=self.fallback_model,
                    messages=[{"role": "user", "content": prompt}],
                    response_format=KnowledgeProcessingResult,
                    max_tokens=1024
                )
                content = response.choices[0].message.content
                return KnowledgeProcessingResult.model_validate_json(content)
            except Exception as fallback_e:
                logger.error(f"Fallback LLM failed: {fallback_e}. Using deterministic mock mode.")
                return self._get_mock_result(raw_data)

    def _get_mock_result(self, raw_data: RawKnowledgeData) -> KnowledgeProcessingResult:
        return KnowledgeProcessingResult(
            ai_summary=f"This is an auto-generated mock summary for {raw_data.title}.",
            key_takeaways=["Takeaway 1: Understand the basics", "Takeaway 2: Apply to real world"],
            prerequisites=["Basic understanding of the domain"],
            learning_outcomes=["Can apply this knowledge", "Can explain this to others"],
            difficulty="intermediate",
            stage="explore",
            estimated_time=15,
            category=raw_data.domain or "General Knowledge",
            tags=["learning", "mock"]
        )
