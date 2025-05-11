from typing import List, Optional, Dict
from datetime import datetime, timezone
from .models import TaskCreate, TaskUpdate, TaskInDB, TaskStatus
import uuid

# In-memory database: A dictionary to store tasks, with ID as key
db: Dict[str, TaskInDB] = {}

# Initialize with some data for development
def init_db():
    initial_tasks_data = [
        {
            'id': 'seed-1',
            'task_title': 'Setup Backend Project',
            'task_description': 'Initialize FastAPI, install dependencies like Uvicorn, Pydantic.',
            'task_due_date': datetime.now(timezone.utc),
            'task_status': TaskStatus.completed,
            'task_remarks': 'Backend setup complete!',
            'created_by': 'DevTeam',
        },
        {
            'id': 'seed-2',
            'task_title': 'Develop Task CRUD APIs',
            'task_description': 'Create FastAPI endpoints (POST, GET, PUT, DELETE) for tasks.',
            'task_due_date': datetime.now(timezone.utc),
            'task_status': TaskStatus.in_progress,
            'task_remarks': 'Working on GET and POST routes.',
            'created_by': 'BackendLead',
        },
        {
            'id': 'seed-3',
            'task_title': 'Integrate Frontend with Backend',
            'task_description': 'Update Next.js app to use FastAPI for task data.',
            'task_due_date': None,
            'task_status': TaskStatus.pending,
            'task_remarks': '',
            'created_by': 'FrontendLead',
        }
    ]
    for task_data in initial_tasks_data:
        task = TaskInDB(
            created_on=datetime.now(timezone.utc),
            last_updated_on=datetime.now(timezone.utc),
            last_updated_by=task_data['created_by'],
            **task_data
        )
        db[task.id] = task

init_db()


def get_tasks_db() -> List[TaskInDB]:
    return list(db.values())

def get_task_db(task_id: str) -> Optional[TaskInDB]:
    return db.get(task_id)

def create_task_db(task_create_data: TaskCreate) -> TaskInDB:
    now = datetime.now(timezone.utc)
    task_id = str(uuid.uuid4())
    
    new_task = TaskInDB(
        id=task_id,
        **task_create_data.model_dump(),
        created_on=now,
        last_updated_on=now,
        last_updated_by=task_create_data.created_by or "User" # Use provided or default
    )
    db[task_id] = new_task
    return new_task

def update_task_db(task_id: str, task_update_data: TaskUpdate) -> Optional[TaskInDB]:
    existing_task = db.get(task_id)
    if not existing_task:
        return None

    update_data = task_update_data.model_dump(exclude_unset=True)
    
    # Pydantic v2 model_copy for immutability, or direct update for mutability
    # For simplicity with dict-based db, we can create a new instance or update fields
    
    updated_task_data = existing_task.model_dump()
    updated_task_data.update(update_data)
    
    updated_task = TaskInDB(
        **updated_task_data,
        last_updated_on=datetime.now(timezone.utc),
        last_updated_by= "User" # Placeholder, ideally from authenticated user
    )
    db[task_id] = updated_task
    return updated_task

def delete_task_db(task_id: str) -> Optional[TaskInDB]:
    if task_id in db:
        return db.pop(task_id)
    return None