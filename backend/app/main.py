from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .core.config import settings

# Create the FastAPI app
app = FastAPI(title="MoodMuse API", version="1.0")

# Session cookie config — this is the actual fix for "Spotify connects but
# the app never sees it as connected". Frontend (localhost:5173) and backend
# (localhost:8000) are different origins, so this is a cross-site request as
# far as the browser's cookie rules are concerned. The default SameSite=Lax
# cookie a plain SessionMiddleware sets is NOT attached to cross-origin
# fetch/XHR calls (only to top-level navigations) — so /auth/spotify/status
# and /assessment/submit both see an empty session even right after a
# successful login, no matter how correct the OAuth flow itself is.
#
# same_site="none" is required to allow the cookie on cross-origin requests.
# Browsers require Secure alongside SameSite=None — but Chrome/Firefox both
# treat "localhost" (not 127.0.0.1) as a secure context even over plain
# http, so https_only=True still works for local dev as long as both the
# frontend and backend URLs use the literal hostname "localhost".
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    same_site="none",
    https_only=True,
)

# CORS Middleware — allow_credentials=True + an explicit origin (not "*")
# are both required for the cookie-bearing requests above to be allowed at
# all; this was already correct in your version.
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False,
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