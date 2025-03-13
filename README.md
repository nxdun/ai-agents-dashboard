<div align="center">
  <img src="/src/assets/logo.png" alt="AgentFlow Logo" width="200"/>
  <br/>
  <strong>Modern, intelligent multi-agent system monitoring & management</strong>
  <br/>
  <br/>
</div>

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

<br/>

## 🔍 Overview

AgentFlow Dashboard provides a sophisticated interface for monitoring and managing AI agents and workflows in a multi-agent system. Built with React and TailwindCSS, it offers a responsive, feature-rich experience with real-time monitoring capabilities.

<br/>

## 🖼️ Screenshots

| Light Mode | Dark Mode |
|------------|-----------|
| ![Light Mode Dashboard](/src/assets/light_mode.png) | ![Dark Mode Dashboard](/src/assets/dark_mode.png) |

<br/>

## 🚀 Key Features

- **Intuitive Dashboard** — Comprehensive overview of your AI ecosystem
- **Workflow Management** — Create, monitor, and manage complex agent workflows
- **Real-time Monitoring** — Live tracking of agent activities and system health
- **Model Integration** — Connect and test different language models
- **Health Monitoring** — System-wide health metrics and component status
- **Dark/Light Mode** — Fully customizable interface with theme support
- **Responsive Design** — Optimized for desktop and mobile devices

<br/>

## ⚙️ Quick Setup

```bash
# Clone the repository
git clone https://github.com/nxdun/ai-agents-dashboard

# Navigate to project directory
cd ai-agents-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoint

# Start development server
npm run dev

# Build for production
npm run build
```

<br/>

## 🏗️ Architecture

<details>
<summary><strong>Project Structure</strong></summary>

```
src/
├── components/       # Reusable UI components
│   ├── CreateWorkflowModal.jsx
│   ├── ModelTestModal.jsx
│   ├── NavBar.jsx
│   ├── RealtimeMonitor.jsx
│   ├── Sidebar.jsx
│   └── ...
├── context/          # React context providers
│   └── DarkModeContext.jsx
├── pages/            # Application views
│   ├── Activities.jsx
│   ├── Agents.jsx
│   ├── Dashboard.jsx
│   ├── Health.jsx
│   ├── Models.jsx
│   └── Workflows.jsx
├── services/         # API integration
├── utils/            # Helper functions
├── App.jsx           # Main component
└── main.jsx         # Entry point
```
</details>

<details>
<summary><strong>Technology Stack</strong></summary>

- **Frontend Framework:** React 19
- **Routing:** React Router 7
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Build Tool:** Vite
</details>

<br/>

## 🎨 Customization

### Theming

The dashboard uses TailwindCSS for styling with a custom color palette. Modify tailwind.config.js to customize:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          // Your custom color palette
          500: '#6366f1',
          600: '#4f46e5',
          // ...
        },
        // ...
      }
    }
  }
}
```

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in App.jsx
3. Add a navigation item in Sidebar.jsx

<br/>

## 🔌 API Integration

Configure your API endpoint in the `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEFAULT_THEME=system
```

<br/>

## 📊 Main Dashboard Features

- **Status Cards** — Quick overview of agents, models, workflows, and activities
- **Recent Workflows** — Monitor and access recently executed workflows
- **System Health** — Real-time health metrics including uptime and response times
- **Component Status** — Individual service status with health indicators

<br/>

## 📱 Responsive Design

AgentFlow Dashboard is fully responsive:
- **Desktop** — Full-featured experience with sidebar navigation
- **Tablet** — Optimized layout with collapsible sidebar
- **Mobile** — Touch-friendly interface with mobile navigation

<br/>

## 🧩 Core Components

- **Workflow Creation** — Step-by-step workflow builder with validation
- **Real-time Monitor** — Live activity logs and progress tracking
- **Model Testing** — Interactive testing interface for language models
- **Health Dashboard** — Comprehensive system status monitoring

<br/>

## 📄 License

MIT License

<br/>

---

<div align="center">
  <p>Made with ❤️ by the AgentFlow (@nxdun)</p>
</div>