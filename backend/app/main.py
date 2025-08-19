from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app
import asyncio

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.redis import init_redis_pool
from app.core.db import init_db
from sqlalchemy import text

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    description="A Kubernetes-based task management system"
)

# Set up CORS - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://frontend:3000",
        "http://127.0.0.1:3000",
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        print("🚀 Starting KubeTask Backend...")
        
        # Initialize database with retries
        await init_db()
        
        # Initialize Redis (optional, won't fail if Redis is not available)
        try:
            await init_redis_pool()
            print("✅ Redis connection established!")
        except Exception as e:
            print(f"⚠️ Warning: Redis connection failed: {e}")
            print("ℹ️ Application will continue without Redis caching")
        
        print("✅ Application started successfully!")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "Welcome to KubeTask API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "tasks": "/api/v1/tasks",
            "docs": "/docs",
            "metrics": "/metrics"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration"""
    try:
        # Test database connection
        from app.core.db import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        
        return {
            "status": "healthy", 
            "service": "kubetask-backend",
            "database": "connected",
            "version": settings.VERSION
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "kubetask-backend", 
            "error": str(e),
            "version": settings.VERSION
        }

# Add a test endpoint for frontend connectivity
@app.get("/api/v1/test")
async def test_connection():
    """Test endpoint for frontend connectivity verification"""
    return {
        "message": "Backend connection successful", 
        "timestamp": "2025-08-06",
        "service": "kubetask-backend",
        "cors_enabled": True
    }
