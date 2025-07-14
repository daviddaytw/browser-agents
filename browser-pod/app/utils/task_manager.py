import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from ..models.enums import TaskStatusEnum
from ..models.responses import TaskResponse, TaskSimpleResponse, TaskStepResponse


@dataclass
class TaskData:
    """In-memory task data structure."""
    id: str
    task: str
    status: TaskStatusEnum
    created_at: datetime
    finished_at: Optional[datetime] = None
    output: Optional[str] = None
    steps: List[Dict[str, Any]] = field(default_factory=list)
    screenshots: List[str] = field(default_factory=list)
    recordings: List[str] = field(default_factory=list)
    output_files: List[str] = field(default_factory=list)
    user_uploaded_files: List[str] = field(default_factory=list)
    browser_data: Optional[Dict[str, Any]] = None
    live_url: Optional[str] = None
    public_share_url: Optional[str] = None
    agent_instance: Optional[Any] = None  # Browser-use Agent instance
    cancel_event: Optional[asyncio.Event] = None
    pause_event: Optional[asyncio.Event] = None


class TaskManager:
    """In-memory task manager for handling task lifecycle."""
    
    def __init__(self):
        self._tasks: Dict[str, TaskData] = {}
        self._lock = asyncio.Lock()
        self._running_tasks: Dict[str, asyncio.Task] = {}
    
    async def create_task(self, task_description: str, **kwargs) -> str:
        """Create a new task and return its ID."""
        task_id = str(uuid.uuid4())
        
        async with self._lock:
            task_data = TaskData(
                id=task_id,
                task=task_description,
                status=TaskStatusEnum.CREATED,
                created_at=datetime.utcnow(),
                cancel_event=asyncio.Event(),
                pause_event=asyncio.Event()
            )
            
            # Set pause event initially (task starts paused until run)
            task_data.pause_event.set()
            
            self._tasks[task_id] = task_data
        
        return task_id
    
    async def get_task(self, task_id: str) -> Optional[TaskData]:
        """Get task data by ID."""
        async with self._lock:
            return self._tasks.get(task_id)
    
    async def update_task_status(self, task_id: str, status: TaskStatusEnum):
        """Update task status."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].status = status
                if status in [TaskStatusEnum.FINISHED, TaskStatusEnum.STOPPED, TaskStatusEnum.FAILED]:
                    self._tasks[task_id].finished_at = datetime.utcnow()
    
    async def add_task_step(self, task_id: str, step_data: Dict[str, Any]):
        """Add a step to task execution history."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].steps.append(step_data)
    
    async def set_task_output(self, task_id: str, output: str):
        """Set task output."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].output = output
    
    async def add_screenshot(self, task_id: str, screenshot_path: str):
        """Add screenshot to task."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].screenshots.append(screenshot_path)
    
    async def add_recording(self, task_id: str, recording_path: str):
        """Add recording to task."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].recordings.append(recording_path)
    
    async def add_output_file(self, task_id: str, file_path: str):
        """Add output file to task."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].output_files.append(file_path)
    
    async def set_agent_instance(self, task_id: str, agent: Any):
        """Set the browser-use agent instance for the task."""
        async with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id].agent_instance = agent
    
    async def pause_task(self, task_id: str) -> bool:
        """Pause a running task."""
        async with self._lock:
            if task_id in self._tasks and self._tasks[task_id].status == TaskStatusEnum.RUNNING:
                self._tasks[task_id].status = TaskStatusEnum.PAUSED
                if self._tasks[task_id].pause_event:
                    self._tasks[task_id].pause_event.clear()
                return True
            return False
    
    async def resume_task(self, task_id: str) -> bool:
        """Resume a paused task."""
        async with self._lock:
            if task_id in self._tasks and self._tasks[task_id].status == TaskStatusEnum.PAUSED:
                self._tasks[task_id].status = TaskStatusEnum.RUNNING
                if self._tasks[task_id].pause_event:
                    self._tasks[task_id].pause_event.set()
                return True
            return False
    
    async def stop_task(self, task_id: str) -> bool:
        """Stop a running or paused task."""
        async with self._lock:
            if task_id in self._tasks:
                task_data = self._tasks[task_id]
                if task_data.status in [TaskStatusEnum.RUNNING, TaskStatusEnum.PAUSED]:
                    task_data.status = TaskStatusEnum.STOPPED
                    task_data.finished_at = datetime.utcnow()
                    
                    # Signal cancellation
                    if task_data.cancel_event:
                        task_data.cancel_event.set()
                    
                    # Cancel the running task
                    if task_id in self._running_tasks:
                        self._running_tasks[task_id].cancel()
                        del self._running_tasks[task_id]
                    
                    return True
            return False
    
    async def register_running_task(self, task_id: str, task: asyncio.Task):
        """Register a running asyncio task."""
        async with self._lock:
            self._running_tasks[task_id] = task
    
    async def unregister_running_task(self, task_id: str):
        """Unregister a completed asyncio task."""
        async with self._lock:
            if task_id in self._running_tasks:
                del self._running_tasks[task_id]
    
    async def list_tasks(self, page: int = 1, limit: int = 10) -> tuple[List[TaskData], int]:
        """List tasks with pagination."""
        async with self._lock:
            all_tasks = list(self._tasks.values())
            # Sort by creation time, newest first
            all_tasks.sort(key=lambda x: x.created_at, reverse=True)
            
            total_count = len(all_tasks)
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            
            return all_tasks[start_idx:end_idx], total_count
    
    def to_task_response(self, task_data: TaskData) -> TaskResponse:
        """Convert TaskData to TaskResponse."""
        steps = [
            TaskStepResponse(
                id=str(i),
                step=i + 1,
                evaluation_previous_goal=step.get("evaluation_previous_goal", ""),
                next_goal=step.get("next_goal", ""),
                url=step.get("url", "")
            )
            for i, step in enumerate(task_data.steps)
        ]
        
        return TaskResponse(
            id=task_data.id,
            task=task_data.task,
            live_url=task_data.live_url,
            output=task_data.output,
            status=task_data.status,
            created_at=task_data.created_at,
            finished_at=task_data.finished_at,
            steps=steps,
            browser_data=task_data.browser_data,
            user_uploaded_files=task_data.user_uploaded_files,
            output_files=task_data.output_files,
            public_share_url=task_data.public_share_url
        )
    
    def to_simple_response(self, task_data: TaskData) -> TaskSimpleResponse:
        """Convert TaskData to TaskSimpleResponse."""
        return TaskSimpleResponse(
            id=task_data.id,
            task=task_data.task,
            output=task_data.output,
            status=task_data.status,
            created_at=task_data.created_at,
            finished_at=task_data.finished_at,
            live_url=task_data.live_url
        )


# Global task manager instance
task_manager = TaskManager()
