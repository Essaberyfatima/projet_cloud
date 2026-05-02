from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import transform

# =========================
# App Initialization
# =========================
app = FastAPI(
    title="DataShift API",
    description="Data Format Transformer API",
    version="1.0.0"
)

# =========================
# CORS Configuration
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # فـ production تقدر تحدد domain ديالك
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Routers
# =========================
app.include_router(transform.router)

# =========================
# Basic Routes
# =========================
@app.get("/")
def root():
    return {
        "status": "API running",
        "message": "Welcome to DataShift API"
    }

@app.get("/health")
def health_check():
    return {"status": "online"}