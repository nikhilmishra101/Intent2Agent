from fastapi import APIRouter, HTTPException
from models.schemas import CheckoutRequest, CheckoutResponse
from agents.consumer_agent import run_consumer_agent

router = APIRouter(prefix="/api", tags=["checkout"])


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(request: CheckoutRequest) -> CheckoutResponse:
    """
    Main checkout endpoint.
    Accepts natural language query + filters, runs the full agent pipeline,
    returns product recommendation, payment decision, and source links.
    """
    try:
        return await run_consumer_agent(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
