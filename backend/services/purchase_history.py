"""
Async service to fetch past user purchase history.
Uses dummy data — replace with real DB query in production.
Provides brand/merchant alignment hints to the main agent.
"""
import asyncio
from typing import List, Optional
from models.schemas import PurchaseHistoryItem
from models.database import load_json


async def fetch_purchase_history(user_id: str) -> List[PurchaseHistoryItem]:
    """
    Async fetch of past purchase history for a user.
    Simulates I/O delay to demonstrate async behavior.
    """
    await asyncio.sleep(0.05)  # simulate async DB call

    raw_data = load_json("dummy_purchase_history.json")
    user_history = raw_data.get(user_id, [])
    return [PurchaseHistoryItem(**item) for item in user_history]


async def get_preferred_brands_for_category(
    user_id: str, category: str
) -> List[str]:
    """
    Returns ordered list of brands the user has bought in this category,
    most recent first. Used to personalize recommendations.
    """
    history = await fetch_purchase_history(user_id)
    category_items = [h for h in history if h.category == category]
    # Deduplicate while preserving order
    seen = set()
    brands = []
    for item in category_items:
        if item.brand not in seen:
            seen.add(item.brand)
            brands.append(item.brand)
    return brands


async def get_preferred_merchants(user_id: str) -> List[str]:
    """Returns top merchants by usage frequency."""
    history = await fetch_purchase_history(user_id)
    from collections import Counter
    counts = Counter(h.merchant for h in history)
    return [merchant for merchant, _ in counts.most_common(3)]
