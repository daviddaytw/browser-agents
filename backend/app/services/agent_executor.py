import asyncio
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from browser_use import Agent as BrowserAgent
from sqlmodel import Session

from app.core.db import engine
from app.models import Agent, AgentExecution


class AgentExecutorService:
    """Service for executing browser agents using browser-use library."""
    
    def __init__(self):
        self.running_executions: Dict[str, asyncio.Task] = {}
    
    def get_llm_instance(self, llm_model: str, llm_config: Dict[str, Any]):
        """Create LLM instance based on model and config."""
        if llm_model.startswith("gpt-"):
            return ChatOpenAI(
                model=llm_model,
                api_key=llm_config.get("api_key"),
                temperature=llm_config.get("temperature", 0.7),
                max_tokens=llm_config.get("max_tokens"),
            )
        elif llm_model.startswith("claude-"):
            return ChatAnthropic(
                model=llm_model,
                api_key=llm_config.get("api_key"),
                temperature=llm_config.get("temperature", 0.7),
                max_tokens=llm_config.get("max_tokens"),
            )
        else:
            raise ValueError(f"Unsupported LLM model: {llm_model}")
    
    async def execute_agent(
        self, 
        execution_id: uuid.UUID,
        agent: Agent,
        task_input: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a browser agent and return the result."""
        
        with Session(engine) as session:
            # Get the execution record
            execution = session.get(AgentExecution, execution_id)
            if not execution:
                raise ValueError(f"Execution {execution_id} not found")
            
            try:
                # Update status to running
                execution.status = "running"
                session.add(execution)
                session.commit()
                
                # Create LLM instance
                llm = self.get_llm_instance(agent.llm_model, agent.llm_config)
                
                # Prepare task
                task = task_input or agent.task_prompt
                if parameters:
                    # Replace placeholders in task with parameters
                    for key, value in parameters.items():
                        task = task.replace(f"{{{key}}}", str(value))
                
                # Create browser agent
                browser_agent = BrowserAgent(
                    task=task,
                    llm=llm,
                    **agent.agent_settings
                )
                
                # Execute the agent
                result = await browser_agent.run()
                
                # Convert result to serializable format
                result_dict = {
                    "final_result": result.final_result() if hasattr(result, 'final_result') else str(result),
                    "urls": result.urls() if hasattr(result, 'urls') else [],
                    "screenshots": result.screenshots() if hasattr(result, 'screenshots') else [],
                    "action_names": result.action_names() if hasattr(result, 'action_names') else [],
                    "errors": result.errors() if hasattr(result, 'errors') else [],
                    "is_done": result.is_done() if hasattr(result, 'is_done') else True,
                }
                
                # Update execution with success
                execution.status = "completed"
                execution.completed_at = datetime.utcnow()
                execution.result = result_dict
                execution.execution_history = self._extract_execution_history(result)
                session.add(execution)
                session.commit()
                
                return result_dict
                
            except Exception as e:
                # Update execution with error
                execution.status = "failed"
                execution.completed_at = datetime.utcnow()
                execution.error_message = str(e)
                session.add(execution)
                session.commit()
                raise e
    
    def _extract_execution_history(self, result) -> List[Dict[str, Any]]:
        """Extract execution history from browser-use result."""
        try:
            if hasattr(result, 'model_actions'):
                actions = result.model_actions()
                return [
                    {
                        "action": action.get("action", "unknown"),
                        "parameters": action.get("parameters", {}),
                        "timestamp": action.get("timestamp", datetime.utcnow().isoformat()),
                        "result": action.get("result", ""),
                    }
                    for action in actions
                ]
        except Exception:
            pass
        return []
    
    async def start_execution(
        self,
        execution_id: uuid.UUID,
        agent: Agent,
        task_input: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> asyncio.Task:
        """Start agent execution in background."""
        task = asyncio.create_task(
            self.execute_agent(execution_id, agent, task_input, parameters)
        )
        self.running_executions[str(execution_id)] = task
        
        # Clean up task when done
        def cleanup_task(task):
            execution_id_str = str(execution_id)
            if execution_id_str in self.running_executions:
                del self.running_executions[execution_id_str]
        
        task.add_done_callback(cleanup_task)
        return task
    
    def cancel_execution(self, execution_id: uuid.UUID) -> bool:
        """Cancel a running execution."""
        execution_id_str = str(execution_id)
        if execution_id_str in self.running_executions:
            task = self.running_executions[execution_id_str]
            task.cancel()
            return True
        return False
    
    def get_execution_status(self, execution_id: uuid.UUID) -> Optional[str]:
        """Get the status of a running execution."""
        execution_id_str = str(execution_id)
        if execution_id_str in self.running_executions:
            task = self.running_executions[execution_id_str]
            if task.done():
                return "completed" if not task.cancelled() else "cancelled"
            return "running"
        return None


# Global instance
agent_executor = AgentExecutorService()
