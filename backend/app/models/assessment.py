from pydantic import BaseModel
from typing import List

class LanguageSelection(BaseModel):
    languages: List[str]

class ArtistSelection(BaseModel):
    artists: List[str]

class AssessmentResponse(BaseModel):
    languages: List[str]
    favorite_artists: List[str]
    mood: str