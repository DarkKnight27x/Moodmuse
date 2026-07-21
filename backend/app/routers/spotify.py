from fastapi import APIRouter
from ..utils.spotify import search_songs, get_recommendations

router = APIRouter(prefix="/spotify", tags=["spotify"])

@router.get("/search")
def search_songs(query: str, limit: int = 10):
    try:
        results = spotify.search(q=query, type='track', limit=limit, timeout=10)
        return results['tracks']['items']
    except:
        return []
@router.get("/recommend")
async def recommend():
    results = get_recommendations()
    return {"recommended_songs": results}