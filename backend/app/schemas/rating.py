from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.movie import MovieResponse

class RatingCreate(BaseModel):
    movie_id: int
    rating: float = Field(..., ge=0.5, le=5.0)

class RatingResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: datetime
    movie: MovieResponse

    class Config:
        from_attributes = True
