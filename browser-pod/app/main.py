from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from .config import settings
from .routers import health, tasks, uploads


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print(f"Starting Browser Pod API server...")
    print(f"Storage path: {settings.STORAGE_PATH}")
    
    yield
    
    # Shutdown
    print("Shutting down Browser Pod API server...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title="Browser Use Cloud",
        summary="Browser Use API for hosting agents",
        version="0.1.0",
        lifespan=lifespan,
        servers=[
            {
                "url": "https://api.browser-use.com",
                "description": "Production"
            }
        ]
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health.router)
    app.include_router(tasks.router)
    app.include_router(uploads.router)
    
    return app


# Create the app instance
app = create_app()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Browser Use Cloud API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/ping"
    }
