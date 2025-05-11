from typing import List, Optional
from datetime import datetime, timezone
from .models import TaskCreate, TaskUpdate, TaskInDB, TaskStatus
from .database import get_db_connection
import uuid

def _to_iso_optional(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None

def _from_iso_optional(iso_str: Optional[str]) -> Optional[datetime]:
    return datetime.fromisoformat(iso_str) if iso_str else None

def _from_iso(iso_str: str) -> datetime:
    return datetime.fromisoformat(iso_str)


async def get_tasks_db() -> List[TaskInDB]:
    async with await get_db_connection() as db:
        cursor = await db.execute("SELECT * FROM tasks ORDER BY created_on DESC")
        rows = await cursor.fetchall()
        return [
            TaskInDB(
                id=row["id"],
                task_title=row["task_title"],
                task_description=row["task_description"],
                task_due_date=_from_iso_optional(row["task_due_date"]),
                task_status=TaskStatus(row["task_status"]),
                task_remarks=row["task_remarks"],
                created_on=_from_iso(row["created_on"]),
                last_updated_on=_from_iso(row["last_updated_on"]),
                created_by=row["created_by"],
                last_updated_by=row["last_updated_by"],
            )
            for row in rows
        ]

async def get_task_db(task_id: str) -> Optional[TaskInDB]:
    async with await get_db_connection() as db:
        cursor = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cursor.fetchone()
        if row:
            return TaskInDB(
                id=row["id"],
                task_title=row["task_title"],
                task_description=row["task_description"],
                task_due_date=_from_iso_optional(row["task_due_date"]),
                task_status=TaskStatus(row["task_status"]),
                task_remarks=row["task_remarks"],
                created_on=_from_iso(row["created_on"]),
                last_updated_on=_from_iso(row["last_updated_on"]),
                created_by=row["created_by"],
                last_updated_by=row["last_updated_by"],
            )
        return None

async def create_task_db(task_create_data: TaskCreate) -> TaskInDB:
    now = datetime.now(timezone.utc)
    task_id = str(uuid.uuid4())
    
    new_task_db_data = {
        "id": task_id,
        "task_title": task_create_data.task_title,
        "task_description": task_create_data.task_description,
        "task_due_date": _to_iso_optional(task_create_data.task_due_date),
        "task_status": task_create_data.task_status.value,
        "task_remarks": task_create_data.task_remarks,
        "created_on": now.isoformat(),
        "last_updated_on": now.isoformat(),
        "created_by": task_create_data.created_by or "User",
        "last_updated_by": task_create_data.created_by or "User",
    }

    async with await get_db_connection() as db:
        await db.execute(
            """
            INSERT INTO tasks (id, task_title, task_description, task_due_date, task_status, 
                               task_remarks, created_on, last_updated_on, created_by, last_updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            tuple(new_task_db_data.values()),
        )
        await db.commit()

    return TaskInDB(
        id=new_task_db_data["id"],
        task_title=new_task_db_data["task_title"],
        task_description=new_task_db_data["task_description"],
        task_due_date=task_create_data.task_due_date, # Keep as datetime for Pydantic model
        task_status=task_create_data.task_status,
        task_remarks=new_task_db_data["task_remarks"],
        created_on=now,
        last_updated_on=now,
        created_by=new_task_db_data["created_by"],
        last_updated_by=new_task_db_data["last_updated_by"],
    )

async def update_task_db(task_id: str, task_update_data: TaskUpdate) -> Optional[TaskInDB]:
    existing_task = await get_task_db(task_id)
    if not existing_task:
        return None

    now = datetime.now(timezone.utc)
    update_fields = task_update_data.model_dump(exclude_unset=True)
    
    # Prepare fields for SQL query
    sql_set_parts = []
    sql_values = []

    for key, value in update_fields.items():
        sql_set_parts.append(f"{key} = ?")
        if isinstance(value, datetime):
            sql_values.append(value.isoformat())
        elif isinstance(value, TaskStatus):
            sql_values.append(value.value)
        else:
            sql_values.append(value)
    
    # Always update last_updated_on and last_updated_by
    sql_set_parts.append("last_updated_on = ?")
    sql_values.append(now.isoformat())
    # Assuming last_updated_by comes from authenticated user, placeholder for now
    # If you add last_updated_by to TaskUpdate model, handle it above
    last_updated_by_user = task_update_data.model_dump().get("last_updated_by", "User") # Default if not provided
    sql_set_parts.append("last_updated_by = ?")
    sql_values.append(last_updated_by_user)


    sql_values.append(task_id) # For WHERE clause

    if not sql_set_parts: # No fields to update other than timestamp
        async with await get_db_connection() as db:
            await db.execute(
                "UPDATE tasks SET last_updated_on = ?, last_updated_by = ? WHERE id = ?",
                (now.isoformat(), last_updated_by_user, task_id)
            )
            await db.commit()
    else:
        sql_query = f"UPDATE tasks SET {', '.join(sql_set_parts)} WHERE id = ?"
        async with await get_db_connection() as db:
            await db.execute(sql_query, tuple(sql_values))
            await db.commit()

    return await get_task_db(task_id) # Fetch updated task

async def delete_task_db(task_id: str) -> Optional[TaskInDB]:
    task_to_delete = await get_task_db(task_id)
    if not task_to_delete:
        return None
    
    async with await get_db_connection() as db:
        await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        await db.commit()
    return task_to_delete
