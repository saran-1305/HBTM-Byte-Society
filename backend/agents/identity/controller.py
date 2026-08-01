from backend.providers.llm import llm_provider
from backend.agents.identity.prompts import IDENTITY_SYSTEM_PROMPT, build_identity_user_prompt
from backend.agents.identity.schemas import IdentitySummaryResponse

class IdentityAgent:
    @staticmethod
    async def generate_identity_profile(raw_profile_data: dict) -> IdentitySummaryResponse:
        user_prompt = build_identity_user_prompt(raw_profile_data)
        
        response_json = await llm_provider.generate_json(
            system_prompt=IDENTITY_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )
        
        # Validate output via Pydantic schema
        return IdentitySummaryResponse(**response_json)

identity_agent = IdentityAgent()
