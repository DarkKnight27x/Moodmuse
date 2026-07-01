from typing import Dict

def calculate_personality_score(answers: Dict) -> Dict:
    return {
        "emotional_depth": answers.get("q1", 50),
        "energy": answers.get("q2", 50),
        "sociability": answers.get("q3", 50),
        "optimism": answers.get("q4", 50),
        "adventure": answers.get("q5", 50),
        "nostalgia": answers.get("q6", 50)
    }

def calculate_music_dna(vector: Dict) -> Dict:
    return {
        "dreamer": round(vector.get("emotional_depth", 50) * 0.4 + vector.get("nostalgia", 50) * 0.6, 1),
        "night_owl": round(vector.get("energy", 50) * 0.3 + (100 - vector.get("sociability", 50)) * 0.7, 1),
        "explorer": round(vector.get("adventure", 50) * 0.8, 1),
        "romantic": round(vector.get("optimism", 50) * 0.5 + vector.get("emotional_depth", 50) * 0.5, 1),
        "rebel": round((100 - vector.get("optimism", 50)) * 0.6, 1)
    }