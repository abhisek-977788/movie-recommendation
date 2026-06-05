from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ReviewCreate(BaseModel):
    movie_id: int
    review_text: str

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    movie_id: int
    review_text: str
    sentiment: Optional[str] = None
    polarity: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
