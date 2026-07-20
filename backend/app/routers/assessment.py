from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from ..models.data import MusicData
from ..services.ml import analyze_mood_advanced, generate_playlist_ml

router = APIRouter(prefix="/assessment", tags=["assessment"])

class LanguageSelection(BaseModel):
    languages: List[str]

class ArtistSelection(BaseModel):
    artists: List[str]

class AssessmentAnswers(BaseModel):
    languages: List[str]
    favorite_artists: List[str]
    mood: str

@router.get("/languages")
async def get_languages():
    data = MusicData()
    return {"languages": data.languages}

@router.get("/artists/{language}")
async def get_artists(language: str):
    data = MusicData()
    return {"artists": [a["name"] for a in data.artists.get(language, [])]}

@router.post("/submit")
async def submit_assessment(answers: AssessmentAnswers, mood_text: str, preference: str = "popular"):
    ml_mood = analyze_mood_advanced(mood_text)
    playlist = generate_playlist_ml(
        answers.languages,
        answers.favorite_artists,
        mood_text
    )

    return {
        "mood_analysis": ml_mood,
        "playlist": playlist,
        "message": "Advanced ML playlist ready!"
    }