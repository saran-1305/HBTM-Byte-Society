import asyncio
from backend.agents.identity.controller import identity_agent
from dotenv import load_dotenv

load_dotenv()

async def test():
    profile_data = {
        "full_name": "Demo User",
        "aspirations": ["Deep Work"],
        "interests": ["Coding"],
        "learning_style": "Visual",
        "available_time": "1 hour"
    }
    try:
        res = await identity_agent.generate_identity_profile(profile_data)
        print("SUCCESS!")
        print(res.json())
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
