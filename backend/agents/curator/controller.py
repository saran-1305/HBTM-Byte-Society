from backend.providers.llm import llm_provider
from backend.agents.curator.prompts import CURATOR_SYSTEM_PROMPT, build_curator_user_prompt
from backend.agents.curator.schemas import CuratorResponse

class CuratorAgent:
    @staticmethod
    async def generate_recommendations(profile_data: dict) -> CuratorResponse:
        user_prompt = build_curator_user_prompt(profile_data)
        
        try:
            response_json = await llm_provider.generate_json(
                system_prompt=CURATOR_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            return CuratorResponse(**response_json)
        except Exception as e:
            print(f"Curator Agent failed: {e}. Returning mock recommendations.")
            # Fallback mock data matching Pydantic schema
            mock_data = {
                "recommendations": [
                    {
                        "type": "book",
                        "title": "Designing Data-Intensive Applications",
                        "author": "Martin Kleppmann",
                        "tag": "Deep Work",
                        "match_percentage": 90
                    },
                    {
                        "type": "video",
                        "title": "System Design Interview in 40 Minutes",
                        "author": "Alex Xu",
                        "tag": "System Design",
                        "match_percentage": 88
                    },
                    {
                        "type": "article",
                        "title": "The Mental Models Every Engineer Should Know",
                        "author": "Farnam Street",
                        "tag": "Mental Models",
                        "match_percentage": 85
                    }
                ]
            }
            return CuratorResponse(**mock_data)

curator_agent = CuratorAgent()
