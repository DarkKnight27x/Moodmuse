from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware   # ← ADD THIS

# Create the FastAPI app
app = FastAPI(title="MoodMuse API", version="1.0")

# ← ADD THIS BLOCK (Session Middleware)
app.add_middleware(
    SessionMiddleware,
    secret_key="moodmuse-super-secret-key-change-me-in-production"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================== ROUTERS ======================
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

# ====================== ROOT & HEALTH ======================
@app.get("/")
async def root():
    return {"message": "MoodMuse Backend is Running! 🎵", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ====================== RUN (for local testing) ======================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)