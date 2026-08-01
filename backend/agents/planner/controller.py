from backend.providers.llm import llm_provider
from backend.agents.planner.prompts import PLANNER_SYSTEM_PROMPT, build_planner_user_prompt
from backend.agents.planner.schemas import PlannerResponse

class PlannerAgent:
    @staticmethod
    async def generate_plan_and_habits(profile_data: dict) -> PlannerResponse:
        user_prompt = build_planner_user_prompt(profile_data)
        
        try:
            response_json = await llm_provider.generate_json(
                system_prompt=PLANNER_SYSTEM_PROMPT,
                user_prompt=user_prompt
            )
            return PlannerResponse(**response_json)
        except Exception as e:
            print(f"Planner Agent failed: {e}. Returning mock planner.")
            # Fallback mock data matching Pydantic schema
            mock_data = {
              "milestones": [
                {
                  "title": "Become a Strong AI Engineer",
                  "status": "upcoming",
                  "target_date": "Dec 2025",
                  "progress_percentage": 0
                },
                {
                  "title": "Master System Design",
                  "status": "in_progress",
                  "target_date": "Oct 2024",
                  "progress_percentage": 72
                },
                {
                  "title": "Build Real World Projects",
                  "status": "in_progress",
                  "target_date": "Aug 2024",
                  "progress_percentage": 45
                }
              ],
              "habits": [
                {
                  "name": "Daily Learning",
                  "completed_minutes": 45,
                  "target_minutes": 60
                },
                {
                  "name": "Reading",
                  "completed_minutes": 20,
                  "target_minutes": 30
                },
                {
                  "name": "Exercise",
                  "completed_minutes": 30,
                  "target_minutes": 30
                },
                {
                  "name": "Meditation",
                  "completed_minutes": 10,
                  "target_minutes": 15
                }
              ]
            }
            return PlannerResponse(**mock_data)

planner_agent = PlannerAgent()
