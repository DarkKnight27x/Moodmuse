from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: str
    name: Optional[str] = None

@router.post("/register")
async def register_user(user: UserCreate):
    # For now just return success (Mongo later)
    return {
        "message": "User registered successfully!",
        "user": user
    }

# Later we'll connect to Mongo