from pydantic import BaseModel
from typing import Optional, List

class MovieBase(BaseModel):
    title: str
    genres: str
    overview: str
    director: Optional[str] = None
    cast_members: Optional[str] = None
    release_year: Optional[int] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    rating: float = 0.0
    popularity: float = 0.0
    tmdb_id: Optional[int] = None
    language: str = "en"

class MovieCreate(MovieBase):
    pass

class MovieResponse(MovieBase):
    id: int

    class Config:
        from_attributes = True

class MovieDetailResponse(MovieResponse):
    is_favorite: bool = False
    user_rating: Optional[float] = None

class MovieSearch(BaseModel):
    query: str

class RecommendationResponse(BaseModel):
    movie: MovieResponse
    score: float

class CustomRecommendationRequest(BaseModel):
    favorite_movies: List[int] = []
    preferred_genres: List[str] = []
