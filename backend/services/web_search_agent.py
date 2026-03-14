"""
Web Search Agent — searches the web for product deals based on intent.
Uses Claude (via Anthropic API) with tool use for web search simulation.
In production, integrate with a real search API (SerpAPI, Tavily, etc.).
"""
from typing import List
from anthropic import AsyncAnthropic
from models.schemas import IntentData, SourceLink, SearchFilters
from config import settings


client = AsyncAnthropic(api_key=settings.anthropic_api_key)

# Simulated search results — replace with real search API in production
MOCK_SEARCH_RESULTS = {
    "shoes": [
        {"title": "Best Shoes Under ₹1000 in India 2024 — Amazon", "url": "https://www.amazon.in/s?k=shoes+under+1000", "snippet": "Explore top-rated shoes under ₹1000 with free delivery. Brands: Sparx, Campus, Action, Liberty."},
        {"title": "Budget Shoes Under ₹1000 — Flipkart", "url": "https://www.flipkart.com/shoes-under-1000", "snippet": "Huge collection of casual and sports shoes under ₹1000. Cash on delivery available."},
        {"title": "Top 10 Shoes Under 1000 Rupees — GadgetsNow", "url": "https://gadgetsnow.com/shoes-under-1000", "snippet": "We tested 50+ shoes and ranked the best budget picks for Indian consumers."},
    ],
    "headphones": [
        {"title": "Best Headphones Under ₹3000 — Amazon India", "url": "https://www.amazon.in/s?k=headphones+under+3000", "snippet": "Sony, boAt, JBL wireless headphones with 30hr battery, noise isolation, and mic."},
        {"title": "Budget Headphones 2024 — Smartprix", "url": "https://www.smartprix.com/headphones/under-3000", "snippet": "Compare prices and specs for the best headphones under ₹3000 from all major retailers."},
    ],
    "laptop": [
        {"title": "Best Laptops Under ₹50000 — Flipkart", "url": "https://www.flipkart.com/laptops-under-50000", "snippet": "Dell, Lenovo, HP laptops with i5/Ryzen 5, 8GB RAM, SSD. No-cost EMI available."},
        {"title": "Laptop Buying Guide India — Digit.in", "url": "https://www.digit.in/best-laptops-under-50000", "snippet": "Expert-reviewed laptop recommendations for students and professionals under ₹50,000."},
    ],
    "general": [
        {"title": "Best Online Shopping Deals — Amazon India", "url": "https://www.amazon.in/deals", "snippet": "Today's deals across all categories. Bank offers, cashback, and exchange offers available."},
        {"title": "Great Indian Sale — Flipkart", "url": "https://www.flipkart.com/offers", "snippet": "Exclusive discounts across electronics, fashion, and home products."},
    ],
}


async def web_search_for_products(
    intent: IntentData,
    preferred_brands: List[str],
    preferred_merchants: List[str],
) -> List[SourceLink]:
    """
    Searches for products matching the intent.
    Returns source links with relevant URLs and snippets.

    In production: replace mock results with real SerpAPI / Tavily call.
    """
    category = intent.product_type
    results = MOCK_SEARCH_RESULTS.get(category, MOCK_SEARCH_RESULTS["general"])

    sources = []
    for r in results:
        # Boost snippet if matches preferred brands
        snippet = r["snippet"]
        for brand in preferred_brands[:2]:
            if brand.lower() in snippet.lower():
                snippet = f"⭐ Matches your preference ({brand}). " + snippet
                break

        sources.append(SourceLink(
            title=r["title"],
            url=r["url"],
            snippet=snippet,
        ))

    return sources


async def generate_search_response(
    intent: IntentData,
    preferred_brands: List[str],
    sources: List[SourceLink],
    decision_summary: str,
) -> str:
    """
    Uses Claude to generate a natural language response summarizing
    the search results and payment recommendation.
    """
    if not settings.anthropic_api_key:
        # Fallback response without LLM
        budget_str = f"₹{intent.budget_paise // 100:,}" if intent.budget_paise else "your budget"
        brand_hint = f" Based on your history, I'm showing {preferred_brands[0]} options first." if preferred_brands else ""
        return (
            f"I found the best {intent.product_type} options within {budget_str}.{brand_hint} "
            f"{decision_summary}"
        )

    prompt = f"""You are CheckoutMind, an AI shopping assistant.
The user wants: "{intent.raw_query}"
Detected intent: {intent.product_type} under ₹{intent.budget_paise // 100:,}
User's preferred brands: {', '.join(preferred_brands) if preferred_brands else 'None detected'}
Payment recommendation: {decision_summary}
Filters applied: discounts={intent.filters.discount}, offers={intent.filters.offers}, trending={intent.filters.trending}

Write a brief, friendly 2-3 sentence response summarizing what you found and the payment recommendation.
Be specific about the product and the offer. Do not use markdown."""

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
