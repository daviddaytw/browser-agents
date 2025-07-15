# Contributing to Browser Agents

Thank you for your interest in contributing to Browser Agents! This guide will help you get started with contributing to our AI browser automation platform.

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** - For browser-pod development
- **Node.js 18+** - For dashboard development  
- **Docker & Docker Compose** - For containerized development
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
   git remote add upstream https://github.com/daviddaytw/browser-agents.git
   ```

## 🏗️ Project Structure

```
browser-agents/
├── browser-pod/            # FastAPI backend service
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   ├── config.py      # Configuration settings
│   │   ├── models/        # Request/response models
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── main.py            # Application entry point
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Docker configuration
├── dashboard/             # Next.js frontend application
│   ├── app/              # Next.js app directory
│   ├── lib/              # Utility libraries
│   ├── package.json      # Node.js dependencies
│   └── Dockerfile        # Docker configuration
├── docker-compose.yml    # Multi-service setup
└── README.md            # Project documentation
```

## 🛠️ Development Setup

### Option 1: Docker Compose (Recommended)

Start all services with Docker:

```bash
# Start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the services:
- Dashboard: http://localhost:3000
- Browser Pod API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: Manual Setup

#### Browser Pod Setup

1. Navigate to the browser-pod directory:
   ```bash
   cd browser-pod
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Playwright browsers:
   ```bash
   playwright install chromium
   ```

5. Start the service:
   ```bash
   python main.py
   ```

#### Dashboard Setup

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Making Changes

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the appropriate directory:
   - **Browser Pod**: `/browser-pod/` for backend API changes
   - **Dashboard**: `/dashboard/` for frontend UI changes

3. Test your changes locally

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request on GitHub

### Code Standards

#### Browser Pod (Python)

- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Add docstrings for public functions and classes
- Use async/await for I/O operations

Example:
```python
from typing import List
from fastapi import APIRouter

router = APIRouter()

@router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks() -> List[TaskResponse]:
    """
    Retrieve all tasks.
    
    Returns:
        List of task objects
    """
    # Implementation here
    pass
```

#### Dashboard (TypeScript/React)

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use proper component prop interfaces
- Implement proper error handling

Example:
```typescript
interface TaskListProps {
  tasks: Task[]
  onTaskSelect: (task: Task) => void
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskSelect }) => {
  return (
    <div>
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onClick={() => onTaskSelect(task)} 
        />
      ))}
    </div>
  )
}
```

### Testing

#### Browser Pod Testing

Run tests for the browser-pod service:

```bash
cd browser-pod
python -m pytest tests/
```

#### Dashboard Testing

Run tests for the dashboard:

```bash
cd dashboard
npm test
```

## 📝 Commit Guidelines

Use conventional commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat(dashboard): add task execution monitoring
fix(browser-pod): resolve screenshot capture issue
docs: update API documentation
```

## 🔍 Pull Request Process

1. Ensure your code follows the project's coding standards
2. Add tests for new functionality
3. Update documentation if needed
4. Ensure all tests pass
5. Create a descriptive pull request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

## 🐛 Reporting Issues

When reporting bugs or requesting features:

1. Check existing issues first
2. Use the appropriate issue template
3. Provide detailed reproduction steps
4. Include system information and logs
5. Add screenshots for UI issues

## 💡 Feature Requests

For new feature suggestions:

1. Check if the feature already exists or is planned
2. Describe the use case and expected behavior
3. Consider the impact on existing functionality
4. Be open to discussion and feedback

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the project's guidelines

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [browser-use Library](https://github.com/browser-use/browser-use)

## 🆘 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: Maintainers will provide feedback on pull requests

Thank you for contributing to Browser Agents! 🚀
