from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.movie import MovieResponse, MovieDetailResponse
from app.services import movie_service
from app.models.favorite import Favorite
from app.models.rating import Rating
from app.utils.security import decode_access_token
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

router = APIRouter(prefix="/api", tags=["movies"])
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional), 
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if payload is None:
        return None
    email: str = payload.get("sub")
    if email is None:
        return None
    return db.query(User).filter(User.email == email).first()

@router.get("/movies")
def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    movies, total = movie_service.get_movies(db, page, limit, genre, year, sort_by)
    return {
        "movies": movies,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/movies/search")
def search_movies(
    q: str = Query("", description="Query search term"),
    db: Session = Depends(get_db)
):
    return movie_service.search_movies(db, q)

@router.get("/movies/trending", response_model=list[MovieResponse])
def get_trending_movies(db: Session = Depends(get_db)):
    return movie_service.get_trending_movies(db)

@router.get("/movies/top-rated", response_model=list[MovieResponse])
def get_top_rated_movies(db: Session = Depends(get_db)):
    return movie_service.get_top_rated_movies(db)

@router.get("/movies/genres", response_model=list[str])
def get_genres(db: Session = Depends(get_db)):
    return movie_service.get_genres(db)

@router.get("/movies/{movie_id}", response_model=MovieDetailResponse)
def get_movie(
    movie_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    movie = movie_service.get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )
        
    is_favorite = False
    user_rating = None
    
    if current_user:
        fav = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == movie_id
        ).first()
        is_favorite = fav is not None
        
        rat = db.query(Rating).filter(
            Rating.user_id == current_user.id,
            Rating.movie_id == movie_id
        ).first()
        if rat:
            user_rating = rat.rating
            
    # Convert movie database model to a dict, then construct the response
    movie_dict = {c.name: getattr(movie, c.name) for c in movie.__table__.columns}
    movie_dict["is_favorite"] = is_favorite
    movie_dict["user_rating"] = user_rating
    
    return movie_dict
