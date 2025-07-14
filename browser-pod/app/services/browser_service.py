import asyncio
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

from browser_use import Agent

from ..models.requests import RunTaskRequest
from ..models.enums import TaskStatusEnum, LLMModel
from ..utils.task_manager import task_manager
from ..config import settings


class BrowserService:
    """Service for managing browser-use agents and task execution."""
    
    def __init__(self):
        self.active_agents: Dict[str, Agent] = {}
    
    def _get_llm_instance(self, model: Optional[LLMModel] = None):
        """Get LLM instance based on model type."""
        # For now, we'll use a mock LLM since we don't have API keys
        # In production, you would configure actual LLM instances here
        from browser_use.llm import ChatOpenAI
        
        model_name = model.value if model else "gpt-4o"
        
        # This would need proper API key configuration in production
        try:
            return ChatOpenAI(model=model_name)
        except Exception:
            # Fallback to mock for development
            return MockLLM(model_name)
    
    async def create_and_run_task(self, task_id: str, request: RunTaskRequest) -> None:
        """Create and run a browser automation task."""
        try:
            # Update task status to running
            await task_manager.update_task_status(task_id, TaskStatusEnum.RUNNING)
            
            # Get task data
            task_data = await task_manager.get_task(task_id)
            if not task_data:
                raise ValueError(f"Task {task_id} not found")
            
            # Get LLM instance
            llm = self._get_llm_instance(request.llm_model)
            
            # Create agent with simplified configuration
            agent = Agent(
                task=request.task,
                llm=llm,
                use_vision=True,
                save_conversation_path=str(settings.STORAGE_PATH / f"conversation_{task_id}.json")
            )
            
            # Store agent instance
            await task_manager.set_agent_instance(task_id, agent)
            self.active_agents[task_id] = agent
            
            # Create task-specific directories
            task_screenshots_dir = settings.SCREENSHOTS_PATH / task_id
            task_recordings_dir = settings.RECORDINGS_PATH / task_id
            task_outputs_dir = settings.OUTPUTS_PATH / task_id
            
            for dir_path in [task_screenshots_dir, task_recordings_dir, task_outputs_dir]:
                dir_path.mkdir(parents=True, exist_ok=True)
            
            # Run the agent with monitoring
            await self._run_agent_with_monitoring(task_id, agent, request)
            
        except asyncio.CancelledError:
            await task_manager.update_task_status(task_id, TaskStatusEnum.STOPPED)
            raise
        except Exception as e:
            await task_manager.update_task_status(task_id, TaskStatusEnum.FAILED)
            await task_manager.set_task_output(task_id, f"Error: {str(e)}")
            raise
        finally:
            # Clean up
            if task_id in self.active_agents:
                del self.active_agents[task_id]
            await task_manager.unregister_running_task(task_id)
    
    async def _run_agent_with_monitoring(self, task_id: str, agent: Agent, request: RunTaskRequest):
        """Run agent with step monitoring and pause/resume support."""
        task_data = await task_manager.get_task(task_id)
        if not task_data:
            return
        
        max_steps = request.max_agent_steps or 75
        step_count = 0
        
        try:
            # Start the agent execution
            history = await agent.run(max_steps=max_steps)
            
            # Process the results
            if history:
                # Extract final result
                final_result = history.final_result() if hasattr(history, 'final_result') else None
                if final_result:
                    await task_manager.set_task_output(task_id, str(final_result))
                
                # Extract screenshots
                screenshots = history.screenshots() if hasattr(history, 'screenshots') else []
                for screenshot in screenshots:
                    await task_manager.add_screenshot(task_id, screenshot)
                
                # Extract steps
                if hasattr(history, 'model_actions'):
                    actions = history.model_actions()
                    for i, action in enumerate(actions):
                        step_data = {
                            "evaluation_previous_goal": f"Step {i} completed",
                            "next_goal": f"Execute {action.get('action', 'unknown')}",
                            "url": action.get('url', 'unknown')
                        }
                        await task_manager.add_task_step(task_id, step_data)
            
            # Mark as finished
            await task_manager.update_task_status(task_id, TaskStatusEnum.FINISHED)
            
        except asyncio.CancelledError:
            await task_manager.update_task_status(task_id, TaskStatusEnum.STOPPED)
            raise
        except Exception as e:
            await task_manager.update_task_status(task_id, TaskStatusEnum.FAILED)
            await task_manager.set_task_output(task_id, f"Execution error: {str(e)}")
    
    async def pause_task(self, task_id: str) -> bool:
        """Pause a running task."""
        if task_id in self.active_agents:
            # Browser-use doesn't have built-in pause/resume, so we simulate it
            success = await task_manager.pause_task(task_id)
            if success:
                # In a real implementation, you might need to pause the browser context
                pass
            return success
        return False
    
    async def resume_task(self, task_id: str) -> bool:
        """Resume a paused task."""
        if task_id in self.active_agents:
            success = await task_manager.resume_task(task_id)
            if success:
                # In a real implementation, you might need to resume the browser context
                pass
            return success
        return False
    
    async def stop_task(self, task_id: str) -> bool:
        """Stop a running task."""
        success = await task_manager.stop_task(task_id)
        
        # Clean up agent
        if task_id in self.active_agents:
            try:
                agent = self.active_agents[task_id]
                # Close browser context if available
                if hasattr(agent, 'browser_context') and agent.browser_context:
                    await agent.browser_context.close()
            except Exception:
                pass  # Ignore cleanup errors
            
            del self.active_agents[task_id]
        
        return success


class MockLLM:
    """Mock LLM for development/testing purposes."""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
    
    async def agenerate(self, messages, **kwargs):
        """Mock LLM response."""
        return MockResponse("This is a mock response for development. Please configure a real LLM.")
    
    def generate(self, messages, **kwargs):
        """Sync version of generate."""
        return MockResponse("This is a mock response for development. Please configure a real LLM.")


class MockResponse:
    """Mock LLM response."""
    
    def __init__(self, content: str):
        self.content = content
        self.text = content
    
    def __str__(self):
        return self.content


# Global browser service instance
browser_service = BrowserService()
