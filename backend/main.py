from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.checkout import router as checkout_router
from api.routes.history import router as history_router
from api.routes.websocket import router as ws_router
from config import settings

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Checkout Intelligence Platform for Pine Labs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkout_router)
app.include_router(history_router)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
