from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.rating import RatingCreate, RatingResponse
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.movie import MovieResponse
from app.models.rating import Rating
from app.models.favorite import Favorite
from app.models.watch_history import WatchHistory
from app.models.review import Review
from app.models.movie import Movie
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.services.sentiment_service import analyze_review_sentiment
from datetime import datetime

router = APIRouter(prefix="/api", tags=["ratings & interactions"])

@router.post("/rate-movie", response_model=RatingResponse)
def rate_movie(
    rating_in: RatingCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Verify movie exists
    movie = db.query(Movie).filter(Movie.id == rating_in.movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    # Upsert rating
    db_rating = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.movie_id == rating_in.movie_id
    ).first()

    if db_rating:
        db_rating.rating = rating_in.rating
        db_rating.created_at = datetime.utcnow()
    else:
        db_rating = Rating(
            user_id=current_user.id,
            movie_id=rating_in.movie_id,
            rating=rating_in.rating
        )
        db.add(db_rating)

    db.commit()
    db.refresh(db_rating)

    # Update movie global rating average
    all_ratings = db.query(Rating.rating).filter(Rating.movie_id == rating_in.movie_id).all()
    avg_rating = sum(r[0] for r in all_ratings) / len(all_ratings) if all_ratings else 0.0
    movie.rating = avg_rating
    db.commit()

    return db_rating

@router.get("/ratings/me", response_model=list[RatingResponse])
def get_my_ratings(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return db.query(Rating).filter(Rating.user_id == current_user.id).all()

@router.get("/ratings/movie/{movie_id}")
def get_movie_rating(movie_id: int, db: Session = Depends(get_db)):
    all_ratings = db.query(Rating.rating).filter(Rating.movie_id == movie_id).all()
    avg = sum(r[0] for r in all_ratings) / len(all_ratings) if all_ratings else 0.0
    return {"movie_id": movie_id, "rating": avg, "count": len(all_ratings)}

@router.post("/favorites/{movie_id}")
def toggle_favorite(
    movie_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.movie_id == movie_id
    ).first()

    if fav:
        db.delete(fav)
        is_favorite = False
    else:
        fav = Favorite(user_id=current_user.id, movie_id=movie_id)
        db.add(fav)
        is_favorite = True

    db.commit()
    return {"movie_id": movie_id, "is_favorite": is_favorite}

@router.get("/favorites/me", response_model=list[MovieResponse])
def get_my_favorites(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    return [f.movie for f in favs]

@router.post("/watch-history/{movie_id}")
def add_to_watch_history(
    movie_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    # Check if already added recently, otherwise add new watch entry
    history = WatchHistory(user_id=current_user.id, movie_id=movie_id)
    db.add(history)
    db.commit()
    return {"status": "success", "watched_at": history.watched_at}

@router.get("/watch-history/me", response_model=list[MovieResponse])
def get_my_watch_history(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Get distinct movies watched in order of watched_at desc
    history = db.query(WatchHistory).filter(
        WatchHistory.user_id == current_user.id
    ).order_by(WatchHistory.watched_at.desc()).all()
    
    seen = set()
    result = []
    for h in history:
        if h.movie_id not in seen:
            seen.add(h.movie_id)
            result.append(h.movie)
            
    return result

@router.post("/reviews", response_model=ReviewResponse)
def submit_review(
    review_in: ReviewCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    movie = db.query(Movie).filter(Movie.id == review_in.movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movie not found"
        )

    # Sentiment analysis
    analysis = analyze_review_sentiment(review_in.review_text)

    db_review = Review(
        user_id=current_user.id,
        movie_id=review_in.movie_id,
        review_text=review_in.review_text,
        sentiment=analysis["sentiment"],
        polarity=analysis["polarity"]
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return {
        "id": db_review.id,
        "user_id": db_review.user_id,
        "user_name": current_user.name,
        "movie_id": db_review.movie_id,
        "review_text": db_review.review_text,
        "sentiment": db_review.sentiment,
        "polarity": db_review.polarity,
        "created_at": db_review.created_at
    }

@router.get("/reviews/movie/{movie_id}", response_model=list[ReviewResponse])
def get_movie_reviews(movie_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review, User.name).join(User, Review.user_id == User.id).filter(
        Review.movie_id == movie_id
    ).order_by(Review.created_at.desc()).all()

    result = []
    for review, name in reviews:
        result.append({
            "id": review.id,
            "user_id": review.user_id,
            "user_name": name,
            "movie_id": review.movie_id,
            "review_text": review.review_text,
            "sentiment": review.sentiment,
            "polarity": review.polarity,
            "created_at": review.created_at
        })
    return result
