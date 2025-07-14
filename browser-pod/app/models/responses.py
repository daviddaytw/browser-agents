from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from .enums import TaskStatusEnum


class TaskCreatedResponse(BaseModel):
    """Response model for task creation."""
    id: str = Field(..., description="Task ID")


class TaskStepResponse(BaseModel):
    """Response model for task step information."""
    id: str = Field(..., description="Step ID")
    step: int = Field(..., description="Step number")
    evaluation_previous_goal: str = Field(..., description="Assessment of the previous goal's completion")
    next_goal: str = Field(..., description="Description of what the next step aims to achieve")
    url: str = Field(..., description="URL of the page where the step was executed")


class TaskBrowserDataResponse(BaseModel):
    """Response model for browser data."""
    cookies: List[Dict[str, Any]] = Field(..., description="List of cookies from the browser session")


class TaskResponse(BaseModel):
    """Response model for detailed task information."""
    id: str = Field(..., description="Task ID")
    task: str = Field(..., description="Task description")
    live_url: Optional[str] = Field(None, description="URL to view live task execution")
    output: Optional[str] = Field(None, description="Final output or result of the task")
    status: TaskStatusEnum = Field(..., description="Current task status")
    created_at: datetime = Field(..., description="Task creation timestamp")
    finished_at: Optional[datetime] = Field(None, description="Task completion timestamp")
    steps: List[TaskStepResponse] = Field(..., description="List of task execution steps")
    browser_data: Optional[TaskBrowserDataResponse] = Field(None, description="Browser session data")
    user_uploaded_files: Optional[List[str]] = Field(None, description="List of user uploaded files")
    output_files: Optional[List[str]] = Field(None, description="List of output files generated")
    public_share_url: Optional[str] = Field(None, description="Public sharing URL")


class TaskSimpleResponse(BaseModel):
    """Response model for simple task information."""
    id: str = Field(..., description="Task ID")
    task: str = Field(..., description="Task description")
    output: Optional[str] = Field(None, description="Final output or result of the task")
    status: TaskStatusEnum = Field(..., description="Current task status")
    created_at: datetime = Field(..., description="Task creation timestamp")
    finished_at: Optional[datetime] = Field(None, description="Task completion timestamp")
    live_url: Optional[str] = Field(None, description="URL to view live task execution")


class ListTasksResponse(BaseModel):
    """Response model for task listing."""
    tasks: List[TaskSimpleResponse] = Field(..., description="List of tasks")
    total_pages: int = Field(..., description="Total number of pages available")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    total_count: int = Field(..., description="Total number of tasks across all pages")


class TaskMediaResponse(BaseModel):
    """Response model for task media."""
    recordings: Optional[List[str]] = Field(None, description="List of recording URLs")


class TaskScreenshotsResponse(BaseModel):
    """Response model for task screenshots."""
    screenshots: Optional[List[str]] = Field(None, description="List of screenshot URLs")


class TaskGifResponse(BaseModel):
    """Response model for task GIF."""
    gif: Optional[str] = Field(None, description="GIF URL")


class TaskOutputFileResponse(BaseModel):
    """Response model for task output file."""
    download_url: str = Field(..., description="Presigned URL for downloading the output file")


class UploadFileResponse(BaseModel):
    """Response model for file upload."""
    upload_url: str = Field(..., description="Presigned URL for uploading a file")


class ValidationError(BaseModel):
    """Validation error model."""
    loc: List[Any] = Field(..., description="Location of the error")
    msg: str = Field(..., description="Error message")
    type: str = Field(..., description="Error type")


class HTTPValidationError(BaseModel):
    """HTTP validation error model."""
    detail: List[ValidationError] = Field(..., description="List of validation errors")
