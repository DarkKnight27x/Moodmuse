from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter(prefix="/profile", tags=["profile"])

class UserProfile(BaseModel):
    email: str
    name: str
    preferences: Dict = {}
    personality_vector: Dict = {}
    music_dna: Dict = {}

fake_users = {}  # Temporary in-memory storage

@router.post("/save")
async def save_profile(profile: UserProfile):
    fake_users[profile.email] = profile.dict()
    return {"message": "Profile saved!", "profile": profile}

@router.get("/{email}")
async def get_profile(email: str):
    if email in fake_users:
        return fake_users[email]
    return {"error": "User not found"}

@router.get("/recommend/{email}")
async def get_recommendations(email: str):
    # Dummy recommendations for now
    return {
        "songs": [
            {"title": "Blinding Lights", "artist": "The Weeknd", "mood": "energetic"},
            {"title": "Levitating", "artist": "Dua Lipa", "mood": "happy"},
            {"title": "Heat Waves", "artist": "Glass Animals", "mood": "chill"}
        ],
        "message": "Personalized recommendations based on your profile"
    }