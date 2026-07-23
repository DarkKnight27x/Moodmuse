from typing import Optional
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from ..core.config import settings
from ..utils.spotify import get_auth_url, exchange_code

router = APIRouter(prefix="/auth/spotify", tags=["auth"])


@router.get("/login")
async def login():
    """Redirects the browser to Spotify's consent screen. The frontend should
    do a full page navigation here (window.location.href = ...), not a fetch —
    this has to be a real browser redirect for the OAuth flow to work."""
    return RedirectResponse(get_auth_url())


@router.get("/callback")
async def callback(request: Request, code: Optional[str] = None, error: Optional[str] = None):
    """Spotify redirects here after the user approves (or denies) access.
    Token is stored in the visitor's server-side session — nothing is ever
    persisted to disk or a database, so it lasts as long as their session
    cookie does."""
    frontend_url = settings.FRONTEND_URL.rstrip("/")

    if error or not code:
        return RedirectResponse(f"{frontend_url}/?spotify_connected=false")

    try:
        token_info = exchange_code(code)
        request.session["spotify_token"] = token_info
        return RedirectResponse(f"{frontend_url}/?spotify_connected=true")
    except Exception:
        return RedirectResponse(f"{frontend_url}/?spotify_connected=false")


@router.get("/status")
async def status(request: Request):
    """Lets the frontend check on load whether this session already has a
    connected Spotify account, without needing to run the quiz first."""
    token_info = request.session.get("spotify_token")
    return {"connected": bool(token_info and token_info.get("access_token"))}


@router.post("/logout")
async def logout(request: Request):
    request.session.pop("spotify_token", None)
    return {"connected": False}