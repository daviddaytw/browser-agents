# Browser Agents - Development Guide

This guide provides detailed information for developers working on the Browser Agents platform.

## Architecture Overview

The Browser Agents platform is built as a modern full-stack application with clear separation between frontend and backend concerns.

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - User Interface│    │ - REST API      │    │ - Agent Data    │
│ - Agent Forms   │    │ - Authentication│    │ - Executions    │
│ - Dashboards    │    │ - Agent Executor│    │ - User Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   browser-use   │
                       │   (Automation)  │
                       │                 │
                       │ - LLM Integration│
                       │ - Browser Control│
                       │ - Action Execution│
                       └─────────────────┘
```

## Backend Architecture

### Core Components

#### 1. Models (`backend/app/models.py`)
- **User**: Authentication and user management
- **Agent**: Browser agent configuration and metadata
- **AgentExecution**: Execution tracking and results
- **APIKey**: API key management for external access
- **AgentWebhook**: Webhook configuration for notifications

#### 2. API Routes (`backend/app/api/routes/`)
- **agents.py**: Agent CRUD operations and execution endpoints
- **api_keys.py**: API key management
- **executions.py**: Execution history and monitoring
- **users.py**: User management (inherited from template)
- **login.py**: Authentication endpoints

#### 3. Services (`backend/app/services/`)
- **agent_executor.py**: Core service for executing browser agents
  - LLM integration (OpenAI, Anthropic)
  - browser-use library integration
  - Async execution management
  - Result processing and storage

#### 4. Database Migrations (`backend/app/alembic/`)
- **f1234567890a_add_agent_models.py**: Initial agent models migration
- Alembic configuration for schema versioning

### Key Design Patterns

#### 1. Repository Pattern
```python
# Example: Agent service layer
class AgentExecutorService:
    def __init__(self):
        self.running_executions: Dict[str, asyncio.Task] = {}
    
    async def execute_agent(self, execution_id, agent, task_input, parameters):
        # Business logic for agent execution
        pass
```

#### 2. Dependency Injection
```python
# FastAPI dependency injection
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Authentication logic
    pass

@router.get("/agents/")
def read_agents(current_user: CurrentUser, session: SessionDep):
    # Route handler with injected dependencies
    pass
```

#### 3. Async/Await Pattern
```python
# Async execution for long-running tasks
async def start_execution(self, execution_id, agent, task_input, parameters):
    task = asyncio.create_task(
        self.execute_agent(execution_id, agent, task_input, parameters)
    )
    self.running_executions[str(execution_id)] = task
    return task
```

## Frontend Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── Agents/              # Agent management components
│   │   ├── AgentsList.tsx   # Main agents listing
│   │   ├── AddAgent.tsx     # Agent creation form
│   │   ├── EditAgent.tsx    # Agent editing form
│   │   └── DeleteAgent.tsx  # Agent deletion confirmation
│   ├── Common/              # Shared components
│   │   ├── Navbar.tsx       # Top navigation
│   │   ├── Sidebar.tsx      # Side navigation
│   │   └── SidebarItems.tsx # Navigation items
│   └── ui/                  # Base UI components
│       ├── dialog.tsx       # Modal dialogs
│       ├── field.tsx        # Form fields
│       └── button.tsx       # Buttons
├── routes/                  # File-based routing
│   ├── _layout/             # Authenticated layout
│   │   ├── index.tsx        # Dashboard
│   │   ├── agents.tsx       # Agents page
│   │   ├── executions.tsx   # Executions page
│   │   └── api-keys.tsx     # API keys page
│   └── login.tsx            # Login page
├── client/                  # Generated API client
├── hooks/                   # Custom React hooks
└── utils.ts                 # Utility functions
```

### State Management

#### 1. TanStack Query for Server State
```typescript
// Example: Fetching agents
const { data: agents, isLoading, error } = useQuery({
  queryKey: ["agents"],
  queryFn: () => AgentsService.readAgents({}),
})
```

#### 2. React Hook Form for Form State
```typescript
// Example: Agent creation form
const { register, handleSubmit, formState: { errors } } = useForm<AgentCreate>({
  defaultValues: {
    name: "",
    task_prompt: "",
    llm_model: "gpt-4o",
  },
})
```

#### 3. Local State with useState
```typescript
// Example: Modal state
const [isOpen, setIsOpen] = useState(false)
```

### Key Design Patterns

#### 1. Compound Components
```typescript
// Dialog component pattern
<DialogRoot open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogBody>Content</DialogBody>
  </DialogContent>
</DialogRoot>
```

#### 2. Custom Hooks
```typescript
// Custom toast hook
const useCustomToast = () => {
  const toast = useToast()
  
  const showSuccessToast = (message: string) => {
    toast({ status: "success", title: message })
  }
  
  return { showSuccessToast, showErrorToast }
}
```

## Database Schema

### Entity Relationship Diagram

```sql
-- Core entities and relationships
User ||--o{ Agent : owns
User ||--o{ APIKey : owns
Agent ||--o{ AgentExecution : has
Agent ||--o{ AgentWebhook : has

-- User table
CREATE TABLE user (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE
);

-- Agent table
CREATE TABLE agent (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES user(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    task_prompt TEXT NOT NULL,
    llm_model VARCHAR(100) NOT NULL,
    llm_config JSON NOT NULL,
    browser_settings JSON NOT NULL,
    agent_settings JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent execution table
CREATE TABLE agentexecution (
    id UUID PRIMARY KEY,
    agent_id UUID REFERENCES agent(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    task_input TEXT,
    parameters JSON,
    result JSON,
    execution_history JSON,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

## API Design

### RESTful Conventions

#### Resource Naming
- **Collections**: `/api/v1/agents/` (plural nouns)
- **Resources**: `/api/v1/agents/{id}` (singular resource)
- **Actions**: `/api/v1/agents/{id}/execute` (verb for actions)

#### HTTP Methods
- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources

#### Response Format
```json
{
  "data": [...],      // Resource data
  "count": 10,        // Total count for collections
  "message": "..."    // Success/error messages
}
```

### Authentication & Authorization

#### JWT Token Authentication
```python
# Token validation
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user
```

#### API Key Authentication
```python
# API key validation for external access
def validate_api_key(api_key: str = Header(...)) -> User:
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    db_key = session.exec(
        select(APIKey).where(APIKey.key_hash == key_hash)
    ).first()
    
    if not db_key or not db_key.is_active:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Update last used timestamp
    db_key.last_used = datetime.utcnow()
    session.commit()
    
    return db_key.owner
```

## Browser-Use Integration

### Agent Execution Flow

```python
async def execute_agent(self, execution_id, agent, task_input, parameters):
    """Execute a browser agent and return the result."""
    
    # 1. Create LLM instance based on agent configuration
    llm = self.get_llm_instance(agent.llm_model, agent.llm_config)
    
    # 2. Prepare task with parameter substitution
    task = task_input or agent.task_prompt
    if parameters:
        for key, value in parameters.items():
            task = task.replace(f"{{{key}}}", str(value))
    
    # 3. Create and configure browser agent
    browser_agent = BrowserAgent(
        task=task,
        llm=llm,
        **agent.agent_settings
    )
    
    # 4. Execute agent and capture results
    result = await browser_agent.run()
    
    # 5. Process and store results
    result_dict = {
        "final_result": result.final_result(),
        "urls": result.urls(),
        "screenshots": result.screenshots(),
        "action_names": result.action_names(),
        "errors": result.errors(),
    }
    
    return result_dict
```

### LLM Provider Integration

```python
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
```

## Development Workflow

### Setting Up Development Environment

1. **Backend Setup**
```bash
cd backend
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e .
```

2. **Database Setup**
```bash
# Start PostgreSQL (or use Docker)
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=changethis \
  -e POSTGRES_DB=browser_agents \
  -p 5432:5432 postgres:15

# Run migrations
uv run alembic upgrade head
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run generate-client
npm run dev
```

### Adding New Features

#### Backend Feature Development

1. **Add Database Models**
```python
# In backend/app/models.py
class NewFeature(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255)
    # ... other fields
```

2. **Create Migration**
```bash
cd backend
uv run alembic revision --autogenerate -m "add_new_feature"
uv run alembic upgrade head
```

3. **Add API Routes**
```python
# In backend/app/api/routes/new_feature.py
@router.get("/", response_model=NewFeaturesPublic)
def read_new_features(session: SessionDep, current_user: CurrentUser):
    # Implementation
    pass
```

4. **Register Routes**
```python
# In backend/app/api/main.py
from app.api.routes import new_feature
api_router.include_router(new_feature.router)
```

#### Frontend Feature Development

1. **Regenerate API Client**
```bash
cd frontend
npm run generate-client
```

2. **Create Components**
```typescript
// In frontend/src/components/NewFeature/
export const NewFeatureList = () => {
  const { data } = useQuery({
    queryKey: ["new-features"],
    queryFn: () => NewFeatureService.readNewFeatures({}),
  })
  
  return (
    // Component implementation
  )
}
```

3. **Add Routes**
```typescript
// In frontend/src/routes/_layout/new-feature.tsx
export const Route = createFileRoute("/_layout/new-feature")({
  component: NewFeatureList,
})
```

4. **Update Navigation**
```typescript
// In frontend/src/components/Common/SidebarItems.tsx
const items = [
  // ... existing items
  { icon: FiNewIcon, title: "New Feature", path: "/new-feature" },
]
```

### Testing Strategy

#### Backend Testing
```python
# Test example
def test_create_agent(client: TestClient, superuser_token_headers: dict):
    data = {
        "name": "Test Agent",
        "task_prompt": "Test task",
        "llm_model": "gpt-4o"
    }
    response = client.post(
        f"{settings.API_V1_STR}/agents/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
```

#### Frontend Testing
```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { AgentsList } from './AgentsList'

test('renders agents list', () => {
  render(<AgentsList />)
  expect(screen.getByText('Browser Agents')).toBeInTheDocument()
})
```

### Code Quality

#### Backend Code Standards
- **Type Hints**: Use Python type hints for all functions
- **Pydantic Models**: Use Pydantic for data validation
- **Async/Await**: Use async patterns for I/O operations
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

#### Frontend Code Standards
- **TypeScript**: Strict TypeScript configuration
- **Component Props**: Proper TypeScript interfaces for props
- **Hooks**: Custom hooks for reusable logic
- **Error Boundaries**: Error boundaries for component error handling

### Performance Considerations

#### Backend Optimization
- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: SQLAlchemy connection pooling
- **Async Operations**: Non-blocking I/O for agent execution
- **Caching**: Redis caching for frequently accessed data

#### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Query Optimization**: TanStack Query for efficient data fetching
- **Memoization**: React.memo for expensive components
- **Bundle Analysis**: Regular bundle size analysis

## Deployment

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen

COPY . .

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### Production Deployment

#### Environment Configuration
```env
# Production environment variables
ENVIRONMENT=production
SECRET_KEY=your-production-secret-key
POSTGRES_SERVER=your-production-db-host
POSTGRES_PASSWORD=your-production-db-password

# LLM API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

#### Docker Compose Production
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - ENVIRONMENT=production
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## Troubleshooting

### Common Issues

#### Backend Issues
1. **Database Connection Errors**
   - Check PostgreSQL is running
   - Verify connection string in .env
   - Ensure database exists

2. **Migration Errors**
   - Check for conflicting migrations
   - Verify model changes are valid
   - Use `alembic downgrade` if needed

3. **LLM Integration Errors**
   - Verify API keys are correct
   - Check rate limits
   - Ensure model names are valid

#### Frontend Issues
1. **API Client Errors**
   - Regenerate client after backend changes
   - Check backend server is running
   - Verify API endpoints are accessible

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify import paths

3. **Runtime Errors**
   - Check browser console for errors
   - Verify environment variables
   - Check network requests in dev tools

### Debugging Tips

#### Backend Debugging
```python
# Add logging for debugging
import logging
logging.basicConfig(level=logging.DEBUG)

# Use debugger
import pdb; pdb.set_trace()

# FastAPI debug mode
uvicorn app.main:app --reload --log-level debug
```

#### Frontend Debugging
```typescript
// React DevTools
// Browser DevTools
// Console logging
console.log('Debug info:', data)

// Error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

This development guide provides a comprehensive overview of the Browser Agents platform architecture and development practices. For specific implementation details, refer to the source code and inline documentation.
