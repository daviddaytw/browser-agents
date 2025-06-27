# Contributing to Browser Agents

Thank you for your interest in contributing to Browser Agents! This guide will help you get started with contributing to our AI browser automation platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Standards](#code-standards)
- [Submitting Changes](#submitting-changes)
- [Deployment](#deployment)
- [Getting Help](#getting-help)

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - Backend development
- **Node.js 18+** - Frontend development  
- **PostgreSQL** - Database (or Docker for containerized setup)
- **Docker & Docker Compose** - Containerized development
- **Git** - Version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/browser-agents.git
   cd browser-agents
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-repo/browser-agents.git
   ```

## Development Setup

### Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables** as needed (see `.env.example` for all available options)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   uv venv --python 3.11
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   uv sync
   ```

4. **Run database migrations**:
   ```bash
   uv run alembic upgrade head
   ```

5. **Start the backend server**:
   ```bash
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js version** (using fnm or nvm):
   ```bash
   # Using fnm
   fnm install && fnm use
   
   # Using nvm
   nvm install && nvm use
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Generate API client**:
   ```bash
   npm run generate-client
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

### Docker Development (Alternative)

For a containerized development environment:

```bash
# Start all services
docker compose up -d

# Watch for changes (recommended for development)
docker compose watch

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Project Structure

```
browser-agents/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core configuration and utilities
│   │   ├── services/       # Business logic services
│   │   ├── models.py       # Database models (SQLModel)
│   │   ├── crud.py         # Database operations
│   │   └── alembic/        # Database migrations
│   ├── scripts/            # Development and deployment scripts
│   └── pyproject.toml      # Python dependencies and configuration
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── routes/         # File-based routing (TanStack Router)
│   │   ├── client/         # Generated API client
│   │   ├── hooks/          # Custom React hooks
│   │   └── theme.tsx       # Chakra UI theme configuration
│   ├── tests/              # End-to-end tests (Playwright)
│   └── package.json        # Node.js dependencies
├── scripts/                # Project-wide scripts
├── docker-compose.yml      # Docker services configuration
├── development.md          # Detailed development guide
├── deployment.md           # Production deployment guide
└── CONTRIBUTING.md         # This file
```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Fix issues and improve stability
- **Feature development** - Add new functionality
- **Documentation** - Improve guides, API docs, and code comments
- **Testing** - Add or improve test coverage
- **Performance** - Optimize code and database queries
- **UI/UX** - Enhance user interface and experience

### Before You Start

1. **Check existing issues** - Look for related issues or feature requests
2. **Create an issue** - If none exists, create one to discuss your proposed changes
3. **Get feedback** - Wait for maintainer feedback before starting significant work
4. **Assign yourself** - Comment on the issue to let others know you're working on it

## Development Workflow

### Branch Strategy

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Making Changes

#### Backend Changes

1. **Database Models** (`backend/app/models.py`):
   ```python
   class NewModel(SQLModel, table=True):
       id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
       name: str = Field(max_length=255)
       created_at: datetime = Field(default_factory=datetime.utcnow)
   ```

2. **Create Migration**:
   ```bash
   cd backend
   uv run alembic revision --autogenerate -m "add_new_model"
   uv run alembic upgrade head
   ```

3. **API Routes** (`backend/app/api/routes/`):
   ```python
   @router.get("/", response_model=ItemsPublic)
   def read_items(session: SessionDep, current_user: CurrentUser):
       # Implementation
       pass
   ```

4. **Business Logic** (`backend/app/services/`):
   ```python
   class NewService:
       def __init__(self):
           # Service initialization
           pass
       
       async def process_data(self, data: dict) -> dict:
           # Business logic implementation
           pass
   ```

#### Frontend Changes

1. **Regenerate API Client** (after backend changes):
   ```bash
   cd frontend
   npm run generate-client
   ```

2. **Create Components** (`frontend/src/components/`):
   ```typescript
   interface Props {
     data: ItemPublic[]
     onUpdate: (item: ItemPublic) => void
   }
   
   export const ItemList: React.FC<Props> = ({ data, onUpdate }) => {
     // Component implementation
     return <div>...</div>
   }
   ```

3. **Add Routes** (`frontend/src/routes/`):
   ```typescript
   export const Route = createFileRoute("/_layout/items")({
     component: ItemList,
   })
   ```

4. **Update Navigation** (`frontend/src/components/Common/SidebarItems.tsx`):
   ```typescript
   const items = [
     // ... existing items
     { icon: FiIcon, title: "New Feature", path: "/new-feature" },
   ]
   ```

## Testing

### Backend Testing

1. **Run all tests**:
   ```bash
   cd backend
   bash ./scripts/test.sh
   ```

2. **Run specific tests**:
   ```bash
   uv run pytest app/tests/api/routes/test_agents.py -v
   ```

3. **Test with coverage**:
   ```bash
   uv run pytest --cov=app --cov-report=html
   ```

4. **Writing tests**:
   ```python
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
       assert response.json()["name"] == data["name"]
   ```

### Frontend Testing

1. **Run unit tests**:
   ```bash
   cd frontend
   npm run test
   ```

2. **Run E2E tests**:
   ```bash
   # Start backend first
   docker compose up -d --wait backend
   
   # Run Playwright tests
   npx playwright test
   
   # Run with UI
   npx playwright test --ui
   ```

3. **Writing component tests**:
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { AgentsList } from './AgentsList'
   
   test('renders agents list', () => {
     render(<AgentsList />)
     expect(screen.getByText('Browser Agents')).toBeInTheDocument()
   })
   ```

## Code Standards

### Backend Standards

- **Type Hints**: Use Python type hints for all functions and methods
- **Pydantic Models**: Use Pydantic/SQLModel for data validation
- **Async/Await**: Use async patterns for I/O operations
- **Error Handling**: Proper HTTP status codes and error messages
- **Documentation**: Docstrings for all public functions and classes

Example:
```python
async def create_agent(
    session: SessionDep,
    current_user: CurrentUser,
    agent_in: AgentCreate,
) -> AgentPublic:
    """
    Create a new browser agent.
    
    Args:
        session: Database session
        current_user: Authenticated user
        agent_in: Agent creation data
        
    Returns:
        Created agent data
        
    Raises:
        HTTPException: If creation fails
    """
    agent = Agent.model_validate(agent_in, update={"owner_id": current_user.id})
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent
```

### Frontend Standards

- **TypeScript**: Strict TypeScript configuration
- **Component Props**: Proper interfaces for component props
- **Hooks**: Custom hooks for reusable logic
- **Error Handling**: Error boundaries and proper error states
- **Accessibility**: ARIA labels and keyboard navigation

Example:
```typescript
interface AgentFormProps {
  agent?: AgentPublic
  onSubmit: (data: AgentCreate) => Promise<void>
  onCancel: () => void
}

export const AgentForm: React.FC<AgentFormProps> = ({
  agent,
  onSubmit,
  onCancel,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AgentCreate>({
    defaultValues: agent || {
      name: "",
      task_prompt: "",
      llm_model: "gpt-4o",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form implementation */}
    </form>
  )
}
```

### Code Formatting

- **Backend**: Use `ruff` for linting and formatting
- **Frontend**: Use `biome` for linting and formatting

```bash
# Backend formatting
cd backend
uv run ruff format .
uv run ruff check .

# Frontend formatting
cd frontend
npm run lint
npm run format
```

## Submitting Changes

### Commit Guidelines

1. **Commit Message Format**:
   ```
   type(scope): brief description
   
   Detailed explanation of the changes made.
   
   Fixes #123
   ```

2. **Commit Types**:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

3. **Examples**:
   ```
   feat(agents): add agent execution history tracking
   
   - Add execution_history field to AgentExecution model
   - Store step-by-step execution logs
   - Display execution timeline in frontend
   
   Fixes #45
   ```

### Pull Request Process

1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   # Backend
   cd backend && bash ./scripts/test.sh
   
   # Frontend
   cd frontend && npm run test && npm run lint
   ```

3. **Create Pull Request**:
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

4. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes made.
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests for changes
   - [ ] Manual testing completed
   
   ## Screenshots (if applicable)
   
   ## Related Issues
   Fixes #123
   ```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Ensure all tests pass and new tests are added
4. **Documentation**: Update documentation if needed

## Deployment

### Local Testing

Test your changes in a production-like environment:

```bash
# Build and test with Docker
docker compose -f docker-compose.yml up -d

# Test the application
curl http://localhost/api/v1/agents/
```

### Staging Deployment

Changes are automatically deployed to staging when merged to `main`:

- **Staging URL**: `https://staging.browser-agents.example.com`
- **API Docs**: `https://api.staging.browser-agents.example.com/docs`

### Production Deployment

Production deployment happens when a release is published:

- **Production URL**: `https://browser-agents.example.com`
- **API Docs**: `https://api.browser-agents.example.com/docs`

## Getting Help

### Documentation

- **Development Guide**: [development.md](development.md)
- **Deployment Guide**: [deployment.md](deployment.md)
- **API Documentation**: Available at `/docs` endpoint

### Communication

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion

### Common Issues

1. **Database Connection Issues**:
   - Ensure PostgreSQL is running
   - Check connection string in `.env`
   - Verify database exists

2. **Frontend Build Issues**:
   - Clear `node_modules` and reinstall
   - Regenerate API client after backend changes
   - Check TypeScript errors

3. **Agent Execution Issues**:
   - Verify LLM API keys are correct
   - Check browser-use library compatibility
   - Review agent configuration settings

### Debugging Tips

1. **Backend Debugging**:
   ```python
   # Add logging
   import logging
   logging.basicConfig(level=logging.DEBUG)
   
   # Use debugger
   import pdb; pdb.set_trace()
   ```

2. **Frontend Debugging**:
   ```typescript
   // Console logging
   console.log('Debug info:', data)
   
   // React DevTools
   // Browser DevTools Network tab
   ```

## License

By contributing to Browser Agents, you agree that your contributions will be licensed under the Apache License 2.0.

## Recognition

Contributors will be recognized in our:
- **Contributors list** in the README
- **Release notes** for significant contributions
- **Hall of Fame** for outstanding contributions

Thank you for contributing to Browser Agents! 🚀
