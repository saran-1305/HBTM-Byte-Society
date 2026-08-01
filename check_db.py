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
        # Check profiles
        res = await session.execute(text("SELECT full_name, identity_summary FROM identity_profiles;"))
        profiles = res.fetchall()
        print("Profiles:")
        for p in profiles:
            print(f"- {p[0]}: {p[1][:50]}...")
            
        # Check recs
        res2 = await session.execute(text("SELECT title FROM recommendations;"))
        recs = res2.fetchall()
        print("\nRecs:")
        for r in recs:
            print(f"- {r[0]}")
            
asyncio.run(main())
