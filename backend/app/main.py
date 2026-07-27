from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .core.config import settings

app = FastAPI(title="MoodMuse API", version="1.0")

# Session cookie (use lax + no https for local 127.0.0.1)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False,
)

# CORS — must allow credentials + exact frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from .routers.auth import router as auth_router
from .routers.assessment import router as assessment_router
from .routers.profile import router as profile_router
from .routers.spotify import router as spotify_router
from .routers.mood import router as mood_router
from .routers.therapist import router as therapist_router
from .routers.playlist import router as playlist_router
from .routers.quiz import router as quiz_router

app.include_router(auth_router)
app.include_router(assessment_router)
app.include_router(profile_router)
app.include_router(spotify_router)
app.include_router(mood_router)
app.include_router(therapist_router)
app.include_router(playlist_router)
app.include_router(quiz_router, prefix="/quiz", tags=["Quiz"])

@app.get("/")
async def root():
    return {"message": "MoodMuse Backend is Running! 🎵", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}