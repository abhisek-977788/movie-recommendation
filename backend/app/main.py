from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.services.recommendation_service import load_models
from app.routers import auth_router, movies_router, ratings_router, recs_router, chat_router, admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("Initializing Database...")
    init_db()
    
    print("Loading Machine Learning Models...")
    load_models()
    
    yield
    # Shutdown actions
    print("Shutting down...")

app = FastAPI(
    title="CineAI API",
    description="Intelligent Movie Recommendation Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if not origins:
    origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(movies_router)
app.include_router(ratings_router)
app.include_router(recs_router)
app.include_router(chat_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to CineAI API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
def health_check():
    from app.services.recommendation_service import content_model, collab_model
    return {
        "status": "healthy",
        "database": "connected",
        "models": {
            "content_based": "loaded" if content_model is not None else "missing",
            "collaborative_filtering": "loaded" if collab_model is not None else "missing"
        }
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
