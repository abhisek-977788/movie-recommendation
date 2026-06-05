from sqlalchemy.orm import Session
from app.config import settings
from app.models.movie import Movie
import os

# Try to import google-generativeai. If not installed, we use rule-based fallback.
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False

async def get_ai_chat_response(message: str, db: Session) -> str:
    """
    Returns AI recommendation chat responses.
    If Gemini key is available, calls Gemini API.
    Otherwise, uses a robust rule-based database matching fallback.
    """
    message_lower = message.lower()
    
    # 1. Check Gemini API
    if HAS_GEMINI_SDK and settings.GEMINI_API_KEY:
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Fetch a brief summary of database movies to give Gemini catalog context
            catalog_movies = db.query(Movie.title, Movie.genres, Movie.release_year).order_by(Movie.popularity.desc()).limit(30).all()
            catalog_str = "\n".join([f"- {title} ({genres}, {release_year})" for title, genres, release_year in catalog_movies])
            
            system_prompt = f"""You are CineAI, a helpful, enthusiastic, and intelligent movie recommendation assistant.
Your goal is to recommend movies to users based on their requests. 
Keep your replies concise (under 200 words), exciting, and clear.

Available database movies you can suggest (prefer these if they fit the user's criteria):
{catalog_str}

If recommending movies not listed above, suggest widely known popular movies. Always include Title, Release Year, and a brief description of why they'd like it.
"""
            
            model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                system_instruction=system_prompt
            )
            response = model.generate_content(message)
            return response.text
        except Exception as e:
            print(f"Gemini API Error, falling back: {e}")
            
    # 2. Rule-based offline database matching fallback
    genres = ["action", "comedy", "drama", "sci-fi", "science fiction", "horror", "romance", "thriller", "animation", "fantasy", "crime", "adventure"]
    matched_genre = None
    for g in genres:
        if g in message_lower:
            matched_genre = g
            break
            
    # Keywords matching
    similar_to_inception = any(k in message_lower for k in ["inception", "mind-bending", "mind bending", "puzzle", "christopher nolan"])
    similar_to_dark_knight = any(k in message_lower for k in ["dark knight", "batman", "superhero", "joker"])
    best_movies = any(k in message_lower for k in ["best", "top-rated", "top rated", "highest rated", "classic"])
    scary = "scary" in message_lower or "horror" in message_lower
    
    response_text = ""
    
    if similar_to_inception:
        inception_recs = db.query(Movie).filter(
            or_match(["Inception", "Interstellar", "Twelve Monkeys", "Matrix"])
        ).limit(5).all()
        response_text = "I recommend mind-bending sci-fi films similar to Inception! Here are some suggestions:\n\n"
        response_text += format_movies_for_chat(inception_recs)
        
    elif similar_to_dark_knight:
        dk_recs = db.query(Movie).filter(
            or_match(["Dark Knight", "Heat", "Usual Suspects", "Seven"])
        ).limit(5).all()
        response_text = "If you enjoyed The Dark Knight, you'll love these tense crime dramas and action blockbusters:\n\n"
        response_text += format_movies_for_chat(dk_recs)
        
    elif matched_genre:
        db_genre = "Sci-Fi" if matched_genre in ["sci-fi", "science fiction"] else matched_genre.capitalize()
        genre_movies = db.query(Movie).filter(Movie.genres.like(f"%{db_genre}%")).order_by(Movie.popularity.desc()).limit(5).all()
        response_text = f"Here are the best **{db_genre}** movies available in our catalog:\n\n"
        response_text += format_movies_for_chat(genre_movies)
        
    elif best_movies:
        top_movies = db.query(Movie).order_by(Movie.rating.desc()).limit(5).all()
        response_text = "Here are the top-rated classics from our database:\n\n"
        response_text += format_movies_for_chat(top_movies)
        
    else:
        # Generic welcome/fallback query
        featured = db.query(Movie).order_by(Movie.popularity.desc()).limit(3).all()
        response_text = "Hi! I am CineAI, your movie assistant. Tell me what genres or movies you like! E.g. 'Recommend action movies' or 'Suggest movies like Inception'.\n\nHere are some trending recommendations to get you started:\n\n"
        response_text += format_movies_for_chat(featured)
        
    return response_text

def or_match(titles: list[str]):
    from sqlalchemy import or_
    return or_(*[Movie.title.like(f"%{t}%") for t in titles])

def format_movies_for_chat(movies: list[Movie]) -> str:
    lines = []
    for m in movies:
        desc = m.overview[:100] + "..." if len(m.overview) > 100 else m.overview
        lines.append(f"🎬 **{m.title}** ({m.release_year}) - ⭐ {m.rating:.1f}\n   _{desc}_\n")
    return "\n".join(lines)
