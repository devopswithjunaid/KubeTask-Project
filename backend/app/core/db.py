from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.future import select
import asyncio

from app.core.config import settings

# Create async engine with better connection handling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Enable SQL logging for debugging
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def init_db():
    """Initialize database and create tables"""
    try:
        print("🔄 Initializing database...")
        
        # Wait for database to be ready
        max_retries = 30
        for attempt in range(max_retries):
            try:
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                print("✅ Database tables created successfully!")
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"⏳ Database not ready (attempt {attempt + 1}/{max_retries}), retrying in 2 seconds...")
                    await asyncio.sleep(2)
                else:
                    print(f"❌ Failed to initialize database after {max_retries} attempts: {e}")
                    raise
        
        # Seed default user if it doesn't exist
        await seed_default_user()
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise

async def seed_default_user():
    """Create a default user for task ownership"""
    try:
        from app.models.models import User
        
        async with AsyncSessionLocal() as session:
            # Check if default user exists
            result = await session.execute(select(User).filter(User.id == 1))
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                default_user = User(
                    id=1,
                    email="default@kubetask.com",
                    hashed_password="hashed_password_placeholder",
                    is_active=True
                )
                session.add(default_user)
                await session.commit()
                print("✅ Default user created successfully!")
            else:
                print("ℹ️ Default user already exists")
                
    except Exception as e:
        print(f"⚠️ Warning: Could not seed default user: {e}")
        # Don't fail the entire initialization for this

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            print(f"❌ Database session error: {e}")
            raise
        finally:
            await session.close()
