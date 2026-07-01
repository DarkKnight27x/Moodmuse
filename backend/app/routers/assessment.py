from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict
from ..services.personality import calculate_personality_score, calculate_music_dna

router = APIRouter(prefix="/assessment", tags=["assessment"])

class AssessmentAnswers(BaseModel):
    q1: float
    q2: float
    q3: float
    q4: float
    q5: float
    q6: float

@router.post("/submit")
async def submit_assessment(answers: AssessmentAnswers):
    vector = calculate_personality_score(answers.dict())
    dna = calculate_music_dna(vector)
    
    return {
        "personality_vector": vector,
        "music_dna": dna,
        "message": "Assessment completed successfully! Your Music DNA is ready."
    }