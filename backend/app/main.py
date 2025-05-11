from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks
import os

# Load environment variables if using .env file for backend (optional here as Uvicorn can also manage this)
# from dotenv import load_dotenv
# load_dotenv()

app = FastAPI(
    title="TaskWise API",
    description="API for managing tasks in the TaskWise application.",
    version="0.1.0",
    openapi_url="/api/openapi.json", # Standardized OpenAPI path
    docs_url="/api/docs", # Standardized docs path
    redoc_url="/api/redoc" # Standardized ReDoc path
)

# CORS configuration
# Allow frontend running on localhost:9002 (Next.js default dev port from package.json)
# and potentially other ports/domains for staging/production.
# NEXT_PUBLIC_API_URL is http://localhost:8000/api, so frontend is likely on 9002 or 3000
origins = [
    "http://localhost:9002",
    "http://localhost:3000",
    # Add production frontend URL here, e.g., "https://your-frontend-domain.com"
]
# Check for a FRONTEND_URL environment variable for more dynamic configuration
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True, # Allows cookies to be included in requests
    allow_methods=["*"],    # Allows all standard HTTP methods
    allow_headers=["*"],    # Allows all headers
)

# Include routers
# All routes from tasks.router will be prefixed with /api
app.include_router(tasks.router, prefix="/api")


@app.get("/api/health", tags=["Health"], summary="Health check endpoint")
async def health_check():
    """
    Simple health check endpoint to confirm the API is running.
    """
    return {"status": "healthy", "message": "TaskWise API is up and running!"}

# Optional: Add a root endpoint for /api
@app.get("/api", include_in_schema=False)
async def api_root():
    return {"message": "Welcome to the TaskWise API. Visit /api/docs for documentation."}