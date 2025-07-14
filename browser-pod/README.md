# Browser Pod - Browser Use Cloud API

A FastAPI microservice that implements the Browser Use Cloud API for hosting browser automation agents. This service provides endpoints for creating, managing, and monitoring browser automation tasks using the browser-use package.

## Features

- **Complete API Implementation**: All endpoints from the OpenAPI specification
- **Browser Automation**: Integration with browser-use package for web automation
- **Task Management**: Create, run, pause, resume, and stop browser automation tasks
- **File Handling**: Upload files and download task outputs
- **In-Memory Storage**: Fast, stateless design perfect for microservices
- **Docker Support**: Containerized deployment with proper browser dependencies
- **Comprehensive Testing**: Unit and integration tests included

## API Endpoints

### Task Management
- `POST /api/v1/run-task` - Create and run browser automation tasks
- `PUT /api/v1/stop-task` - Stop running tasks
- `PUT /api/v1/pause-task` - Pause task execution
- `PUT /api/v1/resume-task` - Resume paused tasks
- `GET /api/v1/task/{task_id}` - Get detailed task information
- `GET /api/v1/task/{task_id}/status` - Get task status only
- `GET /api/v1/tasks` - List all tasks with pagination

### Media & Files
- `GET /api/v1/task/{task_id}/media` - Get task recordings
- `GET /api/v1/task/{task_id}/screenshots` - Get task screenshots
- `GET /api/v1/task/{task_id}/gif` - Get task GIF
- `GET /api/v1/task/{task_id}/output-file/{file_name}` - Get output files
- `POST /api/v1/uploads/presigned-url` - Get file upload URLs

### Utilities
- `GET /api/v1/ping` - Health check
- `POST /api/v1/delete-browser-profile-for-user` - Delete browser profiles

## Quick Start

### Using Docker (Recommended)

1. **Clone and build**:
   ```bash
   git clone <repository-url>
   cd browser-pod
   docker-compose up --build
   ```

2. **Access the API**:
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health check: http://localhost:8000/api/v1/ping

### Local Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

2. **Run the server**:
   ```bash
   python main.py
   ```

## Usage Examples

### Create a Browser Automation Task

```bash
curl -X POST "http://localhost:8000/api/v1/run-task" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Navigate to google.com and search for browser automation",
    "llm_model": "gpt-4o",
    "browser_viewport_width": 1280,
    "browser_viewport_height": 960,
    "max_agent_steps": 10
  }'
```

### Check Task Status

```bash
curl "http://localhost:8000/api/v1/task/{task_id}/status"
```

### Get Task Details

```bash
curl "http://localhost:8000/api/v1/task/{task_id}"
```

### Upload a File

```bash
# Get presigned URL
curl -X POST "http://localhost:8000/api/v1/uploads/presigned-url" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "example.txt",
    "content_type": "text/plain"
  }'

# Upload file using the returned URL
curl -X PUT "{upload_url}" \
  -F "file=@example.txt"
```

## Configuration

Environment variables:

- `HOST` - Server host (default: 0.0.0.0)
- `PORT` - Server port (default: 8000)
- `BROWSER_HEADLESS` - Run browser in headless mode (default: true)
- `MAX_CONCURRENT_TASKS` - Maximum concurrent tasks (default: 5)
- `TASK_TIMEOUT` - Task timeout in seconds (default: 3600)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 100MB)

## Project Structure

```
browser-pod/
├── app/
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic
│   ├── routers/         # API endpoints
│   ├── utils/           # Utilities
│   ├── config.py        # Configuration
│   └── main.py          # FastAPI app
├── tests/               # Test suite
├── storage/             # File storage
├── Dockerfile           # Container definition
├── docker-compose.yml   # Development setup
└── requirements.txt     # Dependencies
```

## Architecture

### Microservice Design
- **Stateless**: No persistent database, perfect for horizontal scaling
- **In-Memory Storage**: Fast task management using Python data structures
- **File System**: Local storage for uploads, screenshots, and outputs
- **Containerized**: Docker support with proper browser dependencies

### Browser Integration
- **browser-use Package**: Modern browser automation library
- **Playwright Backend**: Reliable browser control
- **Screenshot Capture**: Automatic screenshot collection during task execution
- **Multi-Model Support**: Various LLM models for different use cases

### Task Lifecycle
1. **Created**: Task is initialized but not started
2. **Running**: Task is actively executing
3. **Paused**: Task execution is temporarily halted
4. **Finished**: Task completed successfully
5. **Stopped**: Task was manually terminated
6. **Failed**: Task encountered an error

## Testing

Run the test suite:

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## Development

### Adding New Endpoints

1. Define models in `app/models/`
2. Implement business logic in `app/services/`
3. Create router in `app/routers/`
4. Add tests in `tests/`

### Browser-Use Integration

The service uses the browser-use package for browser automation. Key integration points:

- `BrowserService`: Manages agent lifecycle
- `TaskManager`: Handles task state and coordination
- Mock LLM support for development (configure real LLMs for production)

## Production Deployment

### Docker Deployment

```bash
# Build production image
docker build -t browser-pod:latest .

# Run with production settings
docker run -d \
  -p 8000:8000 \
  -e BROWSER_HEADLESS=true \
  -e MAX_CONCURRENT_TASKS=10 \
  -v /path/to/storage:/app/storage \
  browser-pod:latest
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: browser-pod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: browser-pod
  template:
    metadata:
      labels:
        app: browser-pod
    spec:
      containers:
      - name: browser-pod
        image: browser-pod:latest
        ports:
        - containerPort: 8000
        env:
        - name: BROWSER_HEADLESS
          value: "true"
        - name: MAX_CONCURRENT_TASKS
          value: "5"
        volumeMounts:
        - name: storage
          mountPath: /app/storage
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: browser-pod-storage
```

## Security Considerations

- **No Authentication**: Current implementation has no auth (add as needed)
- **File Upload Limits**: Configurable file size and type restrictions
- **Browser Sandboxing**: Runs in containerized environment
- **Non-Root User**: Docker container runs as non-root user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Browser Agents is open source software licensed under the Apache License 2.0.

## Support

For issues and questions:
- Review the test suite for usage examples
- Open an issue in the repository
