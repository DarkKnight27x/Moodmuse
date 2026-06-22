from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017/moodmuse"
    SECRET_KEY: str = "change-this-to-a-very-long-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

settings = Settings()