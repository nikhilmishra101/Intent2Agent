from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import PurchaseHistoryItem
from services.purchase_history import fetch_purchase_history

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history/{user_id}", response_model=List[PurchaseHistoryItem])
async def get_history(user_id: str):
    """Returns purchase history for a user."""
    try:
        return await fetch_purchase_history(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
