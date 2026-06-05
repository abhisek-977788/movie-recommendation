from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# For SQLite, we need connect_args={"check_same_thread": False}
engine_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import models here to ensure they are registered on the Base
    from app.models.user import User
    from app.models.movie import Movie
    from app.models.rating import Rating
    from app.models.review import Review
    from app.models.watch_history import WatchHistory
    from app.models.favorite import Favorite
    
    Base.metadata.create_all(bind=engine)
