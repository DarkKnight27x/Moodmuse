from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class PersonalityVector(BaseModel):
    emotional_depth: float = 50.0
    energy: float = 50.0
    sociability: float = 50.0
    optimism: float = 50.0
    adventure: float = 50.0
    nostalgia: float = 50.0

class User(BaseModel):
    email: str
    name: Optional[str] = None
    preferences: Dict = Field(default_factory=dict)
    personality_vector: Optional[PersonalityVector] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)