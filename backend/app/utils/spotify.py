import logging
from typing import List, Optional

import spotipy
from spotipy.exceptions import SpotifyException
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
from ..core.config import settings

logger = logging.getLogger("moodmuse.spotify")

# Client Credentials (for searching)
sp = SpotifyClientCredentials(
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET
)
spotify = spotipy.Spotify(client_credentials_manager=sp)

def search_songs(query: str, limit: int = 10):
    try:
        results = spotify.search(q=query, type='track', limit=limit)
        return results['tracks']['items']
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []

def get_recommendations(seed_tracks=None, limit=10):
    return search_songs("chill", limit)

# User OAuth
SPOTIFY_SCOPE = (
    "playlist-modify-public "
    "playlist-modify-private "
    "user-read-private "
    "user-read-email"
)

sp_oauth = SpotifyOAuth(
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET,
    redirect_uri=settings.SPOTIFY_REDIRECT_URI,
    scope=SPOTIFY_SCOPE,
    cache_handler=spotipy.MemoryCacheHandler(),
    show_dialog=True,
)

def get_auth_url() -> str:
    return sp_oauth.get_authorize_url()

def exchange_code(code: str) -> dict:
    return sp_oauth.get_access_token(code, as_dict=True, check_cache=False)

def ensure_valid_token(token_info: Optional[dict]) -> Optional[dict]:
    if not token_info or not token_info.get("access_token"):
        return None
    try:
        # Only refresh if we have a refresh_token and the token is expired
        if token_info.get("refresh_token") and sp_oauth.is_token_expired(token_info):
            token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
        return token_info
    except Exception as e:
        logger.warning(f"Token refresh failed: {e}")
        # Still return the original token — it might still work
        return token_info if token_info.get("access_token") else None

def get_user_client(access_token: str) -> spotipy.Spotify:
    return spotipy.Spotify(auth=access_token)

def create_playlist(
    access_token: str,
    name: str,
    track_uris: List[str],
    public: bool = False,
    description: str = "",
) -> Optional[str]:
    if not track_uris:
        logger.info("create_playlist called with no track URIs — skipping.")
        return None
    try:
        user_sp = get_user_client(access_token)

        # /me/playlists is more reliable than /users/{id}/playlists
        playlist = user_sp._post(
            "me/playlists",
            payload={
                "name": name,
                "public": False,  # private avoids some 403 cases
                "description": description or "Created by MoodMuse",
            },
        )

        for i in range(0, len(track_uris), 100):
            user_sp.playlist_add_items(playlist["id"], track_uris[i : i + 100])

        link = playlist["external_urls"]["spotify"]
        logger.info(f"Playlist created: {link}")
        return link
    except SpotifyException as e:
        logger.error(
            f"Spotify playlist creation failed: {e} | "
            f"http_status={getattr(e, 'http_status', None)} | "
            f"msg={getattr(e, 'msg', None)}"
        )
        return None
    except Exception as e:
        logger.error(f"Unexpected error creating Spotify playlist: {e}")
        return None