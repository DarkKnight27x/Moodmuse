from typing import List, Dict
from ..models.data import MusicData

def generate_playlist(languages: List[str], artists: List[str], vibe: str, personality: str, preference: str) -> List[Dict]:
    data = MusicData()
    playlist = []

    # Simple logic for playlist generation
    for lang in languages[:2]:  # top 2 languages
        lang_artists = data.artists.get(lang, [])[:5]
        for artist in lang_artists:
            playlist.append({
                "title": f"{artist} - {lang} Vibes",
                "artist": artist,
                "language": lang,
                "mood": vibe,
                "cover": f"/models/images/{artist.replace(' ', '')}.jpg"
            })
            if len(playlist) >= 20:
                break
        if len(playlist) >= 20:
            break

    # Add preference based songs
    if preference == "popular":
        playlist = playlist[:10] + playlist[10:20]  # duplicate popular
    else:
        playlist = playlist[:5] + playlist[5:15]  # cult classics

    return playlist[:20]