from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "moodmuse"
    SECRET_KEY: str = "super-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str
    SPOTIFY_REDIRECT_URI: str = "http://localhost:8000/auth/spotify/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    # Allow extra fields from .env without crashing
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()