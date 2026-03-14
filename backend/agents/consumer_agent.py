"""
Consumer Intelligence Agent — main orchestrator.
Runs the 5-stage pipeline:
  1. Intent Parser     (intent_parser.py)
  2. Product Selector  (product_selector.py)
  3. Offer Evaluator   (offer_evaluator.py)
  4. LLM Picker        (Anthropic Claude via API)
  5. Response Builder  (web_search_agent.py)
"""
import asyncio
import json
from anthropic import AsyncAnthropic
from models.schemas import (
    CheckoutRequest, CheckoutResponse, AgentDecision, SearchFilters
)
from services.intent_parser import parse_intent
from services.purchase_history import (
    fetch_purchase_history,
    get_preferred_brands_for_category,
    get_preferred_merchants,
)
from services.card_service import fetch_user_cards, map_card_to_instrument
from services.offer_evaluator import evaluate_offers, rule_based_picker, RAIL_SUCCESS_RATES
from services.product_selector import select_product
from services.web_search_agent import web_search_for_products, generate_search_response
from config import settings

client = AsyncAnthropic(api_key=settings.anthropic_api_key)

CONSUMER_SYSTEM_PROMPT = """You are the CheckoutMind Consumer Agent, a payment optimisation AI.
Your job: select the single best payment instrument for this transaction.
Respond ONLY with valid JSON. No markdown, no prose, no explanation outside JSON.
Consider: cashback value, rail success rate, user preference, offer eligibility.
If offer_attached is true on the chosen instrument, mark it explicitly."""


async def run_consumer_agent(request: CheckoutRequest) -> CheckoutResponse:
    """
    Main entry point. Runs all 5 stages in optimal async order.
    Stages 1-3 are parallelized where possible.
    """
    # Stage 1: Parse intent (synchronous, fast)
    intent = parse_intent(request.query, request.filters)

    # Stages run concurrently: purchase history + card details
    preferred_brands_task = get_preferred_brands_for_category(
        request.user_id, intent.product_type
    )
    preferred_merchants_task = get_preferred_merchants(request.user_id)
    user_cards_task = fetch_user_cards(request.user_id)

    preferred_brands, preferred_merchants, user_cards = await asyncio.gather(
        preferred_brands_task, preferred_merchants_task, user_cards_task
    )

    # Stage 2: Product selection (uses preferred brands from history)
    product = select_product(intent.product_type, intent.budget_paise, preferred_brands)

    # Stage 3: Offer evaluation
    amount = product.price if product else intent.budget_paise
    offers = evaluate_offers(
        merchant_id=settings.pinelabs_merchant_id,
        amount_paise=amount,
        user_card_instruments=[map_card_to_instrument(c) for c in user_cards],
    )

    # Stage 4: LLM instrument picker
    decision_dict = await _llm_instrument_picker(
        amount=amount,
        product_name=product.name if product else intent.product_type,
        preference=intent.preference,
        offers=offers,
    )

    decision = AgentDecision(**decision_dict) if decision_dict else None

    # Stage 5: Web search + response generation
    sources = await web_search_for_products(intent, preferred_brands, preferred_merchants)

    decision_summary = (
        f"Best payment: {decision.instrument} with ₹{decision.offer_value} cashback."
        if decision and decision.offer_attached
        else "No special offers found — UPI is recommended for speed."
    )

    message = await generate_search_response(
        intent, preferred_brands, sources, decision_summary
    )

    return CheckoutResponse(
        message=message,
        intent=intent,
        product=product,
        decision=decision,
        sources=sources,
    )


async def _llm_instrument_picker(
    amount: int, product_name: str, preference: str, offers: list
) -> dict | None:
    """Stage 4: LLM selects optimal instrument. Falls back to rule-based."""
    if not settings.anthropic_api_key or not offers:
        return rule_based_picker(offers)

    # Build offer lines for prompt
    offer_lines = "\n".join(
        f"  {o['instrument']}: Rs {o['cashback_rupees']} cashback "
        f"(rail success: {int(o['success_rate']*100)}%)"
        for o in offers[:5]
    )

    rail_lines = "\n".join(
        f"  {rail}: {int(rate*100)}%"
        for rail, rate in RAIL_SUCCESS_RATES.items()
    )

    user_prompt = f"""transaction_amount: Rs {amount // 100}
product: {product_name}
customer_preference: {preference}

available_offers:
{offer_lines}

rail_success_rates:
{rail_lines}

REQUIRED JSON OUTPUT:
{{
  "instrument": "...",
  "payment_rail": "...",
  "offer_value": 0,
  "offer_attached": true,
  "net_benefit": 0,
  "confidence": 0.0,
  "reasoning": "...",
  "fallback": "UPI"
}}"""

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=CONSUMER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
        text = response.content[0].text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"[LLM picker error] {e} — falling back to rule-based")
        return rule_based_picker(offers)
