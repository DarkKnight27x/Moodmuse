from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/therapist", tags=["therapist"])

class TherapistInput(BaseModel):
    message: str

@router.post("/talk")
async def music_therapist(input: TherapistInput):
    text = input.message.lower()
    
    if "bad" in text or "terrible" in text or "sad" in text:
        response = "I'm sorry you had a tough day. Music can be a great companion."
        playlist = "Heartbreak / Chill Vibes"
    elif "happy" in text or "good" in text:
        response = "That's awesome! Let's celebrate with some upbeat tracks."
        playlist = "Happy / Party"
    else:
        response = "I hear you. Here's some music that might help you process or lift your mood."
        playlist = "Reflective / Balanced"
    
    return {
        "insight": response,
        "recommended_playlist": playlist,
        "message": "Remember, music is supportive — not a replacement for professional help if needed."
    }