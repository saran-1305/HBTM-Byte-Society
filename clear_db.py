import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

async def main():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Clearing all tables...")
        await session.execute(text("DELETE FROM recommendations;"))
        await session.execute(text("DELETE FROM growth_milestones;"))
        await session.execute(text("DELETE FROM habits;"))
        await session.execute(text("DELETE FROM identity_profiles;"))
        await session.commit()
        print("Cleared successfully!")

asyncio.run(main())
