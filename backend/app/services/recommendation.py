import pandas as pd
from surprise import SVD, Dataset, Reader
from typing import List, Dict
from ..models.data import MusicData
from ..utils.spotify import search_songs

# Dummy ratings (in production use DB)
ratings_data = [
    {"user": "user1", "item": "Blinding Lights", "rating": 5},
    {"user": "user1", "item": "Badtameez Dil", "rating": 4},
]

def train_model():
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(pd.DataFrame(ratings_data), reader)
    trainset = data.build_full_trainset()
    algo = SVD()
    algo.fit(trainset)
    return algo

model = train_model()

def generate_playlist(languages: List[str], artists: List[str], vibe: str, personality: str, preference: str, decade: str = "No preference", age: str = "No preference", length: str = "1 hour") -> List[Dict]:
    data = MusicData()

    mood_keywords = {
        "upbeat": "energetic dance upbeat high energy",
        "chill": "chill relaxing calm lo-fi",
        "intense": "intense emotional powerful",
        "romantic": "romantic dreamy love",
        "motivational": "motivational energetic",
    }.get(vibe.lower(), "good vibe")

    decade_filter = decade.lower() if decade != "No preference" else ""

    age_filter = {
        "0-5": "kids nursery",
        "5-12": "children fun",
        "12-18": "teen pop",
        "18-25": "youth party",
        "25-45": "adult contemporary",
        "45-80": "classic 80s 90s"
    }.get(age, "")

    limit = 18
    if length == "30–45 mins":
        limit = 13
    elif length == "1.5+ hours":
        limit = 25

    query = f"{age_filter} {mood_keywords} {decade_filter} { ' '.join(artists[:4]) } { ' '.join(languages[:2]) }"

    results = search_songs(query, limit=limit)
    seen = set()
    unique = []
    for song in results:
        title = song.get('name', '').lower()
        if title not in seen:
            seen.add(title)
            unique.append(song)
        if len(unique) >= limit:
            break
    language_songs = [s for s in unique if any(lang.lower() in s.get('name', '').lower() for lang in languages)]
    artist_songs = [s for s in unique if any(a.lower() in s.get('artists', [{}])[0].get('name', '').lower() for a in artists)]

    if length == "30–45 mins":
        final = language_songs[:4] + artist_songs[:3] + unique[:6]
    elif length == "1.5+ hours":
        final = language_songs[:8] + artist_songs[:6] + unique[:11]
    else:
        final = language_songs[:6] + artist_songs[:4] + unique[:5]

    return final[:limit] 