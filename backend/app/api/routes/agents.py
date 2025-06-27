import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Agent,
    AgentCreate,
    AgentExecution,
    AgentExecutionCreate,
    AgentExecutionPublic,
    AgentPublic,
    AgentsPublic,
    AgentUpdate,
    Message,
)
from app.services.agent_executor import agent_executor

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/", response_model=AgentsPublic)
def read_agents(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve agents.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Agent)
        count = session.exec(count_statement).one()
        statement = select(Agent).offset(skip).limit(limit)
        agents = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Agent)
            .where(Agent.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Agent)
            .where(Agent.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        agents = session.exec(statement).all()

    return AgentsPublic(data=agents, count=count)


@router.get("/{id}", response_model=AgentPublic)
def read_agent(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get agent by ID.
    """
    agent = session.get(Agent, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return agent


@router.post("/", response_model=AgentPublic)
def create_agent(
    *, session: SessionDep, current_user: CurrentUser, agent_in: AgentCreate
) -> Any:
    """
    Create new agent.
    """
    from datetime import datetime
    
    agent = Agent.model_validate(
        agent_in, 
        update={
            "owner_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


@router.put("/{id}", response_model=AgentPublic)
def update_agent(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    agent_in: AgentUpdate,
) -> Any:
    """
    Update an agent.
    """
    from datetime import datetime
    
    agent = session.get(Agent, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    update_dict = agent_in.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow()
    agent.sqlmodel_update(update_dict)
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


@router.delete("/{id}")
def delete_agent(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an agent.
    """
    agent = session.get(Agent, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(agent)
    session.commit()
    return Message(message="Agent deleted successfully")


@router.post("/{id}/test", response_model=AgentExecutionPublic)
async def test_agent(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    execution_in: AgentExecutionCreate,
) -> Any:
    """
    Test an agent with custom parameters (synchronous execution).
    """
    from datetime import datetime
    
    # Check if user owns the agent
    agent = session.get(Agent, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not current_user.is_superuser and (agent.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    if not agent.is_active:
        raise HTTPException(status_code=400, detail="Agent is not active")
    
    # Create execution record
    execution = AgentExecution.model_validate(
        execution_in,
        update={
            "agent_id": id,
            "started_at": datetime.utcnow(),
            "status": "pending",
        }
    )
    session.add(execution)
    session.commit()
    session.refresh(execution)
    
    try:
        # Execute agent synchronously for testing
        await agent_executor.execute_agent(
            execution.id, 
            agent, 
            execution_in.task_input, 
            execution_in.parameters
        )
        
        # Refresh execution to get updated data
        session.refresh(execution)
        return execution
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

