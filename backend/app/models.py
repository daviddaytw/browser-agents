import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel, JSON, Column, Text


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    agents: list["Agent"] = Relationship(back_populates="owner", cascade_delete=True)
    api_keys: list["APIKey"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Agent Models
class AgentBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    task_prompt: str = Field(min_length=1, sa_column=Column(Text))
    llm_model: str = Field(max_length=100, default="gpt-4o")
    llm_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    browser_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    agent_settings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    is_active: bool = Field(default=True)


class AgentCreate(AgentBase):
    pass


class AgentUpdate(AgentBase):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    task_prompt: str | None = Field(default=None, min_length=1)
    llm_model: str | None = Field(default=None, max_length=100)
    llm_config: Dict[str, Any] | None = Field(default=None)
    browser_settings: Dict[str, Any] | None = Field(default=None)
    agent_settings: Dict[str, Any] | None = Field(default=None)
    is_active: bool | None = Field(default=None)


class Agent(AgentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    owner: User | None = Relationship(back_populates="agents")
    executions: list["AgentExecution"] = Relationship(back_populates="agent", cascade_delete=True)
    webhooks: list["AgentWebhook"] = Relationship(back_populates="agent", cascade_delete=True)


class AgentPublic(AgentBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class AgentsPublic(SQLModel):
    data: list[AgentPublic]
    count: int


# API Key Models
class APIKeyBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    is_active: bool = Field(default=True)


class APIKeyCreate(APIKeyBase):
    pass


class APIKeyUpdate(APIKeyBase):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    is_active: bool | None = Field(default=None)


class APIKey(APIKeyBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    key_hash: str = Field(max_length=255)  # Hashed version of the key
    key_prefix: str = Field(max_length=10)  # First few characters for display
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: datetime | None = Field(default=None)
    
    # Relationships
    owner: User | None = Relationship(back_populates="api_keys")


class APIKeyPublic(APIKeyBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    key_prefix: str
    created_at: datetime
    last_used: datetime | None


class APIKeysPublic(SQLModel):
    data: list[APIKeyPublic]
    count: int


class APIKeyWithSecret(APIKeyPublic):
    key: str  # Only returned when creating a new key


# Agent Execution Models
class AgentExecutionBase(SQLModel):
    status: str = Field(max_length=50, default="pending")  # pending, running, completed, failed, cancelled
    task_input: str | None = Field(default=None, sa_column=Column(Text))
    parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    result: Dict[str, Any] | None = Field(default=None, sa_column=Column(JSON))
    execution_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    error_message: str | None = Field(default=None, sa_column=Column(Text))


class AgentExecutionCreate(SQLModel):
    task_input: str | None = Field(default=None)
    parameters: Dict[str, Any] = Field(default_factory=dict)


class AgentExecution(AgentExecutionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID = Field(foreign_key="agent.id", nullable=False, ondelete="CASCADE")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = Field(default=None)
    
    # Relationships
    agent: Agent | None = Relationship(back_populates="executions")


class AgentExecutionPublic(AgentExecutionBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    started_at: datetime
    completed_at: datetime | None


class AgentExecutionsPublic(SQLModel):
    data: list[AgentExecutionPublic]
    count: int


# Agent Webhook Models
class AgentWebhookBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    url: str = Field(max_length=500)
    secret: str | None = Field(default=None, max_length=255)
    is_active: bool = Field(default=True)


class AgentWebhookCreate(AgentWebhookBase):
    pass


class AgentWebhookUpdate(AgentWebhookBase):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, max_length=500)
    secret: str | None = Field(default=None, max_length=255)
    is_active: bool | None = Field(default=None)


class AgentWebhook(AgentWebhookBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    agent_id: uuid.UUID = Field(foreign_key="agent.id", nullable=False, ondelete="CASCADE")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    agent: Agent | None = Relationship(back_populates="webhooks")


class AgentWebhookPublic(AgentWebhookBase):
    id: uuid.UUID
    agent_id: uuid.UUID
    created_at: datetime


class AgentWebhooksPublic(SQLModel):
    data: list[AgentWebhookPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
