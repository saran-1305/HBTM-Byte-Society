from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from backend.api import auth, onboarding, identity, recommendations, growth, knowledge, publishing
from backend.api import recommendation_router, arc_router, curator_router, activity_router
from backend.publishing.scheduler.core import get_scheduler

app = FastAPI(
    title="Personal Growth AI",
    description="Agentic AI Curator API",
    version="1.0.0"
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
app.include_router(growth.router, prefix="/api/growth")
app.include_router(publishing.router)

app.include_router(recommendation_router.router, prefix="/api/recommendation")
app.include_router(arc_router.router, prefix="/api/arc")
app.include_router(curator_router.router, prefix="/api/curator")
app.include_router(activity_router.router, prefix="/api/activity")

@app.on_event("startup")
async def startup_event():
    scheduler = get_scheduler()
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler = get_scheduler()
    scheduler.shutdown()

@app.get("/")
async def root():
    return {"message": "Welcome to Personal Growth AI Operating System API"}
# Reload backend for Groq
