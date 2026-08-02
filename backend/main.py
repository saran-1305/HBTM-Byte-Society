from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from backend.api import auth, onboarding, identity, knowledge, opportunities
from backend.api import recommendation_router, arc_router, curator_router, activity_router, community_router, store_router
from backend.config.scheduler import get_scheduler
from backend.opportunities.scheduler_jobs import schedule_discovery_jobs

app = FastAPI(
    title="DASKALOS API",
    description="The backend engine for the HBTM Byte Society",
    version="0.1.0",
    debug=True
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(identity.router)
app.include_router(knowledge.router)
app.include_router(opportunities.router, prefix="/api/opportunities")

app.include_router(recommendation_router.router, prefix="/api/recommendation")
app.include_router(arc_router.router, prefix="/api/arc")
app.include_router(curator_router.router, prefix="/api/curator")
app.include_router(activity_router.router, prefix="/api/activity")
app.include_router(community_router.router, prefix="/api/community")
app.include_router(store_router.router)

@app.on_event("startup")
async def startup_event():
    scheduler = get_scheduler()
    schedule_discovery_jobs(scheduler)
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler = get_scheduler()
    scheduler.shutdown()

@app.get("/")
async def root():
    return {"message": "Welcome to Personal Growth AI Operating System API"}
# Reload backend for Groq
