import pytest
import asyncio
from unittest.mock import patch, AsyncMock

from app.models.enums import TaskStatusEnum


def test_ping_endpoint(client):
    """Test the ping endpoint."""
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "pong"}


def test_create_task(client, sample_task_request):
    """Test task creation."""
    response = client.post("/api/v1/run-task", json=sample_task_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "id" in data
    assert isinstance(data["id"], str)


def test_get_task_not_found(client):
    """Test getting a non-existent task."""
    response = client.get("/api/v1/task/non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_get_task_status_not_found(client):
    """Test getting status of a non-existent task."""
    response = client.get("/api/v1/task/non-existent-id/status")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_task_lifecycle(async_client, sample_task_request):
    """Test complete task lifecycle."""
    # Create task
    response = await async_client.post("/api/v1/run-task", json=sample_task_request)
    assert response.status_code == 200
    
    task_id = response.json()["id"]
    
    # Get task details
    response = await async_client.get(f"/api/v1/task/{task_id}")
    assert response.status_code == 200
    
    task_data = response.json()
    assert task_data["id"] == task_id
    assert task_data["task"] == sample_task_request["task"]
    assert task_data["status"] in [TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING]
    
    # Get task status
    response = await async_client.get(f"/api/v1/task/{task_id}/status")
    assert response.status_code == 200
    assert response.json() in [TaskStatusEnum.CREATED, TaskStatusEnum.RUNNING]


def test_stop_task_not_found(client):
    """Test stopping a non-existent task."""
    response = client.put("/api/v1/stop-task?task_id=non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found or not running"


def test_pause_task_not_found(client):
    """Test pausing a non-existent task."""
    response = client.put("/api/v1/pause-task?task_id=non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found or not running"


def test_resume_task_not_found(client):
    """Test resuming a non-existent task."""
    response = client.put("/api/v1/resume-task?task_id=non-existent-id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found or not paused"


def test_list_tasks_empty(client):
    """Test listing tasks when none exist."""
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
    
    data = response.json()
    assert data["tasks"] == []
    assert data["total_count"] == 0
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total_pages"] == 1


@pytest.mark.asyncio
async def test_list_tasks_with_data(async_client, sample_task_request):
    """Test listing tasks with data."""
    # Create a task
    response = await async_client.post("/api/v1/run-task", json=sample_task_request)
    assert response.status_code == 200
    
    # List tasks
    response = await async_client.get("/api/v1/tasks")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["tasks"]) == 1
    assert data["total_count"] == 1
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total_pages"] == 1


def test_list_tasks_pagination(client):
    """Test task listing pagination."""
    response = client.get("/api/v1/tasks?page=2&limit=5")
    assert response.status_code == 200
    
    data = response.json()
    assert data["page"] == 2
    assert data["limit"] == 5


def test_get_task_media(client, sample_task_request):
    """Test getting task media."""
    # Create task first
    response = client.post("/api/v1/run-task", json=sample_task_request)
    task_id = response.json()["id"]
    
    # Get media
    response = client.get(f"/api/v1/task/{task_id}/media")
    assert response.status_code == 200
    
    data = response.json()
    assert "recordings" in data


def test_get_task_screenshots(client, sample_task_request):
    """Test getting task screenshots."""
    # Create task first
    response = client.post("/api/v1/run-task", json=sample_task_request)
    task_id = response.json()["id"]
    
    # Get screenshots
    response = client.get(f"/api/v1/task/{task_id}/screenshots")
    assert response.status_code == 200
    
    data = response.json()
    assert "screenshots" in data


def test_get_task_gif(client, sample_task_request):
    """Test getting task GIF."""
    # Create task first
    response = client.post("/api/v1/run-task", json=sample_task_request)
    task_id = response.json()["id"]
    
    # Get GIF
    response = client.get(f"/api/v1/task/{task_id}/gif")
    assert response.status_code == 200
    
    data = response.json()
    assert "gif" in data


def test_delete_browser_profile(client):
    """Test deleting browser profile."""
    response = client.post("/api/v1/delete-browser-profile-for-user")
    assert response.status_code == 200
    assert response.json()["status"] == "deleted"


def test_get_output_file_not_found(client):
    """Test getting non-existent output file."""
    response = client.get("/api/v1/task/non-existent-id/output-file/test.txt")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"
