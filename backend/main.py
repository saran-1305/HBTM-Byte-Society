from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from backend.api import auth, onboarding, identity, recommendations, growth

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
app.include_router(recommendations.router, prefix="/api/recommendations")
app.include_router(growth.router, prefix="/api/growth")

@app.get("/")
async def root():
    return {"message": "Welcome to Personal Growth AI Operating System API"}
