from fastapi import APIRouter, HTTPException, status, Body
from typing import List, Optional
from .. import crud
from ..models import TaskCreate, TaskUpdate, TaskPublic # Use TaskPublic for responses

router = APIRouter(
    prefix="/tasks", # Removed /api here as it's handled in main.py's include_router or by API gateway
    tags=["Tasks"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=TaskPublic, status_code=status.HTTP_201_CREATED, summary="Create a new task")
async def create_new_task(task: TaskCreate):
    """
    Create a new task with the given information.
    """
    return crud.create_task_db(task_create_data=task)

@router.get("/", response_model=List[TaskPublic], summary="Retrieve all tasks")
async def read_all_tasks():
    """
    Retrieve a list of all tasks.
    """
    return crud.get_tasks_db()

@router.get("/{task_id}", response_model=TaskPublic, summary="Retrieve a specific task by ID")
async def read_single_task(task_id: str):
    """
    Retrieve a specific task by its unique ID.
    """
    db_task = crud.get_task_db(task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=TaskPublic, summary="Update an existing task")
async def update_existing_task(task_id: str, task: TaskUpdate):
    """
    Update an existing task's information.
    Only provided fields will be updated.
    """
    updated_task = crud.update_task_db(task_id=task_id, task_update_data=task)
    if updated_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return updated_task

@router.delete("/{task_id}", response_model=TaskPublic, summary="Delete a task")
async def delete_single_task(task_id: str):
    """
    Delete a task by its unique ID.
    """
    deleted_task = crud.delete_task_db(task_id=task_id)
    if deleted_task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return deleted_task