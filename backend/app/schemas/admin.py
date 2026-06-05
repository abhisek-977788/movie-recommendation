from pydantic import BaseModel
from typing import Dict, List, Any

class ActivityItem(BaseModel):
    user_name: str
    action: str # e.g. "rated 'Inception' 5 stars", "wrote a review for 'Titanic'"
    timestamp: str

class AnalyticsResponse(BaseModel):
    total_users: int
    total_movies: int
    total_ratings: int
    total_reviews: int
    popular_genres: Dict[str, int]
    recent_activity: List[ActivityItem]
