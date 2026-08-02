"""
One-time script: set long_term_goal for the test user.
Run from repo root: ./backend/venv/Scripts/python backend/seed_identity.py
"""
import asyncio
import uuid
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

DATABASE_URL = "postgresql+asyncpg://postgres:Saran%40130507@localhost:5432/hbtm"

from backend.models.identity_profile import IdentityProfile
from backend.models.user import User

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

TEST_USER_ID = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
GOAL = "AI Engineer"

async def main():
    async with AsyncSessionLocal() as db:
        # Ensure user exists
        result = await db.execute(select(User).where(User.id == TEST_USER_ID))
        user = result.scalar_one_or_none()
        if not user:
            user = User(id=TEST_USER_ID, email="testuser@daskalos.ai", hashed_password="mock")
            db.add(user)
            await db.commit()
            print("Created test user.")

        # Upsert IdentityProfile
        result = await db.execute(select(IdentityProfile).where(IdentityProfile.user_id == TEST_USER_ID))
        profile = result.scalar_one_or_none()
        if profile:
            profile.long_term_goal = GOAL
            profile.full_name = "Saran"
            profile.occupation = "Student"
            profile.interests = ["artificial intelligence", "machine learning", "python", "deep learning"]
            await db.commit()
            print(f"Updated identity profile: long_term_goal = '{GOAL}'")
        else:
            profile = IdentityProfile(
                user_id=TEST_USER_ID,
                full_name="Saran",
                occupation="Student",
                long_term_goal=GOAL,
                interests=["artificial intelligence", "machine learning", "python"],
                onboarding_completed=True
            )
            db.add(profile)
            await db.commit()
            print(f"Created identity profile: long_term_goal = '{GOAL}'")

asyncio.run(main())
