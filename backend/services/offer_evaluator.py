"""
Offer Evaluator — Stage 3 of the Consumer Agent pipeline.
Fetches and ranks available offers for a given merchant and transaction amount.
In production, replace static OFFERS_CATALOG with a DB query.
"""
from typing import List, Dict

# Static offer catalog — seeded demo data
# In production: query DB offers table filtered by merchant_id + validity
OFFERS_CATALOG = [
    {
        "instrument": "HDFC_CREDIT_CARD",
        "payment_rail": "CARD",
        "cashback_paise": 50000,   # Rs 500
        "min_amount_paise": 500000,  # min Rs 5000
        "merchant_ids": ["demo_merchant_001", "amazon", "flipkart"],
        "description": "HDFC Credit Card: Rs 500 cashback on orders above Rs 5000",
    },
    {
        "instrument": "ICICI_CREDIT_CARD",
        "payment_rail": "CARD",
        "cashback_paise": 30000,   # Rs 300
        "min_amount_paise": 200000,  # min Rs 2000
        "merchant_ids": ["demo_merchant_001", "myntra"],
        "description": "ICICI Credit Card: Rs 300 cashback on orders above Rs 2000",
    },
    {
        "instrument": "WALLET",
        "payment_rail": "WALLET",
        "cashback_paise": 30000,   # Rs 300
        "min_amount_paise": 100000,  # min Rs 1000
        "merchant_ids": ["demo_merchant_001", "amazon", "flipkart", "myntra"],
        "description": "Paytm Wallet: Rs 300 cashback on orders above Rs 1000",
    },
    {
        "instrument": "UPI",
        "payment_rail": "UPI",
        "cashback_paise": 20000,   # Rs 200
        "min_amount_paise": 0,
        "merchant_ids": ["demo_merchant_001", "amazon", "flipkart"],
        "description": "UPI: Rs 200 cashback, no minimum order",
    },
    {
        "instrument": "SBI_DEBIT_CARD",
        "payment_rail": "CARD",
        "cashback_paise": 15000,   # Rs 150
        "min_amount_paise": 50000,  # min Rs 500
        "merchant_ids": ["demo_merchant_001"],
        "description": "SBI Debit Card: Rs 150 cashback on orders above Rs 500",
    },
]

# Rail success rates (based on historical Pine Labs data)
RAIL_SUCCESS_RATES: Dict[str, float] = {
    "CARD": 0.91,
    "UPI": 0.96,
    "WALLET": 0.88,
    "NETBANKING": 0.84,
    "BNPL": 0.82,
}


def evaluate_offers(
    merchant_id: str,
    amount_paise: int,
    user_card_instruments: List[str] | None = None,
) -> List[Dict]:
    """
    Returns ranked list of eligible offers for this transaction.
    Filters by: merchant eligibility + minimum order amount.
    Ranks by: cashback_paise descending.
    """
    eligible = []
    for offer in OFFERS_CATALOG:
        if merchant_id not in offer["merchant_ids"]:
            continue
        if amount_paise < offer["min_amount_paise"]:
            continue
        eligible.append({
            "instrument": offer["instrument"],
            "payment_rail": offer["payment_rail"],
            "cashback_paise": offer["cashback_paise"],
            "cashback_rupees": offer["cashback_paise"] // 100,
            "description": offer["description"],
            "success_rate": RAIL_SUCCESS_RATES.get(offer["payment_rail"], 0.8),
        })

    # Sort by cashback descending
    return sorted(eligible, key=lambda o: o["cashback_paise"], reverse=True)


def rule_based_picker(offers: List[Dict]) -> Dict | None:
    """
    Fallback if LLM is unavailable.
    Picks highest cashback offer with rail success_rate > 85%.
    """
    eligible = [o for o in offers if o.get("success_rate", 0) > 0.85]
    if not eligible:
        return None
    best = max(eligible, key=lambda o: o["cashback_paise"])
    return {
        "instrument": best["instrument"],
        "payment_rail": best["payment_rail"],
        "offer_value": best["cashback_rupees"],
        "offer_attached": True,
        "net_benefit": best["cashback_rupees"],
        "confidence": 0.75,
        "reasoning": f"Rule-based: highest cashback (Rs {best['cashback_rupees']}) on eligible rail.",
        "fallback": "UPI",
    }
