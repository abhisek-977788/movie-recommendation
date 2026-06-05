from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.movie import RecommendationResponse, MovieResponse, CustomRecommendationRequest
from app.services import recommendation_service
from app.models.user import User
from app.models.rating import Rating
from app.models.favorite import Favorite
from app.models.movie import Movie
from app.utils.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api", tags=["recommendations"])

@router.get("/recommendations/me", response_model=List[RecommendationResponse])
def get_my_recommendations(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Detect favorite genres from user's favorites & high ratings
    high_ratings = db.query(Rating).join(Movie).filter(
        Rating.user_id == current_user.id,
        Rating.rating >= 4.0
    ).all()
    
    favorites = db.query(Favorite).join(Movie).filter(
        Favorite.user_id == current_user.id
    ).all()
    
    genres_count = {}
    
    # Process high ratings
    for r in high_ratings:
        if r.movie.genres:
            for g in r.movie.genres.split("|"):
                genres_count[g] = genres_count.get(g, 0) + 2
                
    # Process favorites
    for f in favorites:
        if f.movie.genres:
            for g in f.movie.genres.split("|"):
                genres_count[g] = genres_count.get(g, 0) + 3
                
    # Pick top 3 genres
    top_genres = sorted(genres_count, key=genres_count.get, reverse=True)[:3]

    return recommendation_service.get_personalized_recommendations(
        db=db,
        user_id=current_user.id,
        favorite_genres=top_genres,
        n=12
    )

@router.get("/similar-movies/{movie_id}", response_model=List[RecommendationResponse])
def get_similar_movies(movie_id: int, db: Session = Depends(get_db)):
    return recommendation_service.get_similar_movies(db, movie_id, n=12)

@router.post("/recommendations/custom", response_model=List[RecommendationResponse])
def get_custom_recommendations(
    req: CustomRecommendationRequest, 
    db: Session = Depends(get_db)
):
    return recommendation_service.get_custom_recommendations(
        db=db,
        favorite_movie_ids=req.favorite_movies,
        preferred_genres=req.preferred_genres,
        n=12
    )

@router.get("/recommendations/genre/{genre}", response_model=List[MovieResponse])
def get_genre_recommendations(genre: str, db: Session = Depends(get_db)):
    movies = db.query(Movie).filter(
        Movie.genres.like(f"%{genre}%")
    ).order_by(Movie.popularity.desc()).limit(15).all()
    return movies
