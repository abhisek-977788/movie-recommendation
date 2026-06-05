from app.services.auth_service import create_user, authenticate_user, update_user_profile
from app.services.movie_service import get_movies, search_movies, get_movie_by_id, get_trending_movies, get_top_rated_movies, get_genres, sync_tmdb_movies
from app.services.recommendation_service import load_models, get_personalized_recommendations, get_similar_movies, get_custom_recommendations
from app.services.chat_service import get_ai_chat_response
from app.services.sentiment_service import analyze_review_sentiment

__all__ = [
    "create_user",
    "authenticate_user",
    "update_user_profile",
    "get_movies",
    "search_movies",
    "get_movie_by_id",
    "get_trending_movies",
    "get_top_rated_movies",
    "get_genres",
    "sync_tmdb_movies",
    "load_models",
    "get_personalized_recommendations",
    "get_similar_movies",
    "get_custom_recommendations",
    "get_ai_chat_response",
    "analyze_review_sentiment"
]
