import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Agent,
    AgentCreate,
    AgentConfiguration,
    AgentConfigurationCreate,
    AgentConfigurationPublic,
    AgentConfigurationsPublic,
    AgentExecution,
    AgentExecutionCreate,
    AgentExecutionPublic,
    AgentPublic,
    AgentsPublic,
    AgentUpdate,
    Message,
    Team,
    TeamMember,
)
from app.services.agent_executor import agent_executor

router = APIRouter(prefix="/agents", tags=["agents"])


def check_team_access(session: SessionDep, current_user: CurrentUser, team_id: uuid.UUID) -> bool:
    """Check if user has access to a team."""
    if current_user.is_superuser:
        return True
    
    membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    return membership is not None


def check_agent_access(session: SessionDep, current_user: CurrentUser, agent_id: uuid.UUID) -> Agent | None:
    """Check if user has access to an agent and return the agent if accessible."""
    agent = session.get(Agent, agent_id)
    if not agent:
        return None
    
    if current_user.is_superuser:
        return agent
    
    # Check if user is a member of the agent's team
    membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == agent.team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    return agent if membership else None


@router.get("/", response_model=AgentsPublic)
def read_agents(
    session: SessionDep, current_user: CurrentUser, team_id: uuid.UUID | None = None, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve agents. If team_id is provided, filter by team.
    """
    if current_user.is_superuser:
        # Superusers can see all agents
        if team_id:
            count_statement = select(func.count()).select_from(Agent).where(Agent.team_id == team_id)
            statement = select(Agent).where(Agent.team_id == team_id).offset(skip).limit(limit)
        else:
            count_statement = select(func.count()).select_from(Agent)
            statement = select(Agent).offset(skip).limit(limit)
        
        count = session.exec(count_statement).one()
        agents = session.exec(statement).all()
    else:
        # Regular users can only see agents from teams they're members of
        base_query = (
            select(Agent)
            .join(TeamMember, Agent.team_id == TeamMember.team_id)
            .where(TeamMember.user_id == current_user.id)
        )
        
        if team_id:
            # Check if user has access to this specific team
            if not check_team_access(session, current_user, team_id):
                raise HTTPException(status_code=403, detail="Not a member of this team")
            base_query = base_query.where(Agent.team_id == team_id)
        
        count_statement = select(func.count()).select_from(base_query.subquery())
        count = session.exec(count_statement).one()
        
        statement = base_query.offset(skip).limit(limit)
        agents = session.exec(statement).all()

    return AgentsPublic(data=agents, count=count)


@router.get("/{id}", response_model=AgentPublic)
def read_agent(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get agent by ID.
    """
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    return agent


@router.post("/", response_model=AgentPublic)
def create_agent(
    *, session: SessionDep, current_user: CurrentUser, agent_in: AgentCreate
) -> Any:
    """
    Create new agent in a team.
    """
    from datetime import datetime
    
    # Check if user has access to the team
    if not check_team_access(session, current_user, agent_in.team_id):
        raise HTTPException(status_code=403, detail="Not a member of this team")
    
    # Create the agent
    agent = Agent.model_validate(
        agent_in, 
        update={
            "created_by": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )
    session.add(agent)
    session.commit()
    session.refresh(agent)
    
    # Create initial configuration version
    initial_config = AgentConfiguration.model_validate(
        agent_in.initial_config,
        update={
            "agent_id": agent.id,
            "version": 1,
            "is_current": True,
            "created_at": datetime.utcnow(),
            "created_by": current_user.id,
        }
    )
    session.add(initial_config)
    session.commit()
    
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
    Update an agent (basic properties only, not configuration).
    """
    from datetime import datetime
    
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
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
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
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
    
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    if not agent.is_active:
        raise HTTPException(status_code=400, detail="Agent is not active")
    
    # Get the current configuration for this agent
    current_config = session.exec(
        select(AgentConfiguration)
        .where(AgentConfiguration.agent_id == id)
        .where(AgentConfiguration.is_current == True)
    ).first()
    
    if not current_config:
        raise HTTPException(status_code=400, detail="Agent has no current configuration")
    
    # Create execution record
    execution = AgentExecution.model_validate(
        execution_in,
        update={
            "agent_id": id,
            "config_id": current_config.id,
            "config_version_used": current_config.version,
            "started_by": current_user.id,
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


# Agent Configuration Management Endpoints

@router.get("/{id}/configurations", response_model=AgentConfigurationsPublic)
def read_agent_configurations(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve configuration versions for an agent.
    """
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    count_statement = (
        select(func.count())
        .select_from(AgentConfiguration)
        .where(AgentConfiguration.agent_id == id)
    )
    count = session.exec(count_statement).one()
    
    statement = (
        select(AgentConfiguration)
        .where(AgentConfiguration.agent_id == id)
        .order_by(AgentConfiguration.version.desc())
        .offset(skip)
        .limit(limit)
    )
    configurations = session.exec(statement).all()
    
    return AgentConfigurationsPublic(data=configurations, count=count)


@router.get("/{id}/configurations/{config_id}", response_model=AgentConfigurationPublic)
def read_agent_configuration(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID, config_id: uuid.UUID
) -> Any:
    """
    Get a specific configuration version by ID.
    """
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    configuration = session.get(AgentConfiguration, config_id)
    if not configuration or configuration.agent_id != id:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return configuration


@router.post("/{id}/configurations", response_model=AgentConfigurationPublic)
def create_agent_configuration(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, config_in: AgentConfigurationCreate
) -> Any:
    """
    Create a new configuration version for an agent.
    """
    from datetime import datetime
    
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    # Get the next version number
    max_version_statement = (
        select(func.max(AgentConfiguration.version))
        .where(AgentConfiguration.agent_id == id)
    )
    max_version = session.exec(max_version_statement).one()
    next_version = (max_version or 0) + 1
    
    # Mark all existing configurations as not current
    for existing_config in session.exec(
        select(AgentConfiguration)
        .where(AgentConfiguration.agent_id == id)
        .where(AgentConfiguration.is_current == True)
    ).all():
        existing_config.is_current = False
        session.add(existing_config)
    
    # Create new configuration
    new_config = AgentConfiguration.model_validate(
        config_in,
        update={
            "agent_id": id,
            "version": next_version,
            "is_current": True,
            "created_at": datetime.utcnow(),
            "created_by": current_user.id,
        }
    )
    session.add(new_config)
    
    # Update agent's current configuration version
    agent.current_config_version = next_version
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    
    session.commit()
    session.refresh(new_config)
    return new_config


@router.post("/{id}/configurations/{config_id}/activate", response_model=AgentPublic)
def activate_agent_configuration(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, config_id: uuid.UUID
) -> Any:
    """
    Activate a specific configuration version (make it the current version).
    """
    from datetime import datetime
    
    agent = check_agent_access(session, current_user, id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found or access denied")
    
    configuration = session.get(AgentConfiguration, config_id)
    if not configuration or configuration.agent_id != id:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Mark all existing configurations as not current
    for existing_config in session.exec(
        select(AgentConfiguration)
        .where(AgentConfiguration.agent_id == id)
        .where(AgentConfiguration.is_current == True)
    ).all():
        existing_config.is_current = False
        session.add(existing_config)
    
    # Mark the selected configuration as current
    configuration.is_current = True
    session.add(configuration)
    
    # Update agent's current configuration version
    agent.current_config_version = configuration.version
    agent.updated_at = datetime.utcnow()
    session.add(agent)
    
    session.commit()
    session.refresh(agent)
    return agent
