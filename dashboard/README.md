# Browser Agents Dashboard

A Next.js dashboard for managing browser automation tasks using the browser-pod API. This dashboard allows you to create task templates, execute them with different parameters, and monitor their progress in real-time.

## Features

- **Task Templates**: Create reusable task configurations with browser settings, LLM models, and automation parameters
- **Task Execution**: Execute tasks with runtime parameters like secrets and file uploads
- **Real-time Monitoring**: Track task execution progress with live status updates
- **Task Control**: Stop, pause, and resume running tasks
- **Execution History**: View detailed execution logs, screenshots, and outputs
- **User Authentication**: Secure access with NextAuth.js
- **Database Integration**: PostgreSQL with Drizzle ORM for data persistence

## Architecture

The dashboard follows a clean separation between task templates and executions:

1. **Task Templates** (`tasks` table): Store reusable task configurations
2. **Task Executions** (`task_executions` table): Store individual execution instances with runtime parameters and results
3. **Browser-Pod Integration**: Communicates with the browser-pod API for actual task execution
4. **Real-time Sync**: Periodically syncs execution status from browser-pod to the database

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Browser-pod service running (see ../browser-pod/README.md)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/browser_agents

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Browser-pod API
BROWSER_POD_URL=http://localhost:8000
```

3. Generate and run database migrations:
```bash
npm run db:generate
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

## Database Schema

### Tasks Table
Stores task templates with configuration:
- Basic info: name, description, user
- Browser settings: viewport size, proxy, adblock
- LLM configuration: model selection
- Automation settings: max steps, element highlighting

### Task Executions Table
Stores individual execution instances:
- Links to task template
- Runtime parameters: secrets, files
- Execution results: status, output, screenshots
- Browser-pod sync data: steps, recordings

## API Endpoints

### Task Management
- `GET /api/tasks` - List task templates
- `POST /api/tasks` - Create task template
- `GET /api/tasks/[id]` - Get task template details
- `PUT /api/tasks/[id]` - Update task template
- `DELETE /api/tasks/[id]` - Delete task template
- `POST /api/tasks/[id]/execute` - Execute task

### Execution Management
- `GET /api/executions` - List executions
- `GET /api/executions/[id]` - Get execution details
- `DELETE /api/executions/[id]` - Delete execution
- `POST /api/executions/[id]/control` - Control execution (stop/pause/resume)
- `POST /api/executions/[id]/sync` - Sync execution status from browser-pod

## Usage

### Creating a Task Template

1. Navigate to "Task Templates" in the sidebar
2. Click "Create Task"
3. Fill in task details:
   - **Name**: Descriptive name for the task
   - **Description**: What the browser agent should do
   - **LLM Model**: Choose the AI model (GPT-4o, Claude, etc.)
   - **Browser Settings**: Viewport size, proxy settings
   - **Automation Settings**: Max steps, element highlighting

### Executing a Task

1. From the task templates page, click "Execute" on any task
2. Provide runtime parameters:
   - **Secrets**: JSON object with credentials (e.g., login info)
   - **Save Browser Data**: Whether to persist cookies/session
3. Click "Execute Task"
4. You'll be redirected to the execution monitoring page

### Monitoring Executions

1. Navigate to "Executions" to see all running and completed tasks
2. Click on any execution to view detailed progress
3. Use control buttons to stop, pause, or resume running tasks
4. View screenshots, steps, and output files when available

## Development

### Database Operations

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Project Structure

```
dashboard/
├── app/
│   ├── (dashboard)/          # Dashboard pages
│   │   ├── page.tsx         # Dashboard home
│   │   ├── tasks/           # Task management
│   │   └── executions/      # Execution monitoring
│   ├── api/                 # API routes
│   │   ├── tasks/           # Task CRUD operations
│   │   └── executions/      # Execution management
│   └── layout.tsx           # Root layout with navigation
├── lib/
│   ├── db/                  # Database configuration
│   │   ├── index.ts         # Database connection
│   │   └── schema.ts        # Drizzle schema
│   └── browser-pod-client.ts # Browser-pod API client
└── drizzle.config.ts        # Drizzle configuration
```

## Integration with Browser-Pod

The dashboard communicates with browser-pod through a REST API:

1. **Task Execution**: Sends task configuration to `/api/v1/run-task`
2. **Status Monitoring**: Polls `/api/v1/task/{id}` for updates
3. **Task Control**: Uses `/api/v1/stop-task`, `/api/v1/pause-task`, etc.
4. **Media Retrieval**: Fetches screenshots and recordings

The browser-pod client handles all API communication and error handling.

## Authentication

The dashboard uses NextAuth.js for authentication. Configure your preferred OAuth provider in the environment variables. Users are identified by their email address, and all tasks/executions are scoped to the authenticated user.

## Deployment

For production deployment:

1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Build the application: `npm run build`
4. Start the production server: `npm start`

Consider using platforms like Vercel, Railway, or Docker for deployment.
