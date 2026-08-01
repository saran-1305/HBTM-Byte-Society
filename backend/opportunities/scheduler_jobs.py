import logging
import asyncio
from sqlalchemy.future import select

from backend.config.database import AsyncSessionLocal
from backend.models.user import User
from backend.services.opportunity_service import OpportunityService

logger = logging.getLogger(__name__)

async def _refresh_opportunities_for_all_users():
    """Iterates through all users and runs the discovery agent."""
    logger.info("Starting background Opportunity Discovery job...")
    
    async with AsyncSessionLocal() as session:
        # Get all active users
        result = await session.execute(select(User.id))
        users = result.scalars().all()
        
        service = OpportunityService(session)
        for user_id in users:
            try:
                logger.info(f"Running autonomous scout for user {user_id}")
                await service.run_discovery_for_user(user_id)
            except Exception as e:
                logger.error(f"Failed to run scout for user {user_id}: {e}")
                
    logger.info("Background Opportunity Discovery job completed.")

def refresh_opportunities_job():
    """Synchronous wrapper for the APScheduler to execute the async job."""
    # APScheduler supports async natively if using AsyncIOScheduler, but if called by ThreadPoolExecutor we must run event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_refresh_opportunities_for_all_users())
    finally:
        loop.close()

def schedule_discovery_jobs(scheduler):
    """Hooks the jobs into the APScheduler instance."""
    scheduler.add_job(
        refresh_opportunities_job,
        'interval',
        hours=6,
        id='background_opportunity_discovery',
        replace_existing=True
    )
    logger.info("Registered background Opportunity Discovery job to run every 6 hours.")
