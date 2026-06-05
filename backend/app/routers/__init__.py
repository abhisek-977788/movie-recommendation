# Router imports
from app.routers.auth import router as auth_router
from app.routers.movies import router as movies_router
from app.routers.ratings import router as ratings_router
from app.routers.recommendations import router as recs_router
from app.routers.chat import router as chat_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "movies_router",
    "ratings_router",
    "recs_router",
    "chat_router",
    "admin_router"
]
