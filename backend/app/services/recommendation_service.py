import os
import pandas as pd
from sqlalchemy.orm import Session
from app.models.movie import Movie
from app.models.rating import Rating
from app.models.favorite import Favorite
from app.ml.content_based import ContentBasedRecommender
from app.ml.collaborative import CollaborativeRecommender
from app.ml.hybrid import HybridRecommender

# Global references to models loaded in memory
content_model: ContentBasedRecommender | None = None
collab_model: CollaborativeRecommender | None = None
hybrid_model: HybridRecommender | None = None

def load_models():
    """
    Attempts to load the trained models from the filesystem.
    """
    global content_model, collab_model, hybrid_model
    
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    models_dir = os.path.join(base_dir, "models")
    
    content_path = os.path.join(models_dir, "content_model.pkl")
    collab_path = os.path.join(models_dir, "collab_model.pkl")
    
    # Load content-based model
    if os.path.exists(content_path):
        try:
            content_model = ContentBasedRecommender()
            content_model.load(content_path)
            print("Loaded Content-Based model successfully.")
        except Exception as e:
            print(f"Error loading Content-Based model: {e}")
            content_model = None

    # Load collaborative model
    if os.path.exists(collab_path):
        try:
            collab_model = CollaborativeRecommender()
            collab_model.load(collab_path)
            print("Loaded Collaborative Filtering model successfully.")
        except Exception as e:
            print(f"Error loading Collaborative Filtering model: {e}")
            collab_model = None
            
    # Instantiate hybrid model if both exist
    if content_model and collab_model:
        hybrid_model = HybridRecommender(content_model, collab_model)
        print("Initialized Hybrid recommender.")

def get_db_movie_ids(db: Session) -> list[int]:
    return [r[0] for r in db.query(Movie.id).all()]

def get_personalized_recommendations(db: Session, user_id: int, favorite_genres: list[str], n: int = 10):
    """
    Returns personalized movie recommendations.
    Uses hybrid model if available, else content-based profile, else trending fallback.
    """
    # Get user's ratings to know what they watched
    user_ratings = db.query(Rating).filter(Rating.user_id == user_id).all()
    rated_movie_ids = [r.movie_id for r in user_ratings]
    
    all_movie_ids = get_db_movie_ids(db)
    if not all_movie_ids:
        return []

    recs = []
    
    # Try Hybrid Model
    if hybrid_model and content_model and collab_model:
        try:
            # Hybrid recommender expects movieIds as represented in the MovieLens model.
            # In our db, we map id directly, but we check if movie is in model first.
            model_recs = hybrid_model.get_recommendations(
                user_id=user_id,
                favorite_genres=favorite_genres,
                rated_movie_ids=rated_movie_ids,
                all_movie_ids=all_movie_ids,
                n=n
            )
            recs = model_recs
        except Exception as e:
            print(f"Error using hybrid recommender: {e}")

    # Try Content-Based Fallback
    if not recs and content_model:
        try:
            model_recs = content_model.get_recommendations_from_profile(
                favorite_genres=favorite_genres,
                liked_movie_ids=[mid for mid in rated_movie_ids if mid in content_model.movie_to_idx],
                n=n
            )
            recs = model_recs
        except Exception as e:
            print(f"Error using content recommender: {e}")

    # If no recs generated or models not loaded, fallback to trending/popular movies the user hasn't rated
    if not recs:
        print("Model recommendation unavailable. Falling back to popular movies.")
        rated_set = set(rated_movie_ids)
        popular_movies = db.query(Movie).order_by(Movie.popularity.desc()).limit(n + len(rated_movie_ids)).all()
        recs = [(m.id, m.popularity) for m in popular_movies if m.id not in rated_set][:n]

    # Map back to Database Movie models
    results = []
    for mid, score in recs:
        movie = db.query(Movie).filter(Movie.id == mid).first()
        if movie:
            results.append({"movie": movie, "score": score})
            
    return results

def get_similar_movies(db: Session, movie_id: int, n: int = 10):
    """
    Returns similar movies based on content similarity.
    """
    recs = []
    if content_model:
        try:
            recs = content_model.get_similar_movies(movie_id, n=n)
        except Exception as e:
            print(f"Error calculating similar movies from model: {e}")
            
    if not recs:
        # Fallback to same-genre movies
        target_movie = db.query(Movie).filter(Movie.id == movie_id).first()
        if target_movie and target_movie.genres:
            first_genre = target_movie.genres.split("|")[0]
            similar = db.query(Movie).filter(
                Movie.genres.like(f"%{first_genre}%"),
                Movie.id != movie_id
            ).order_by(Movie.popularity.desc()).limit(n).all()
            recs = [(m.id, 0.5) for m in similar]
            
    results = []
    for mid, score in recs:
        movie = db.query(Movie).filter(Movie.id == mid).first()
        if movie:
            results.append({"movie": movie, "score": score})
            
    return results

def get_custom_recommendations(db: Session, favorite_movie_ids: list[int], preferred_genres: list[str], n: int = 10):
    """
    Generates recommendations for an arbitrary input profiles (favorites and genres).
    """
    recs = []
    if content_model:
        try:
            recs = content_model.get_recommendations_from_profile(
                favorite_genres=preferred_genres,
                liked_movie_ids=favorite_movie_ids,
                n=n
            )
        except Exception as e:
            print(f"Error getting custom recommendations: {e}")
            
    if not recs:
        # Simple query fallback
        query = db.query(Movie)
        if preferred_genres:
            first_genre = preferred_genres[0]
            query = query.filter(Movie.genres.like(f"%{first_genre}%"))
        results = query.order_by(Movie.popularity.desc()).limit(n).all()
        return [{"movie": m, "score": 0.5} for m in results]

    results = []
    for mid, score in recs:
        movie = db.query(Movie).filter(Movie.id == mid).first()
        if movie:
            results.append({"movie": movie, "score": score})
    return results
