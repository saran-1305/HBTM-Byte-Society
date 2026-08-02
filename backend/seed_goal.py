"""
Direct SQL seed: set long_term_goal = 'AI Engineer' for the test user.
Run: ./backend/venv/Scripts/python backend/seed_goal.py
"""
import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:Saran%40130507@localhost:5432/hbtm"
TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000"
GOAL = "AI Engineer"

engine = create_async_engine(DATABASE_URL, echo=False)

async def main():
    async with engine.begin() as conn:
        # Check if profile exists
        result = await conn.execute(
            text("SELECT id FROM identity_profiles WHERE user_id = :uid"),
            {"uid": TEST_USER_ID}
        )
        row = result.fetchone()
        
        if row:
            await conn.execute(
                text("""
                    UPDATE identity_profiles 
                    SET long_term_goal = :goal,
                        full_name = 'Saran',
                        occupation = 'Student',
                        interests = '["artificial intelligence", "machine learning", "python", "deep learning"]'::jsonb
                    WHERE user_id = :uid
                """),
                {"goal": GOAL, "uid": TEST_USER_ID}
            )
            print(f"Updated: long_term_goal = '{GOAL}'")
        else:
            # Ensure user row exists
            await conn.execute(
                text("INSERT INTO users (id, email, hashed_password) VALUES (:id, :email, :pw) ON CONFLICT DO NOTHING"),
                {"id": TEST_USER_ID, "email": "testuser@daskalos.ai", "pw": "mock"}
            )
            await conn.execute(
                text("""
                    INSERT INTO identity_profiles (id, user_id, full_name, occupation, long_term_goal, interests, onboarding_completed)
                    VALUES (gen_random_uuid(), :uid, 'Saran', 'Student', :goal, 
                            '["artificial intelligence", "machine learning", "python"]'::jsonb, true)
                """),
                {"uid": TEST_USER_ID, "goal": GOAL}
            )
            print(f"Created: long_term_goal = '{GOAL}'")

asyncio.run(main())
