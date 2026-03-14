from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from mangum import Mangum

app = FastAPI(
    title="Intent2Agent AI Checkout API",
    description="Backend for AI-Powered Intelligent Checkout & Payment Optimization",
    version="1.0.0"
)

# Configure CORS so the React frontend can bypass browser security policies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main API router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Intent2Agent Backend API"}

# Wrap the FastAPI application with Mangum. 
# This handles translating AWS Lambda events into ASGI requests.
handler = Mangum(app)

