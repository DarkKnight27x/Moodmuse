from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/mood", tags=["mood"])

class MoodInput(BaseModel):
    text: str  # e.g. "I had a bad day"

@router.post("/detect")
async def detect_mood(input: MoodInput):
    text = input.text.lower()
    
    if any(word in text for word in ["sad", "bad", "terrible", "depressed"]):
        mood = "sad"
        playlist_type = "heartbreak"
    elif any(word in text for word in ["happy", "good", "great", "excited"]):
        mood = "happy"
        playlist_type = "party"
    elif any(word in text for word in ["focus", "study", "work"]):
        mood = "focus"
        playlist_type = "focus"
    else:
        mood = "neutral"
        playlist_type = "chill"
    
    return {
        "detected_mood": mood,
        "recommended_playlist": playlist_type,
        "message": f"Detected mood: {mood}. Here's a playlist for you."
    }