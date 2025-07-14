import asyncio
import math
from typing import Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, Path
from fastapi.responses import FileResponse

from ..models.requests import RunTaskRequest
from ..models.responses import (
    TaskCreatedResponse, TaskResponse, TaskStatusEnum, 
    ListTasksResponse, TaskMediaResponse, TaskScreenshotsResponse,
    TaskGifResponse, TaskOutputFileResponse
)
from ..utils.task_manager import task_manager
from ..services.browser_service import browser_service
from ..config import settings

router = APIRouter(prefix="/api/v1", tags=["API v1.0"])


@router.post("/run-task", response_model=TaskCreatedResponse)
async def run_task(request: RunTaskRequest, background_tasks: BackgroundTasks):
    """
    Requires an active subscription. Returns the task ID that can be used to track progress.
    """
    # Create task
    task_id = await task_manager.create_task(request.task)
    
    # Start task execution in background
    background_tasks.add_task(
        browser_service.create_and_run_task,
        task_id,
        request
    )
    
    # Register the background task
    task = asyncio.create_task(
        browser_service.create_and_run_task(task_id, request)
    )
    await task_manager.register_running_task(task_id, task)
    
    return TaskCreatedResponse(id=task_id)


@router.put("/stop-task")
async def stop_task(task_id: str = Query(..., description="Task ID")):
    """
    Stops a running browser automation task immediately. The task cannot be resumed after being stopped.
    Use `/pause-task` endpoint instead if you want to temporarily halt execution.
    """
    success = await browser_service.stop_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not running")
    
    return {"status": "stopped"}


@router.put("/pause-task")
async def pause_task(task_id: str = Query(..., description="Task ID")):
    """
    Pauses execution of a running task. The task can be resumed later using the `/resume-task` endpoint. 
    Useful for manual intervention or inspection.
    """
    success = await browser_service.pause_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not running")
    
    return {"status": "paused"}


@router.put("/resume-task")
async def resume_task(task_id: str = Query(..., description="Task ID")):
    """
    Resumes execution of a previously paused task. The task will continue from where it was paused. 
    You can't resume a stopped task.
    """
    success = await browser_service.resume_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not paused")
    
    return {"status": "resumed"}


@router.get("/task/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str = Path(..., description="Task ID")):
    """
    Returns comprehensive information about a task, including its current status, steps completed, 
    output (if finished), and other metadata.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_manager.to_task_response(task_data)


@router.get("/task/{task_id}/status", response_model=TaskStatusEnum)
async def get_task_status(task_id: str = Path(..., description="Task ID")):
    """
    Returns just the current status of a task (created, running, finished, stopped, or paused).
    More lightweight than the full task details endpoint.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_data.status


@router.get("/task/{task_id}/media", response_model=TaskMediaResponse)
async def get_task_media(task_id: str = Path(..., description="Task ID")):
    """
    Returns links to any recordings or media generated during task execution,
    such as browser session recordings. Only available for completed tasks.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskMediaResponse(recordings=task_data.recordings)


@router.get("/task/{task_id}/screenshots", response_model=TaskScreenshotsResponse)
async def get_task_screenshots(task_id: str = Path(..., description="Task ID")):
    """
    Returns any screenshot urls generated during task execution.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskScreenshotsResponse(screenshots=task_data.screenshots)


@router.get("/task/{task_id}/gif", response_model=TaskGifResponse)
async def get_task_gif(task_id: str = Path(..., description="Task ID")):
    """
    Returns a gif url generated from the screenshots of the task execution.
    Only available for completed tasks that have screenshots.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # For now, return None as GIF generation is not implemented
    return TaskGifResponse(gif=None)


@router.get("/task/{task_id}/output-file/{file_name}", response_model=TaskOutputFileResponse)
async def get_task_output_file(
    task_id: str = Path(..., description="Task ID"),
    file_name: str = Path(..., description="File name")
):
    """
    Returns a presigned url for downloading a file from the task output files.
    """
    task_data = await task_manager.get_task(task_id)
    if not task_data:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if file exists in task output files
    if file_name not in task_data.output_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    # For local development, return a direct download URL
    file_path = settings.OUTPUTS_PATH / task_id / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    # In production, you would generate a presigned URL here
    download_url = f"/api/v1/download/output/{task_id}/{file_name}"
    return TaskOutputFileResponse(download_url=download_url)


@router.get("/tasks", response_model=ListTasksResponse)
async def list_tasks(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page")
):
    """
    Returns a paginated list of all tasks belonging to the user, ordered by creation date.
    Each task includes basic information like status and creation time. For detailed task info, 
    use the get task endpoint.
    """
    tasks, total_count = await task_manager.list_tasks(page=page, limit=limit)
    
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    
    task_responses = [task_manager.to_simple_response(task) for task in tasks]
    
    return ListTasksResponse(
        tasks=task_responses,
        total_pages=total_pages,
        page=page,
        limit=limit,
        total_count=total_count
    )


@router.post("/delete-browser-profile-for-user")
async def delete_browser_profile_for_user():
    """
    Deletes the browser profile for the user.
    """
    # In a real implementation, you would delete browser profile data
    # For now, just return success
    return {"status": "deleted"}


# Helper endpoint for file downloads (not in OpenAPI spec but needed for local development)
@router.get("/download/output/{task_id}/{file_name}")
async def download_output_file(task_id: str, file_name: str):
    """Download output file directly."""
    file_path = settings.OUTPUTS_PATH / task_id / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        filename=file_name,
        media_type='application/octet-stream'
    )
