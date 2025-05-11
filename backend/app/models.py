from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
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

class TaskCreate(TaskBase):
    # Inherits all fields from TaskBase
    # Optionally, add fields specific to creation like created_by if passed from client
    created_by: Optional[str] = Field(default="User", description="User who created the task") # Example
    pass

class TaskUpdate(BaseModel):
    task_title: Optional[str] = Field(None, min_length=1, max_length=100, description="New title for the task")
    task_description: Optional[str] = Field(None, max_length=500, description="New description for the task")
    task_due_date: Optional[datetime] = Field(default=None, description="New due date for the task") # Allow setting to null
    task_status: Optional[TaskStatus] = Field(None, description="New status for the task")
    task_remarks: Optional[str] = Field(None, max_length=200, description="New remarks for the task")
    # last_updated_by will be set by the server typically

class TaskInDB(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the task")
    created_on: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of task creation")
    last_updated_on: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of last update")
    created_by: str = Field(default="System", description="Identifier of the creator") # Default, can be overridden
    last_updated_by: str = Field(default="System", description="Identifier of the last updater") # Default, can be overridden

    class Config:
        from_attributes = True # For Pydantic V2 to work with ORM-like objects
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class TaskPublic(TaskInDB): # What the API returns
    pass