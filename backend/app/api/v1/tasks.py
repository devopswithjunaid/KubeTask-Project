from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.db import get_db
from app.models.models import Task, User
from app.schemas.schemas import TaskCreate, TaskUpdate, Task as TaskSchema

router = APIRouter()

@router.get("", response_model=List[TaskSchema])
async def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all tasks with pagination"""
    result = await db.execute(select(Task).offset(skip).limit(limit))
    tasks = result.scalars().all()
    return tasks

@router.post("", response_model=TaskSchema)
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new task"""
    # Ensure default user exists
    user_result = await db.execute(select(User).filter(User.id == 1))
    user = user_result.scalar_one_or_none()
    
    if not user:
        # Create default user if it doesn't exist
        default_user = User(
            id=1,
            email="default@kubetask.com",
            hashed_password="hashed_password",
            is_active=True
        )
        db.add(default_user)
        await db.commit()
    
    # Set default values for missing fields
    task_data = task.model_dump()
    task_data['status'] = task_data.get('status', 'pending')
    task_data['owner_id'] = 1  # Default user
    
    db_task = Task(**task_data)
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskSchema)
async def read_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific task by ID"""
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: int,
    task: TaskUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a specific task"""
    result = await db.execute(select(Task).filter(Task.id == task_id))
    db_task = result.scalar_one_or_none()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in task.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    await db.commit()
    await db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a specific task"""
    result = await db.execute(select(Task).filter(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    return {"status": "success", "message": f"Task {task_id} deleted successfully"}
