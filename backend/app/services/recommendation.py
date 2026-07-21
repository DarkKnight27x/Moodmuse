from typing import List, Dict
from ..models.data import MusicData
from ..utils.spotify import search_songs

def generate_playlist(languages: List[str], artists: List[str], vibe: str, personality: str, preference: str, decade: str = "No preference") -> List[Dict]:
    data = MusicData()

    # Mood keywords
    mood_keywords = {
        "upbeat": "energetic dance upbeat",
        "chill": "chill relaxing calm",
        "intense": "intense emotional powerful",
        "romantic": "romantic dreamy",
        "motivational": "motivational energetic",
    }.get(vibe.lower(), "good vibe")

    # Decade
    decade_filter = ""
    if decade != "No preference":
        decade_filter = decade.lower()

    # Build query
    query = f"{mood_keywords} {decade_filter} { ' '.join(artists[:3]) } { ' '.join(languages[:2]) }"

    # Spotify search
    results = search_songs(query, limit=20)

    return results[:20]