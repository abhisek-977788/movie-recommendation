from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.schemas.admin import AnalyticsResponse
from app.schemas.movie import MovieCreate, MovieResponse
from app.schemas.user import UserResponse
from app.models.user import User
from app.models.movie import Movie
from app.models.rating import Rating
from app.models.review import Review
from app.utils.dependencies import get_current_admin
from app.services import movie_service
from datetime import datetime

router = APIRouter(prefix="/api", tags=["admin"])

@router.get("/admin/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_movies = db.query(Movie).count()
    total_ratings = db.query(Rating).count()
    total_reviews = db.query(Review).count()

    # Genres breakdown
    movies = db.query(Movie.genres).all()
    genres_count = {}
    for row in movies:
        if row[0]:
            for g in row[0].split("|"):
                genres_count[g] = genres_count.get(g, 0) + 1
    
    # Recent activity log
    recent_activity = []
    
    # Recent ratings
    ratings = db.query(Rating, User.name, Movie.title).join(User, Rating.user_id == User.id).join(Movie, Rating.movie_id == Movie.id).order_by(Rating.created_at.desc()).limit(5).all()
    for rating, u_name, m_title in ratings:
        recent_activity.append({
            "user_name": u_name,
            "action": f"rated '{m_title}' {rating.rating} stars",
            "timestamp": rating.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Recent reviews
    reviews = db.query(Review, User.name, Movie.title).join(User, Review.user_id == User.id).join(Movie, Review.movie_id == Movie.id).order_by(Review.created_at.desc()).limit(5).all()
    for review, u_name, m_title in reviews:
        recent_activity.append({
            "user_name": u_name,
            "action": f"reviewed '{m_title}' ({review.sentiment})",
            "timestamp": review.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Sort recent activity by timestamp
    recent_activity = sorted(recent_activity, key=lambda x: x["timestamp"], reverse=True)[:6]

    return {
        "total_users": total_users,
        "total_movies": total_movies,
        "total_ratings": total_ratings,
        "total_reviews": total_reviews,
        "popular_genres": genres_count,
        "recent_activity": recent_activity
    }

@router.get("/admin/users", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(User).all()

@router.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    db.delete(user)
    db.commit()
    return {"status": "success", "message": f"User {user.name} deleted successfully"}

@router.post("/admin/movies", response_model=MovieResponse)
def add_movie(
    movie_in: MovieCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = db.query(Movie).filter(Movie.title == movie_in.title, Movie.release_year == movie_in.release_year).first()
    if existing:
        raise HTTPException(status_code=400, detail="Movie already exists")

    new_movie = Movie(**movie_in.model_dump())
    db.add(new_movie)
    db.commit()
    db.refresh(new_movie)
    return new_movie

@router.put("/admin/movies/{movie_id}", response_model=MovieResponse)
def update_movie(
    movie_id: int,
    movie_in: MovieCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    for key, value in movie_in.model_dump().items():
        setattr(movie, key, value)
        
    db.commit()
    db.refresh(movie)
    return movie

@router.delete("/admin/movies/{movie_id}")
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
        
    db.delete(movie)
    db.commit()
    return {"status": "success", "message": f"Movie {movie.title} deleted successfully"}

@router.post("/movies/tmdb/sync")
async def sync_tmdb(
    category: str = Query("popular", description="popular, top_rated or trending"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    synced = await movie_service.sync_tmdb_movies(db, category)
    return {"status": "success", "synced_count": synced}
