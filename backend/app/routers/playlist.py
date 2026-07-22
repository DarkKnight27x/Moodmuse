from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from ..services.recommendation import generate_playlist

router = APIRouter(prefix="/playlist", tags=["playlist"])

class PlaylistRequest(BaseModel):
    languages: List[str] = []
    artists: List[str] = []
    mood: str = "chill"
    decade: str = "No preference"
    age: str = "No preference"
    limit: int = 20

@router.post("/generate")
async def generate_playlist(request: PlaylistRequest):
    playlist = generate_playlist(
        request.languages,
        request.artists,
        request.mood,
        "default",
        "popular",
        request.decade,
        request.age,
        f"{request.limit} mins"
    )

    return {
        "playlist_name": f"{request.mood.capitalize()} Vibes",
        "songs": playlist,
        "total_songs": len(playlist),
        "message": "Playlist generated based on your mood and profile."
    }

@router.get("/daily")
async def daily_playlist():
    return await generate_playlist(PlaylistRequest(mood="daily", limit=15))