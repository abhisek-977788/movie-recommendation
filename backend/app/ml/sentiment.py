from textblob import TextBlob

def analyze_sentiment(text: str) -> dict:
    """
    Analyzes sentiment of text using TextBlob.
    Returns polarity (-1.0 to 1.0) and label (positive, negative, neutral)
    """
    if not text or not text.strip():
        return {"sentiment": "neutral", "polarity": 0.0}

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    return {
        "sentiment": sentiment,
        "polarity": float(polarity)
    }
