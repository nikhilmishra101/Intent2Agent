"""
Card details service.
Returns the user's registered cards sorted by usage (most used first).
Used to surface the most relevant payment instruments and offers.
"""
import asyncio
from typing import List
from models.schemas import CardDetail
from models.database import load_json


async def fetch_user_cards(user_id: str) -> List[CardDetail]:
    """
    Async fetch of user's card details.
    Returns sorted by usage_count descending.
    """
    await asyncio.sleep(0.02)  # simulate async I/O

    raw_data = load_json("dummy_cards.json")
    user_cards = raw_data.get(user_id, [])
    cards = [CardDetail(**card) for card in user_cards]
    return sorted(cards, key=lambda c: c.usage_count, reverse=True)


async def get_most_used_card(user_id: str) -> CardDetail | None:
    """Returns the user's most frequently used card."""
    cards = await fetch_user_cards(user_id)
    return cards[0] if cards else None


def map_card_to_instrument(card: CardDetail) -> str:
    """
    Maps a CardDetail to an offer instrument identifier.
    e.g. HDFC CREDIT → HDFC_CREDIT_CARD
    """
    bank = card.bank.upper()
    card_type = card.card_type.upper()
    return f"{bank}_{card_type}_CARD"
