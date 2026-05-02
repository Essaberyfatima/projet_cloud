from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import transform

app = FastAPI(title="DataShift API", description="Data Format Transformer API")

# Add CORS middleware to allow requests from both typical React local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(transform.router)

@app.get("/health")
def health_check():
    return {"status": "online"}
