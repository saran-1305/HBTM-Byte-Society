from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from backend.config.database import SYNC_DATABASE_URL

db_url = str(SYNC_DATABASE_URL)

jobstores = {
    'default': SQLAlchemyJobStore(url=db_url)
}
executors = {
    'default': ThreadPoolExecutor(20)
}
job_defaults = {
    'coalesce': False,
    'max_instances': 3
}

scheduler = AsyncIOScheduler(jobstores=jobstores, executors=executors, job_defaults=job_defaults)

def get_scheduler():
    return scheduler
