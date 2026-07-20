from fastapi import APIRouter
from ..utils.spotify import search_songs, get_recommendations

router = APIRouter(prefix="/spotify", tags=["spotify"])

@router.get("/search")
async def search_songs(query: str, limit: int = 10):
    results = search_songs(query, limit)
    return {"results": results}

@router.get("/recommend")
async def recommend():
    results = get_recommendations()
    return {"recommended_songs": results}