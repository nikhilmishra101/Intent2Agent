"""
WebSocket endpoint for real-time agent progress updates.
Pushes CONSUMER_DECISION events to connected clients.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter(tags=["websocket"])

# Active connections registry
_connections: list[WebSocket] = []


@router.websocket("/ws/checkout")
async def websocket_checkout(websocket: WebSocket):
    await websocket.accept()
    _connections.append(websocket)
    try:
        while True:
            # Keep connection alive; server pushes events via broadcast_decision()
            data = await websocket.receive_text()
            # Echo back for ping/pong health check
            await websocket.send_text(json.dumps({"type": "PONG"}))
    except WebSocketDisconnect:
        _connections.remove(websocket)


async def broadcast_decision(event: dict) -> None:
    """
    Broadcast a CONSUMER_DECISION event to all connected WebSocket clients.
    Called from consumer_agent.py after LLM decision is made.
    """
    dead = []
    for ws in _connections:
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _connections.remove(ws)
