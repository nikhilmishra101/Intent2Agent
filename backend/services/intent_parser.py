"""
Stage 1 — Intent Parser
Extracts structured intent from free-text user query.
Uses regex + keyword matching (no LLM needed here — fast and deterministic).
Persists result to data/intent.json.
"""
import re
import json
from pathlib import Path
from models.schemas import IntentData, SearchFilters
from config import settings


PRODUCT_KEYWORDS = {
    "shoes": ["shoe", "shoes", "sneaker", "sneakers", "footwear", "sandal", "boot"],
    "headphones": ["headphone", "headphones", "earphone", "earphones", "earbuds", "headset"],
    "laptop": ["laptop", "notebook", "computer", "pc", "macbook"],
    "phone": ["phone", "mobile", "smartphone", "iphone", "android"],
    "watch": ["watch", "smartwatch", "wearable"],
    "camera": ["camera", "dslr", "mirrorless"],
    "tv": ["tv", "television", "smart tv"],
}

PREFERENCE_KEYWORDS = {
    "emi": ["emi", "no cost emi", "installment", "instalment", "monthly"],
    "specific_rail": ["upi", "credit card", "debit card", "wallet", "netbanking"],
    "best_value": ["best", "cheapest", "maximum cashback", "best offer", "optimal"],
}


def extract_budget(text: str) -> int:
    """Returns budget in paise. Returns 0 if not found."""
    # Match patterns like ₹1000, Rs 1000, 1000 rupees, under 1k, below 50000
    text_lower = text.lower().replace(",", "")

    patterns = [
        r"(?:₹|rs\.?\s*|inr\s*)(\d+(?:\.\d+)?)\s*(?:k\b)?",
        r"(\d+(?:\.\d+)?)\s*(?:k\b)?\s*(?:rupees?|rs\.?|₹|inr)",
        r"under\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:k\b)?",
        r"below\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:k\b)?",
        r"less\s+than\s+(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(?:k\b)?",
    ]

    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            amount = float(match.group(1))
            # Check if followed by 'k'
            if re.search(r"\d+(?:\.\d+)?\s*k\b", text_lower):
                amount *= 1000
            return int(amount * 100)  # convert to paise

    return 0


def extract_product_type(text: str) -> str:
    text_lower = text.lower()
    for product, keywords in PRODUCT_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return product
    return "general"


def extract_preference(text: str) -> str:
    text_lower = text.lower()
    for pref, keywords in PREFERENCE_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return pref
    return "best_value"


def parse_intent(query: str, filters: SearchFilters) -> IntentData:
    intent = IntentData(
        product_type=extract_product_type(query),
        budget_paise=extract_budget(query),
        preference=extract_preference(query),
        filters=filters,
        raw_query=query,
    )
    # Persist to intent.json
    _save_intent(intent)
    return intent


def _save_intent(intent: IntentData) -> None:
    path = Path(settings.intent_output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(intent.model_dump(), f, indent=2)
