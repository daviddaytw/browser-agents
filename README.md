# Browser Agents - AI Browser Automation Platform

A comprehensive web interface for building, managing, and executing AI browser agents using the browser-use library. This platform allows users to create intelligent browser automation agents that can perform complex web tasks using Large Language Models.

## Features

### 🤖 Agent Management
- **Create & Configure Agents**: Build browser agents with custom prompts and LLM configurations
- **Multiple LLM Support**: Compatible with OpenAI GPT models and Anthropic Claude models
- **Agent Settings**: Configure browser behavior, memory settings, and execution parameters
- **Active/Inactive Status**: Enable or disable agents as needed

### 🚀 Agent Execution
- **Test Interface**: Test agents with custom parameters before deployment
- **Async Execution**: Run agents in the background with real-time status updates
- **Execution History**: Track all agent runs with detailed logs and results
- **Error Handling**: Comprehensive error tracking and debugging information

### 🔑 API & Automation
- **API Key Management**: Generate and manage API keys for external access
- **REST API**: Execute agents programmatically via HTTP endpoints
- **Webhook Support**: Configure webhooks for agent completion notifications
- **Parameter Injection**: Pass dynamic parameters to agent tasks

### 📊 Monitoring & Analytics
- **Dashboard Overview**: Real-time statistics and recent activity
- **Execution Logs**: Detailed execution history with screenshots and action logs
- **Performance Metrics**: Track agent success rates and execution times
- **User Management**: Multi-user support with role-based access control

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLModel**: Type-safe database models with SQLAlchemy integration
- **PostgreSQL**: Robust relational database for data persistence
- **Alembic**: Database migration management
- **browser-use**: Core library for browser automation with LLMs
- **LangChain**: LLM integration framework supporting multiple providers

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript for better development experience
- **Chakra UI**: Modern component library with excellent accessibility
- **TanStack Router**: Type-safe routing with file-based route generation
- **TanStack Query**: Powerful data fetching and caching
- **Vite**: Fast build tool and development server

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker for containerized setup)

### Backend Setup

1. **Environment Setup**
```bash
cd backend
uv venv --python 3.11
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

2. **Environment Variables**
Create a `.env` file in the project root:
```env
# Project settings
PROJECT_NAME=Browser Agents

# Database settings
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=browser_agents

# Security
SECRET_KEY=your_secret_key_here

# First superuser
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=your_admin_password

# Environment
ENVIRONMENT=local
```

3. **Database Migration**
```bash
cd backend
uv run alembic upgrade head
```

4. **Start Backend Server**
```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Generate API Client**
```bash
npm run generate-client
```

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Usage Guide

### Creating Your First Agent

1. **Login** to the application using your admin credentials
2. **Navigate** to the "Agents" section
3. **Click "Add Agent"** to create a new browser agent
4. **Configure the agent**:
   - **Name**: Give your agent a descriptive name
   - **Description**: Brief description of what the agent does
   - **Task Prompt**: Detailed instructions for the agent
   - **LLM Model**: Choose from available models (GPT-4o, Claude, etc.)
   - **Status**: Set to active to enable execution

### Testing an Agent

1. **Go to the Agents list** and find your agent
2. **Click the play button** to test the agent
3. **Provide test parameters** if your agent uses dynamic inputs
4. **Monitor execution** in real-time
5. **Review results** including screenshots and action logs

### API Integration

1. **Generate an API Key**:
   - Go to "API Keys" section
   - Click "Add API Key"
   - Copy the generated key (shown only once)

2. **Execute Agent via API**:
```bash
curl -X POST "http://localhost:8000/api/v1/agents/{agent_id}/execute" \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "task_input": "Custom task description",
    "parameters": {
      "search_term": "example",
      "max_results": 10
    }
  }'
```

## Agent Configuration

### LLM Configuration
```json
{
  "api_key": "your_openai_or_anthropic_key",
  "temperature": 0.7,
  "max_tokens": 4000
}
```

### Browser Settings
```json
{
  "headless": true,
  "viewport": {"width": 1280, "height": 720},
  "user_agent": "custom_user_agent"
}
```

### Agent Settings
```json
{
  "max_steps": 100,
  "use_vision": true,
  "enable_memory": true,
  "memory_interval": 10
}
```

## Supported LLM Models

### OpenAI Models
- GPT-4o
- GPT-4o Mini
- GPT-4 Turbo

### Anthropic Models
- Claude 3.5 Sonnet
- Claude 3.5 Haiku
- Claude 3 Opus

## API Reference

### Authentication
All API endpoints require authentication via API key:
```
Authorization: Bearer your_api_key
```

### Core Endpoints

#### Agents
- `GET /api/v1/agents/` - List all agents
- `POST /api/v1/agents/` - Create new agent
- `GET /api/v1/agents/{id}` - Get agent details
- `PUT /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent
- `POST /api/v1/agents/{id}/test` - Test agent (synchronous)
- `POST /api/v1/agents/{id}/execute` - Execute agent (asynchronous)

#### Executions
- `GET /api/v1/executions/` - List executions
- `GET /api/v1/executions/{id}` - Get execution details
- `PUT /api/v1/executions/{id}/cancel` - Cancel running execution

#### API Keys
- `GET /api/v1/api-keys/` - List API keys
- `POST /api/v1/api-keys/` - Create API key
- `DELETE /api/v1/api-keys/{id}` - Delete API key

## Development

### Project Structure
```
browser-agents/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models.py       # Database models
│   │   ├── services/       # Business logic
│   │   └── alembic/        # Database migrations
│   └── pyproject.toml      # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── routes/         # Page routes
│   │   ├── client/         # Generated API client
│   │   └── hooks/          # Custom React hooks
│   └── package.json        # Node.js dependencies
└── docker-compose.yml      # Docker configuration
```

### Adding New Features

1. **Backend Changes**:
   - Add new models in `backend/app/models.py`
   - Create API routes in `backend/app/api/routes/`
   - Add business logic in `backend/app/services/`
   - Create database migration: `alembic revision --autogenerate -m "description"`

2. **Frontend Changes**:
   - Regenerate API client: `npm run generate-client`
   - Add new components in `frontend/src/components/`
   - Create new routes in `frontend/src/routes/`
   - Update navigation in `frontend/src/components/Common/SidebarItems.tsx`

### Running Tests

#### Backend Tests
```bash
cd backend
uv run pytest
```

#### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Considerations
- Set strong passwords and secret keys
- Use environment-specific configuration
- Enable HTTPS with proper SSL certificates
- Set up database backups
- Configure monitoring and logging
- Use a reverse proxy (nginx/traefik)

## Security

- **Authentication**: JWT-based authentication with secure token handling
- **API Keys**: Hashed storage with prefix display for identification
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **CORS**: Configurable CORS settings for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Check the [documentation](docs/)
- Open an [issue](https://github.com/your-repo/browser-agents/issues)
- Join our [Discord community](https://discord.gg/your-invite)

## Acknowledgments

- [browser-use](https://github.com/browser-use/browser-use) - Core browser automation library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://reactjs.org/) - Frontend library
- [Chakra UI](https://chakra-ui.com/) - Component library
- [LangChain](https://langchain.com/) - LLM integration framework
