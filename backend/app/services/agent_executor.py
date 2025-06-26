import asyncio
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_models import ChatOllama
from browser_use import Agent as BrowserAgent
from browser_use.agent.memory import MemoryConfig
from browser_use.browser.session import BrowserSession
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
                base_url=llm_config.get("base_url"),
            )
        elif llm_model.startswith("claude-"):
            kwargs = {
                "model": llm_model,
                "api_key": llm_config.get("api_key"),
                "temperature": llm_config.get("temperature", 0.7),
            }
            if llm_config.get("max_tokens"):
                kwargs["max_tokens"] = llm_config.get("max_tokens")
            return ChatAnthropic(**kwargs)
        elif llm_model.startswith("gemini-"):
            return ChatGoogleGenerativeAI(
                model=llm_model,
                google_api_key=llm_config.get("api_key"),
                temperature=llm_config.get("temperature", 0.7),
                max_tokens=llm_config.get("max_tokens"),
            )
        elif "ollama" in llm_model.lower():
            return ChatOllama(
                model=llm_model,
                base_url=llm_config.get("base_url", "http://localhost:11434"),
                temperature=llm_config.get("temperature", 0.7),
            )
        else:
            raise ValueError(f"Unsupported LLM model: {llm_model}")
    
    def _prepare_agent_kwargs(self, agent: Agent, llm, task: str) -> Dict[str, Any]:
        """Prepare kwargs for BrowserAgent initialization with all supported settings."""
        kwargs = {
            "task": task,
            "llm": llm,
        }
        
        # Agent behavior settings
        settings = agent.agent_settings
        
        # Basic settings
        if "use_vision" in settings:
            kwargs["use_vision"] = settings["use_vision"]
        
        if "save_conversation_path" in settings:
            kwargs["save_conversation_path"] = settings["save_conversation_path"]
        
        if "override_system_message" in settings:
            kwargs["override_system_message"] = settings["override_system_message"]
        
        if "extend_system_message" in settings:
            kwargs["extend_system_message"] = settings["extend_system_message"]
        
        # Planner system prompt extension
        if "extend_planner_system_message" in settings:
            kwargs["extend_planner_system_message"] = settings["extend_planner_system_message"]
        
        # Sensitive data handling
        if "sensitive_data" in settings:
            kwargs["sensitive_data"] = settings["sensitive_data"]
        
        # Browser session settings
        browser_settings = agent.browser_settings
        if browser_settings:
            browser_session_kwargs = {}
            
            # Browser connection settings
            if "cdp_url" in browser_settings:
                browser_session_kwargs["cdp_url"] = browser_settings["cdp_url"]
            
            if "wss_url" in browser_settings:
                browser_session_kwargs["wss_url"] = browser_settings["wss_url"]
            
            if "browser_pid" in browser_settings:
                browser_session_kwargs["browser_pid"] = browser_settings["browser_pid"]
            
            if "executable_path" in browser_settings:
                browser_session_kwargs["executable_path"] = browser_settings["executable_path"]
            
            if "channel" in browser_settings:
                browser_session_kwargs["channel"] = browser_settings["channel"]
            
            # Browser-Use specific settings
            if "headless" in browser_settings:
                browser_session_kwargs["headless"] = browser_settings["headless"]
            
            if "stealth" in browser_settings:
                browser_session_kwargs["stealth"] = browser_settings["stealth"]
            
            if "keep_alive" in browser_settings:
                browser_session_kwargs["keep_alive"] = browser_settings["keep_alive"]
            
            if "allowed_domains" in browser_settings:
                browser_session_kwargs["allowed_domains"] = browser_settings["allowed_domains"]
            
            if "user_data_dir" in browser_settings:
                browser_session_kwargs["user_data_dir"] = browser_settings["user_data_dir"]
            
            if "storage_state" in browser_settings:
                browser_session_kwargs["storage_state"] = browser_settings["storage_state"]
            
            # Viewport settings
            if "viewport" in browser_settings:
                browser_session_kwargs["viewport"] = browser_settings["viewport"]
            
            if "user_agent" in browser_settings:
                browser_session_kwargs["user_agent"] = browser_settings["user_agent"]
            
            if "locale" in browser_settings:
                browser_session_kwargs["locale"] = browser_settings["locale"]
            
            if "timezone_id" in browser_settings:
                browser_session_kwargs["timezone_id"] = browser_settings["timezone_id"]
            
            # Performance settings
            if "wait_for_network_idle_page_load_time" in browser_settings:
                browser_session_kwargs["wait_for_network_idle_page_load_time"] = browser_settings["wait_for_network_idle_page_load_time"]
            
            if "wait_between_actions" in browser_settings:
                browser_session_kwargs["wait_between_actions"] = browser_settings["wait_between_actions"]
            
            if "viewport_expansion" in browser_settings:
                browser_session_kwargs["viewport_expansion"] = browser_settings["viewport_expansion"]
            
            # Security settings
            if "ignore_https_errors" in browser_settings:
                browser_session_kwargs["ignore_https_errors"] = browser_settings["ignore_https_errors"]
            
            if "bypass_csp" in browser_settings:
                browser_session_kwargs["bypass_csp"] = browser_settings["bypass_csp"]
            
            if "proxy" in browser_settings:
                browser_session_kwargs["proxy"] = browser_settings["proxy"]
            
            # Create browser session if any browser settings are provided
            if browser_session_kwargs:
                kwargs["browser_session"] = BrowserSession(**browser_session_kwargs)
        
        # Initial actions
        if "initial_actions" in settings:
            kwargs["initial_actions"] = settings["initial_actions"]
        
        # Message context
        if "message_context" in settings:
            kwargs["message_context"] = settings["message_context"]
        
        # Planner settings
        if "planner_llm" in settings:
            planner_model = settings["planner_llm"]
            planner_config = settings.get("planner_llm_config", {})
            kwargs["planner_llm"] = self.get_llm_instance(planner_model, planner_config)
        
        if "use_vision_for_planner" in settings:
            kwargs["use_vision_for_planner"] = settings["use_vision_for_planner"]
        
        if "planner_interval" in settings:
            kwargs["planner_interval"] = settings["planner_interval"]
        
        # Execution settings
        if "max_actions_per_step" in settings:
            kwargs["max_actions_per_step"] = settings["max_actions_per_step"]
        
        if "max_failures" in settings:
            kwargs["max_failures"] = settings["max_failures"]
        
        if "retry_delay" in settings:
            kwargs["retry_delay"] = settings["retry_delay"]
        
        if "generate_gif" in settings:
            kwargs["generate_gif"] = settings["generate_gif"]
        
        # Memory settings
        if "enable_memory" in settings:
            kwargs["enable_memory"] = settings["enable_memory"]
            
            if settings["enable_memory"] and "memory_config" in settings:
                memory_config_data = settings["memory_config"]
                memory_config = MemoryConfig(
                    llm_instance=llm,
                    agent_id=memory_config_data.get("agent_id", f"agent_{agent.id}"),
                    memory_interval=memory_config_data.get("memory_interval", 10),
                    embedder_provider=memory_config_data.get("embedder_provider", "openai"),
                    embedder_model=memory_config_data.get("embedder_model", "text-embedding-3-small"),
                    embedder_dims=memory_config_data.get("embedder_dims", 1536),
                    vector_store_provider=memory_config_data.get("vector_store_provider", "faiss"),
                    vector_store_collection_name=memory_config_data.get("vector_store_collection_name"),
                    vector_store_base_path=memory_config_data.get("vector_store_base_path", "/tmp/mem0"),
                    vector_store_config_override=memory_config_data.get("vector_store_config_override", {}),
                )
                kwargs["memory_config"] = memory_config
        
        return kwargs
    
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
                
                # Prepare agent settings
                agent_kwargs = self._prepare_agent_kwargs(agent, llm, task)
                
                # Create browser agent
                browser_agent = BrowserAgent(**agent_kwargs)
                
                # Execute the agent with max_steps from agent settings
                max_steps = agent.agent_settings.get("max_steps", 100)
                result = await browser_agent.run(max_steps=max_steps)
                
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
