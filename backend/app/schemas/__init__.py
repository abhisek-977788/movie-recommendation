from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserProfileUpdate
from app.schemas.movie import MovieCreate, MovieResponse, MovieDetailResponse, MovieSearch, RecommendationResponse, CustomRecommendationRequest
from app.schemas.rating import RatingCreate, RatingResponse
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.admin import AnalyticsResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "Token",
    "UserProfileUpdate",
    "MovieCreate",
    "MovieResponse",
    "MovieDetailResponse",
    "MovieSearch",
    "RecommendationResponse",
    "CustomRecommendationRequest",
    "RatingCreate",
    "RatingResponse",
    "ReviewCreate",
    "ReviewResponse",
    "ChatRequest",
    "ChatResponse",
    "AnalyticsResponse",
]
