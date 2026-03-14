from pydantic import BaseModel
from typing import Optional, List


class SearchFilters(BaseModel):
    discount: bool = False
    offers: bool = False
    trending: bool = False


class CheckoutRequest(BaseModel):
    query: str
    filters: SearchFilters
    user_id: str = "demo_user_001"


class SourceLink(BaseModel):
    title: str
    url: str
    snippet: str
    favicon: Optional[str] = None


class AgentDecision(BaseModel):
    instrument: str
    payment_rail: str
    offer_value: float
    offer_attached: bool
    net_benefit: float
    confidence: float
    reasoning: str
    fallback: str


class ProductResult(BaseModel):
    name: str
    price: int           # in paise
    rating: float
    image_url: Optional[str] = None
    category: str


class IntentData(BaseModel):
    product_type: str
    budget_paise: int
    preference: str      # best_value | emi | specific_rail
    filters: SearchFilters
    raw_query: str


class CheckoutResponse(BaseModel):
    message: str
    intent: Optional[IntentData] = None
    product: Optional[ProductResult] = None
    decision: Optional[AgentDecision] = None
    sources: List[SourceLink] = []


class PurchaseHistoryItem(BaseModel):
    product_name: str
    category: str
    brand: str
    amount_paise: int
    merchant: str
    payment_method: str
    date: str


class CardDetail(BaseModel):
    card_id: str
    bank: str
    card_type: str        # CREDIT | DEBIT
    last_four: str
    usage_count: int
    preferred: bool
