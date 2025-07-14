import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient

from app.main import app
from app.utils.task_manager import task_manager


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """Create an async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
async def cleanup_tasks():
    """Clean up tasks after each test."""
    yield
    # Clear all tasks from the task manager
    async with task_manager._lock:
        task_manager._tasks.clear()
        task_manager._running_tasks.clear()


@pytest.fixture
def sample_task_request():
    """Sample task request for testing."""
    return {
        "task": "Navigate to google.com and search for 'browser automation'",
        "llm_model": "gpt-4o",
        "browser_viewport_width": 1280,
        "browser_viewport_height": 960,
        "max_agent_steps": 10
    }


@pytest.fixture
def sample_upload_request():
    """Sample upload request for testing."""
    return {
        "file_name": "test.txt",
        "content_type": "text/plain"
    }
