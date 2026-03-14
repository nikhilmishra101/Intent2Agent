"""
Pine Labs Agent — handles all Pine Labs API interactions.
Manages auth token lifecycle and order creation/polling.
"""
import time
import httpx
from config import settings

_token_cache: dict = {"token": None, "expires_at": 0}

BASE_URL = settings.pinelabs_base_url
RETURN_URL = "http://localhost:3000/checkout/complete"


async def get_cached_token() -> str:
    """Returns a valid Bearer token, refreshing if expired."""
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 60:
        return _token_cache["token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/auth/v1/token",
            json={
                "client_id": settings.pinelabs_client_id,
                "client_secret": settings.pinelabs_client_secret,
                "grant_type": "client_credentials",
            },
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = now + data.get("expires_in", 3600)
    return _token_cache["token"]


async def create_pine_order(
    merchant_id: str,
    amount_paise: int,
    preferred_rail: str,
    fallback_rail: str = "UPI",
) -> dict:
    """
    Creates a Pine Labs order via POST /api/v1/orders.
    Returns order response including order_id.
    """
    token = await get_cached_token()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{BASE_URL}/api/v1/orders",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "merchant_data": {"merchant_id": merchant_id},
                "payment_data": {
                    "amount_in_paisa": amount_paise,
                    "preferred_payment_rail": preferred_rail,
                    "fallback_payment_rail": fallback_rail,
                },
                "order_meta": {"return_url": RETURN_URL},
            },
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json()


async def get_order_status(order_id: str) -> dict:
    """Polls Pine Labs for order status."""
    token = await get_cached_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{BASE_URL}/api/v1/order/{order_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json()
