import asyncio
import sys
import os
sys.path.insert(0, os.getcwd())
from backend.config.database import AsyncSessionLocal
from sqlalchemy import text
async def main():
    async with AsyncSessionLocal() as db:
        await db.execute(text("UPDATE alembic_version SET version_num = 'fb14352050d8';"))
        await db.commit()
asyncio.run(main())
