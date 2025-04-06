from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from app.routers import content, images, deep_research

# Initialize FastAPI app
app = FastAPI(
    title="ShoppingAI API",
    description="Backend API for ShoppingAI: AI-Powered Shopping Assistant",
    version="1.0.0"
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://frontend:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"]
)

# Include routers
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(deep_research.router, prefix="/api/deep-research", tags=["deep-research"])

# Set up static files directory
static_directory = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_directory), html=True, check_dir=True), name="static")

# Make sure the static directories exist
os.makedirs(static_directory / "generated_images", exist_ok=True)
os.makedirs(static_directory / "audio", exist_ok=True)

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ShoppingAI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
