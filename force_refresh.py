import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

async def force_refresh():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        await session.execute(text("DELETE FROM curated_recommendations;"))
        await session.execute(text("DELETE FROM knowledge_sources;"))
        await session.commit()
        print("Database cleared. Next dashboard load will trigger full knowledge pipeline.")

if __name__ == "__main__":
    asyncio.run(force_refresh())
