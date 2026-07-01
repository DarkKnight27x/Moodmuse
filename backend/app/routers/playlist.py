from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter(prefix="/playlist", tags=["playlist"])

class PlaylistRequest(BaseModel):
    mood: str = "chill"
    limit: int = 20

@router.post("/generate")
async def generate_playlist(request: PlaylistRequest):
    # Dummy data for now (later connect to Spotify)
    songs = [
        {"title": "Blinding Lights", "artist": "The Weeknd", "mood": "energetic"},
        {"title": "Levitating", "artist": "Dua Lipa", "mood": "happy"},
        {"title": "Heat Waves", "artist": "Glass Animals", "mood": "chill"},
        {"title": "Save Your Tears", "artist": "The Weeknd", "mood": "emotional"},
        {"title": "Peaches", "artist": "Justin Bieber", "mood": "chill"},
    ] * 4  # Repeat to make ~20

    return {
        "playlist_name": f"{request.mood.capitalize()} Vibes",
        "songs": songs[:request.limit],
        "total_songs": request.limit,
        "message": "Playlist generated based on your mood and profile."
    }

@router.get("/daily")
async def daily_playlist():
    return await generate_playlist(PlaylistRequest(mood="daily", limit=15))