import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from ..core.config import settings

sp = SpotifyClientCredentials(
    client_id=settings.SPOTIFY_CLIENT_ID,
    client_secret=settings.SPOTIFY_CLIENT_SECRET
)

spotify = spotipy.Spotify(client_credentials_manager=sp)

def search_songs(query: str, limit: int = 10):
    results = spotify.search(q=query, type='track', limit=limit)
    return results['tracks']['items']

def get_recommendations(seed_tracks=None, limit=10):
    # Dummy for now
    return search_songs("chill", limit)