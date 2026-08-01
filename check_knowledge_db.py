import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

async def check():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check sources
        print("\n=== KNOWLEDGE SOURCES ===")
        res = await session.execute(text("SELECT id, title, provider FROM knowledge_sources;"))
        sources = res.fetchall()
        for r in sources:
            print(f"- {r[1]} ({r[2]})")
            
        # Check recommendations
        print("\n=== CURATED RECOMMENDATIONS ===")
        res = await session.execute(text("SELECT id, knowledge_source_id, relevance_score, recommendation_reason FROM curated_recommendations;"))
        recs = res.fetchall()
        for r in recs:
            print(f"- Score {r[2]}: {r[3][:50]}...")
            
        print(f"\nTotal Sources: {len(sources)}")
        print(f"Total Recommendations: {len(recs)}")

if __name__ == "__main__":
    asyncio.run(check())
