from transformers import pipeline
from typing import List, Dict

sentiment = pipeline("sentiment-analysis")

def analyze_mood_advanced(text: str) -> Dict:
    result = sentiment(text)[0]
    return {
        "mood": "upbeat" if result['label'] == 'POSITIVE' else "chill",
        "confidence": result['score']
    }

def generate_playlist_ml(languages: List[str], artists: List[str], mood_text: str) -> List[Dict]:
    mood = analyze_mood_advanced(mood_text)
    query = f"{mood['mood']} { ' '.join(artists[:3]) } { ' '.join(languages[:2]) }"
    # Spotify API call
    results = spotify_search(query, limit=20)
    return results