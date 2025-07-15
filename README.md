# Browser Agents - AI Browser Automation Platform

Browser Agents is a comprehensive web platform that lets you create, deploy, and manage AI-powered browser automation agents. Build intelligent bots that can navigate websites, extract data, fill forms, and perform complex web tasks using natural language instructions through a modern dashboard interface.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🚀 Quick Start

1. **Clone and start**:
   ```bash
   git clone https://github.com/daviddaytw/browser-agents.git
   cd browser-agents
   docker-compose up --build
   ```

2. **Access the platform**:
   - Dashboard: http://localhost:3000
   - API: http://localhost:8000/docs

## 🏗️ Architecture

Browser Agents consists of two main components:

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

## 📖 Usage

1. Open the dashboard at http://localhost:3000
2. Create a task template describing what you want to automate
3. Execute the task and monitor progress in real-time
4. Download results and media captures


<details>
<summary><strong>Configuration</strong></summary>

### Environment Variables
- `OPENAI_API_KEY` - Your OpenAI API key
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `DATABASE_URL` - PostgreSQL connection string
</details>

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick steps:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

## 🙏 Acknowledgments

- **[browser-use](https://github.com/browser-use/browser-use)** - The core browser automation library that powers our agents

---

<div align="center">

**Made with ❤️ by the [David Day](https://github.com/daviddaytw)**

[⭐ Star us on GitHub](https://github.com/daviddaytw/browser-agents) • [🐛 Report Issues](https://github.com/daviddaytw/browser-agents/issues)

</div>
