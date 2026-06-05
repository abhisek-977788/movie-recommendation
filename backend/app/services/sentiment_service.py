from app.ml.sentiment import analyze_sentiment

def analyze_review_sentiment(review_text: str) -> dict:
    """
    Analyzes the sentiment of a movie review text.
    """
    return analyze_sentiment(review_text)
