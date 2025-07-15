# Browser Agents - AI Browser Automation Platform

Browser Agents is a comprehensive web platform that lets you create, deploy, and manage AI-powered browser automation agents. Build intelligent bots that can navigate websites, extract data, fill forms, and perform complex web tasks using natural language instructions through a modern dashboard interface.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎯 Features](#-key-features) • [🏗️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing) • [💬 Community](#-community--support)

## ✨ Key Features

### 🎨 **Task Template System**
- Reusable task configurations
- Natural language task descriptions
- Flexible parameter management
- Template sharing and versioning

### 🧠 **Multi-Model AI Support**
- OpenAI GPT-4o, GPT-4 Turbo
- Anthropic Claude 3.5 Sonnet, Claude 3 Opus
- Google Gemini Pro
- Custom model configurations

### 📊 **Enterprise Dashboard**
- Real-time execution monitoring
- Task template management
- Execution history with screenshots
- User authentication & management

### 🔌 **RESTful API**
- Complete OpenAPI specification
- Task lifecycle management
- File upload/download support
- Webhook integrations
- API key management

### 🚀 **Advanced Capabilities**

- **Visual Understanding**: Agents can see and interact with web pages using browser-use library
- **Task Control**: Start, stop, pause, and resume task executions
- **Media Capture**: Automatic screenshots, recordings, and GIF generation
- **File Handling**: Upload files for tasks and download outputs
- **Database Persistence**: PostgreSQL with Drizzle ORM for reliable data storage
- **Containerized Deployment**: Full Docker Compose setup for easy deployment

## 🏗️ Architecture

Browser Agents consists of three main components:

### 🐳 **Browser Pod** (`/browser-pod`)
FastAPI microservice that handles browser automation:
- **Technology**: Python 3.11+, FastAPI, browser-use, Playwright
- **Purpose**: Core browser automation engine with REST API
- **Features**: Task execution, media capture, file handling
- **Storage**: In-memory task management with file system storage

### 🎛️ **Dashboard** (`/dashboard`)
Next.js web application for task management:
- **Technology**: Next.js 15, React 19, Material-UI, TypeScript
- **Purpose**: User interface for creating and monitoring tasks
- **Features**: Task templates, execution monitoring, user authentication
- **Database**: PostgreSQL with Drizzle ORM

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/daviddaytw/browser-agents.git
   cd browser-agents
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the platform**:
   - **Dashboard**: http://localhost:3000
   - **Browser Pod API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Database**: localhost:5432 (postgres/postgres)

### Manual Setup

#### Browser Pod Service

```bash
cd browser-pod
pip install -r requirements.txt
playwright install chromium
python main.py
```

#### Dashboard Application

```bash
cd dashboard
npm install
cp .env.example .env.local
# Configure your environment variables
npm run db:push
npm run dev
```

## 📖 Usage Guide

### Creating Task Templates

1. Navigate to the Dashboard at http://localhost:3000
2. Sign in or create an account
3. Go to "Task Templates" → "Create Task"
4. Configure your task:
   - **Name & Description**: Define what the agent should do
   - **LLM Model**: Choose your preferred AI model
   - **Browser Settings**: Viewport size, proxy configuration
   - **Automation Settings**: Max steps, element highlighting

### Executing Tasks

1. From task templates, click "Execute" on any task
2. Provide runtime parameters:
   - **Secrets**: JSON object with credentials or API keys
   - **Files**: Upload files needed for the task
   - **Browser Data**: Choose whether to persist cookies/session
3. Monitor execution in real-time with live status updates

### API Integration

```bash
# Create and run a task
curl -X POST "http://localhost:8000/api/v1/run-task" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Navigate to google.com and search for browser automation",
    "llm_model": "gpt-4o",
    "browser_viewport_width": 1280,
    "browser_viewport_height": 960,
    "max_agent_steps": 10
  }'

# Check task status
curl "http://localhost:8000/api/v1/task/{task_id}/status"

# Get task screenshots
curl "http://localhost:8000/api/v1/task/{task_id}/screenshots"
```

## 🛡️ Security & Compliance

- **🔐 Secure Authentication**: NextAuth.js with JWT-based authentication
- **🔒 Data Encryption**: All data encrypted in transit (TLS) and at rest
- **🛡️ Input Validation**: Comprehensive input sanitization and validation
- **📊 Audit Logging**: Complete audit trail of all actions and changes
- **🏢 Enterprise Ready**: PostgreSQL database with proper data persistence
- **🔑 User Isolation**: All tasks and executions scoped to authenticated users
- **🚫 Rate Limiting**: Configurable concurrent task limits and timeouts

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help makes Browser Agents better for everyone.

### 🚀 Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 🎯 Ways to Contribute

- 🐛 **Report Bugs**: Help us identify and fix issues
- 💡 **Suggest Features**: Share ideas for new functionality  
- 📝 **Improve Documentation**: Help others understand the platform
- 🔧 **Submit Code**: Fix bugs or add new features
- 🎨 **Design & UX**: Improve the user interface and experience
- 🧪 **Testing**: Add tests and improve test coverage

**👉 [Read our detailed Contributing Guide](CONTRIBUTING.md)**

## ❓ FAQ

<details>
<summary><strong>What makes Browser Agents different from other automation tools?</strong></summary>

Browser Agents combines the power of large language models with browser automation through the browser-use library, allowing you to describe tasks in natural language. It provides both a user-friendly dashboard and a complete REST API, making it suitable for both technical and non-technical users.

</details>

<details>
<summary><strong>Which AI models are supported?</strong></summary>

We support OpenAI (GPT-4o, GPT-4 Turbo), Anthropic (Claude 3.5 Sonnet, Claude 3 Opus), Google (Gemini Pro), and custom model configurations. You can choose the best model for each specific task.

</details>

<details>
<summary><strong>Is there a free tier available?</strong></summary>

Yes! The entire platform is open-source and free to use. You only pay for the AI model API usage (OpenAI, Anthropic, etc.) and any cloud hosting costs if you choose to deploy it in the cloud.

</details>

<details>
<summary><strong>Can I run this on-premises?</strong></summary>

Absolutely! Browser Agents is designed to run on-premises or in your private cloud. All data stays within your infrastructure, and the Docker Compose setup makes deployment straightforward.

</details>

<details>
<summary><strong>How do I handle websites that require authentication?</strong></summary>

Browser Agents supports various authentication methods through the secrets parameter in task executions. You can provide login credentials, API keys, or session tokens that the agent can use during task execution.

</details>

<details>
<summary><strong>What's the difference between task templates and executions?</strong></summary>

Task templates are reusable configurations that define what the agent should do and how it should behave. Task executions are individual runs of a template with specific runtime parameters like secrets and files.

</details>

## 📄 License

Browser Agents is open source software licensed under the [Apache License 2.0](LICENSE).

## 🙏 Acknowledgments

Browser Agents is built on the shoulders of giants. Special thanks to:

- **[browser-use](https://github.com/browser-use/browser-use)** - The core browser automation library that powers our agents

---

<div align="center">

**Made with ❤️ by the [David Day](https://github.com/daviddaytw)**

[⭐ Star us on GitHub](https://github.com/daviddaytw/browser-agents) • [🐛 Report Issues](https://github.com/daviddaytw/browser-agents/issues)

</div>
