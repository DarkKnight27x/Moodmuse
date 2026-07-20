from pydantic import BaseModel
from typing import List, Dict

class Question(BaseModel):
    id: int
    text: str
    options: List[str]

vibe_questions: List[Question] = [
    Question(id=1, text="What kind of weather matches your current mood?", options=["Sunny and bright", "Rainy and calm", "Cloudy and mysterious", "Stormy and intense"]),
    Question(id=2, text="Choose a color that represents your vibe right now.", options=["Blue (calm)", "Red (energetic)", "Purple (dreamy)", "Green (fresh)"]),
    Question(id=3, text="Pick a time of day you feel most alive.", options=["Morning", "Afternoon", "Evening", "Night"]),
    Question(id=4, text="What kind of place do you imagine listening to music in?", options=["Beach", "Forest", "City rooftop", "Cozy room"]),
    Question(id=7, text="Pick a type of journey.", options=["Road trip", "Solo walk", "Flight", "Train journey"]),
    Question(id=10, text="Pick a type of movement.", options=["Dance", "Chill", "Run", "Yoga"]),
    Question(id=13, text="Pick a type of city vibe.", options=["Busy streets", "Quiet lanes", "Neon lights", "Historic"]),
    Question(id=16, text="Pick a type of memory you want to relive.", options=["Childhood", "Adventure", "Love", "Friendship"]),
    Question(id=18, text="Choose a type of dream you had recently.", options=["Flying", "Falling", "Chasing", "Peaceful"]),
    Question(id=19, text="Pick a type of adventure.", options=["Mountain climb", "Ocean dive", "Road trip", "City exploration"])
]

personality_questions: List[Question] = [
    Question(id=1, text="Are you more introvert or extrovert?", options=["Introvert", "Extrovert", "Ambivert", "Depends on mood"]),
    Question(id=4, text="Do you like structure or freedom?", options=["Structure", "Freedom", "Balanced", "Depends on context"]),
    Question(id=5, text="Are you more optimistic or realistic?", options=["Optimistic", "Realistic", "Pessimistic", "Balanced"]),
    Question(id=6, text="Do you prefer deep conversations or fun banter?", options=["Deep conversations", "Fun banter", "Both", "Depends on person"]),
    Question(id=13, text="Are you more empathetic or objective?", options=["Empathetic", "Objective", "Balanced", "Depends on situation"]),
    Question(id=17, text="Are you more romantic or practical?", options=["Romantic", "Practical", "Balanced", "Depends on situation"])
]

class VibeAnswers(BaseModel):
    answers: Dict[int, int]  # question_id: option_index

class PersonalityAnswers(BaseModel):
    answers: Dict[int, int]  # question_id: option_index