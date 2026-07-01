from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create app first
app = FastAPI(title="MoodMuse API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers AFTER app is created
from .routers.auth import router as auth_router
app.include_router(auth_router)

from .routers.assessment import router as assessment_router
app.include_router(assessment_router)

from .routers.profile import router as profile_router
app.include_router(profile_router)

from .routers.spotify import router as spotify_router
app.include_router(spotify_router)

from .routers.mood import router as mood_router
app.include_router(mood_router)

from .routers.therapist import router as therapist_router
app.include_router(therapist_router)

from .routers.playlist import router as playlist_router
app.include_router(playlist_router)

@app.get("/")
async def root():
    return {"message": "MoodMuse Backend is Running! 🎵", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)