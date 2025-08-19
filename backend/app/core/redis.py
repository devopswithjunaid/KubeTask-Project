import redis.asyncio as redis
from app.core.config import settings
import asyncio

redis_pool = None

async def init_redis_pool():
    """Initialize Redis connection pool"""
    global redis_pool
    try:
        redis_pool = redis.ConnectionPool.from_url(
            f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
            retry_on_timeout=True
        )
        
        # Test the connection
        async with redis.Redis(connection_pool=redis_pool) as r:
            await r.ping()
        
        print("✅ Redis connection pool initialized successfully!")
        return redis_pool
        
    except Exception as e:
        print(f"❌ Redis initialization failed: {e}")
        raise

async def get_redis():
    """Get Redis connection from pool"""
    if redis_pool is None:
        raise Exception("Redis pool not initialized")
    return redis.Redis(connection_pool=redis_pool)

async def close_redis_pool():
    """Close Redis connection pool"""
    global redis_pool
    if redis_pool:
        await redis_pool.disconnect()
        redis_pool = None
        print("✅ Redis connection pool closed")
