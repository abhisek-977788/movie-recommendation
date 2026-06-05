from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.movie import Movie
from app.config import settings
import httpx
from typing import Optional

def get_movies(
    db: Session, 
    page: int = 1, 
    limit: int = 20, 
    genre: Optional[str] = None, 
    year: Optional[int] = None,
    sort_by: Optional[str] = None
):
    query = db.query(Movie)
    
    if genre:
        query = query.filter(Movie.genres.like(f"%{genre}%"))
    
    if year:
        query = query.filter(Movie.release_year == year)

    if sort_by == "rating":
        query = query.order_by(desc(Movie.rating))
    elif sort_by == "popularity":
        query = query.order_by(desc(Movie.popularity))
    elif sort_by == "year":
        query = query.order_by(desc(Movie.release_year))
    else:
        query = query.order_by(desc(Movie.popularity))

    offset = (page - 1) * limit
    total = query.count()
    movies = query.offset(offset).limit(limit).all()
    
    return movies, total

def search_movies(db: Session, query_str: str, limit: int = 20):
    if not query_str:
        return []
    
    return db.query(Movie).filter(
        or_(
            Movie.title.like(f"%{query_str}%"),
            Movie.director.like(f"%{query_str}%"),
            Movie.cast_members.like(f"%{query_str}%"),
            Movie.genres.like(f"%{query_str}%")
        )
    ).limit(limit).all()

def get_movie_by_id(db: Session, movie_id: int) -> Optional[Movie]:
    return db.query(Movie).filter(Movie.id == movie_id).first()

def get_trending_movies(db: Session, limit: int = 20):
    return db.query(Movie).order_by(desc(Movie.popularity)).limit(limit).all()

def get_top_rated_movies(db: Session, limit: int = 20):
    return db.query(Movie).order_by(desc(Movie.rating)).limit(limit).all()

def get_genres(db: Session) -> list[str]:
    # Returns unique list of genres from the database
    movies = db.query(Movie.genres).all()
    genres_set = set()
    for row in movies:
        if row[0]:
            for g in row[0].split("|"):
                if g.strip():
                    genres_set.add(g.strip())
    return sorted(list(genres_set))

async def sync_tmdb_movies(db: Session, category: str = "popular") -> int:
    """
    Syncs movie data from the TMDB API.
    Category can be: popular, top_rated, trending
    Returns number of synced movies.
    """
    if not settings.TMDB_API_KEY:
        print("TMDB API Key not configured. Skipping sync.")
        return 0

    headers = {
        "Authorization": f"Bearer {settings.TMDB_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Fallback to query parameter if key looks like v3 key
    params = {}
    if len(settings.TMDB_API_KEY) < 50:
        params["api_key"] = settings.TMDB_API_KEY
        headers = {"Content-Type": "application/json"}

    url_map = {
        "popular": f"{settings.TMDB_BASE_URL}/movie/popular",
        "top_rated": f"{settings.TMDB_BASE_URL}/movie/top_rated",
        "trending": f"{settings.TMDB_BASE_URL}/trending/movie/week"
    }
    
    url = url_map.get(category, url_map["popular"])
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            results = response.json().get("results", [])
        except Exception as e:
            print(f"Error fetching data from TMDB: {e}")
            return 0

        synced_count = 0
        for m_data in results:
            tmdb_id = m_data.get("id")
            if not tmdb_id:
                continue

            # Check if movie already exists
            movie = db.query(Movie).filter(Movie.tmdb_id == tmdb_id).first()
            if not movie:
                # Fetch details + credits
                detail_url = f"{settings.TMDB_BASE_URL}/movie/{tmdb_id}"
                detail_params = params.copy()
                detail_params["append_to_response"] = "credits"
                
                try:
                    detail_resp = await client.get(detail_url, headers=headers, params=detail_params)
                    detail_resp.raise_for_status()
                    details = detail_resp.json()
                except Exception as e:
                    print(f"Error fetching movie details for TMDB ID {tmdb_id}: {e}")
                    continue

                # Map details
                title = details.get("title", m_data.get("title"))
                overview = details.get("overview", m_data.get("overview", ""))
                release_date = details.get("release_date", "")
                release_year = int(release_date.split("-")[0]) if release_date else None
                
                # Genres mapping
                genres_list = [g.get("name") for g in details.get("genres", [])]
                genres = "|".join(genres_list) if genres_list else "Drama"

                # Poster and backdrop url
                poster_path = details.get("poster_path")
                poster_url = f"{settings.TMDB_IMAGE_BASE_URL}/w500{poster_path}" if poster_path else None
                backdrop_path = details.get("backdrop_path")
                backdrop_url = f"{settings.TMDB_IMAGE_BASE_URL}/original{backdrop_path}" if backdrop_path else None

                # Credits (director and cast)
                credits = details.get("credits", {})
                cast_list = [c.get("name") for c in credits.get("cast", [])[:5]]
                cast_members = ", ".join(cast_list) if cast_list else None

                director = None
                for crew_member in credits.get("crew", []):
                    if crew_member.get("job") == "Director":
                        director = crew_member.get("name")
                        break

                movie = Movie(
                    title=title,
                    genres=genres,
                    overview=overview,
                    release_year=release_year,
                    poster_url=poster_url,
                    backdrop_url=backdrop_url,
                    rating=details.get("vote_average", 0.0),
                    popularity=details.get("popularity", 0.0),
                    tmdb_id=tmdb_id,
                    director=director,
                    cast_members=cast_members,
                    language=details.get("original_language", "en")
                )
                db.add(movie)
                synced_count += 1
            else:
                # Update existing movie popularity/rating
                movie.popularity = m_data.get("popularity", movie.popularity)
                movie.rating = m_data.get("vote_average", movie.rating)
                
            db.commit()
            
        return synced_count
