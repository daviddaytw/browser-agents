import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Agent,
    AgentExecution,
    AgentExecutionCreate,
    AgentExecutionPublic,
    AgentExecutionsPublic,
    Message,
)

router = APIRouter(prefix="/executions", tags=["executions"])


@router.get("/", response_model=AgentExecutionsPublic)
def read_executions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve executions for the current user's agents.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(AgentExecution)
        count = session.exec(count_statement).one()
        statement = select(AgentExecution).offset(skip).limit(limit)
        executions = session.exec(statement).all()
    else:
        # Join with Agent to filter by owner
        count_statement = (
            select(func.count())
            .select_from(AgentExecution)
            .join(Agent)
            .where(Agent.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(AgentExecution)
            .join(Agent)
            .where(Agent.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        executions = session.exec(statement).all()

    return AgentExecutionsPublic(data=executions, count=count)


@router.get("/{id}", response_model=AgentExecutionPublic)
def read_execution(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get execution by ID.
    """
    execution = session.get(AgentExecution, id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    # Check if user owns the agent
    agent = session.get(Agent, execution.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    return execution


@router.get("/agent/{agent_id}", response_model=AgentExecutionsPublic)
def read_agent_executions(
    session: SessionDep, 
    current_user: CurrentUser, 
    agent_id: uuid.UUID,
    skip: int = 0, 
    limit: int = 100
) -> Any:
    """
    Get executions for a specific agent.
    """
    # Check if user owns the agent
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    count_statement = (
        select(func.count())
        .select_from(AgentExecution)
        .where(AgentExecution.agent_id == agent_id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(AgentExecution)
        .where(AgentExecution.agent_id == agent_id)
        .offset(skip)
        .limit(limit)
    )
    executions = session.exec(statement).all()

    return AgentExecutionsPublic(data=executions, count=count)


@router.post("/agent/{agent_id}", response_model=AgentExecutionPublic)
def create_execution(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    agent_id: uuid.UUID,
    execution_in: AgentExecutionCreate,
) -> Any:
    """
    Create new execution for an agent.
    """
    from datetime import datetime
    from app.services.agent_executor import agent_executor
    
    # Check if user owns the agent
    agent = session.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    if not agent.is_active:
        raise HTTPException(status_code=400, detail="Agent is not active")
    
    # Extract sensitive_data from execution_in and don't store it in the database
    sensitive_data = execution_in.sensitive_data
    execution_data = execution_in.model_dump(exclude={"sensitive_data"})
    
    execution = AgentExecution.model_validate(
        execution_data,
        update={
            "agent_id": agent_id,
            "started_at": datetime.utcnow(),
            "status": "pending",
        }
    )
    session.add(execution)
    session.commit()
    session.refresh(execution)
    
    # Start the execution with sensitive data passed as parameter
    agent_executor.start_execution(
        execution.id,
        agent,
        execution_in.task_input,
        execution_in.parameters,
        sensitive_data
    )
    
    return execution


@router.put("/{id}/cancel")
def cancel_execution(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Cancel a running execution.
    """
    from datetime import datetime
    
    execution = session.get(AgentExecution, id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    # Check if user owns the agent
    agent = session.get(Agent, execution.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    if execution.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel execution with status: {execution.status}"
        )
    
    execution.status = "cancelled"
    execution.completed_at = datetime.utcnow()
    session.add(execution)
    session.commit()
    
    return Message(message="Execution cancelled successfully")


@router.delete("/{id}")
def delete_execution(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an execution.
    """
    execution = session.get(AgentExecution, id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    # Check if user owns the agent
    agent = session.get(Agent, execution.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    session.delete(execution)
    session.commit()
    return Message(message="Execution deleted successfully")
