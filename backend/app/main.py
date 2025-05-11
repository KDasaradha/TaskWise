from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks
from .database import create_tables # Import create_tables
import os

app = FastAPI(
    title="TaskWise API",
    description="API for managing tasks in the TaskWise application.",
    version="0.1.0",
    openapi_url="/api/openapi.json", 
    docs_url="/api/docs", 
    redoc_url="/api/redoc" 
)

# Add event handler for application startup
@app.on_event("startup")
async def startup_event():
    await create_tables() # Create database tables on startup

# CORS configuration
origins = [
    "http://localhost:9002", # Next.js default dev port for pnpm dev
    "http://localhost:3000", # Common React dev port
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api")

@app.get("/api/health", tags=["Health"], summary="Health check endpoint")
async def health_check():
    return {"status": "healthy", "message": "TaskWise API is up and running!"}

@app.get("/api", include_in_schema=False)
async def api_root():
    return {"message": "Welcome to the TaskWise API. Visit /api/docs for documentation."}
