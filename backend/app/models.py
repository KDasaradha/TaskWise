from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid

class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"

class TaskBase(BaseModel):
    task_title: str = Field(..., min_length=1, max_length=100, description="Title of the task")
    task_description: Optional[str] = Field(default="", max_length=500, description="Detailed description of the task")
    task_due_date: Optional[datetime] = Field(default=None, description="Due date for the task")
    task_status: TaskStatus = Field(default=TaskStatus.pending, description="Current status of the task")
    task_remarks: Optional[str] = Field(default="", max_length=200, description="Additional remarks or comments for the task")

    @field_validator('task_due_date', mode='before')
    @classmethod
    def parse_due_date(cls, value):
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                # Handle cases where it might not be a full ISO string from client yet, or invalid
                # For now, we'll assume valid ISO strings or None. Add more parsing if needed.
                return None 
        if isinstance(value, datetime):
            return value
        return None


class TaskCreate(TaskBase):
    created_by: Optional[str] = Field(default="User", description="User who created the task")

class TaskUpdate(BaseModel):
    task_title: Optional[str] = Field(None, min_length=1, max_length=100)
    task_description: Optional[str] = Field(None, max_length=500)
    task_due_date: Optional[datetime] = Field(None) # Allow setting to null or new date
    task_status: Optional[TaskStatus] = Field(None)
    task_remarks: Optional[str] = Field(None, max_length=200)
    last_updated_by: Optional[str] = Field(default="User", description="User who updated the task") # Can be set by server too

    @field_validator('task_due_date', mode='before')
    @classmethod
    def parse_update_due_date(cls, value):
        if value is None: # Explicitly setting to null
            return None
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
            except ValueError:
                return None
        if isinstance(value, datetime):
            return value
        return None


class TaskInDB(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_updated_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = Field(default="System")
    last_updated_by: str = Field(default="System")

    class Config:
        from_attributes = True # For Pydantic V2 to work with ORM-like objects
        # JSON encoders are useful for serializing datetime objects to ISO strings in responses
        # Pydantic v2 handles this by default for recognized types like datetime.
        # If specific formatting is needed, uncomment and adjust.
        # json_encoders = {
        #     datetime: lambda v: v.isoformat() if v else None
        # }

    @field_validator('created_on', 'last_updated_on', mode='before')
    @classmethod
    def parse_timestamps(cls, value):
        if isinstance(value, str):
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value


class TaskPublic(TaskInDB): # What the API returns to client
    pass
