import logging
from typing import List, Optional

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth
from ..core.config import settings

logger = logging.getLogger("moodmuse.spotify")

# Client Credentials (for searching songs)
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


# User OAuth (for creating playlists)
SPOTIFY_SCOPE = "playlist-modify-public playlist-modify-private"

sp_oauth = SpotifyOAuth(
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET,
    redirect_uri=settings.SPOTIFY_REDIRECT_URI,
    scope=SPOTIFY_SCOPE,
    cache_handler=spotipy.MemoryCacheHandler(),
    show_dialog=False,
)


def get_auth_url() -> str:
    return sp_oauth.get_authorize_url()


def exchange_code(code: str) -> dict:
    return sp_oauth.get_access_token(code, as_dict=True, check_cache=False)


def ensure_valid_token(token_info: Optional[dict]) -> Optional[dict]:
    if not token_info or not token_info.get("refresh_token"):
        return None
    try:
        if sp_oauth.is_token_expired(token_info):
            token_info = sp_oauth.refresh_access_token(token_info["refresh_token"])
        return token_info
    except Exception as e:
        logger.warning(f"Token refresh failed: {e}")
        return None


def get_user_client(access_token: str) -> spotipy.Spotify:
    return spotipy.Spotify(auth=access_token)


def create_playlist(
    access_token: str,
    name: str,
    track_uris: List[str],
    public: bool = True,
    description: str = "",
) -> Optional[str]:
    if not track_uris:
        return None
    try:
        user_sp = get_user_client(access_token)
        user = user_sp.current_user()
        playlist = user_sp.user_playlist_create(
            user=user["id"],
            name=name,
            public=public,
            description=description,
        )
        for i in range(0, len(track_uris), 100):
            user_sp.playlist_add_items(playlist["id"], track_uris[i:i+100])
        return playlist["external_urls"]["spotify"]
    except Exception as e:
        logger.warning(f"Playlist creation failed: {e}")
        return None