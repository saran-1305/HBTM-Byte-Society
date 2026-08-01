import asyncio
from backend.config.database import engine, Base
from backend.models.knowledge import KnowledgeSource, KnowledgeSummary, KnowledgeCategory, KnowledgeTag, KnowledgeBookmark, KnowledgeHistory, UserKnowledgeProgress

async def init_db():
    async with engine.begin() as conn:
        # We drop and recreate specifically the knowledge tables to apply the new schema
        print("Dropping tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(init_db())
