# OpenClaw Mission Control - Research References

## Research Date: March 16, 2026

---

## 1. What is OpenClaw?

OpenClaw (formerly Clawdbot, briefly Moltbot) is an MIT-licensed, open-source AI agent framework created by Austrian developer Peter Steinberger. Launched in November 2025, the project went viral in late January 2026 and reached 196,000+ GitHub stars, 600+ contributors, and 10,000+ commits in under 3 months.

OpenClaw is a local-first agent runtime that turns your messaging apps (WhatsApp, Telegram, Slack, Discord, etc.) into a command center for your computer.

### Architecture

- **Gateway**: Runs as a single, long-lived daemon. Manages messaging surfaces, provides a WebSocket API, and emits system events like cron ticks and heartbeats.
- **WebSocket Protocol**: All clients (CLI, web UI, macOS, iOS/Android) connect via WebSocket using JSON-payload text frames.
- **Agent Orchestration**: The Gateway receives operations, queues them, starts agent runs, streams progress, and saves results to memory.

---

## 2. Notable Mission Control Projects

### 2.1 abhi1693/openclaw-mission-control
- **Description**: Centralized operations and governance platform for OpenClaw
- **Features**: Agent lifecycle management, approval flows, gateway management, API-driven automation
- **Target Audience**: Platform teams running OpenClaw in self-hosted or internal environments
- **URL**: https://github.com/abhi1693/openclaw-mission-control

### 2.2 crshdn/mission-control
- **Description**: AI Agent Orchestration Dashboard with WebSocket-based OpenClaw Gateway integration
- **Features**: Gateway Agent Discovery, Docker-ready deployment, bearer token auth, HMAC webhooks, Zod validation, live activity feed
- **Kanban**: Tasks progress through 7 stages: Planning → Inbox → Assigned → In Progress → Testing → Review → Done
- **Privacy**: No ad trackers, data stays in your own deployment (SQLite + workspace)
- **URL**: https://github.com/crshdn/mission-control

### 2.3 robsannaa/openclaw-mission-control
- **Description**: A GUI to fully manage OpenClaw without touching the CLI
- **Features**: Live agent/gateway/cron monitoring, system resources (CPU, memory, disk), security audits, Tailscale integration
- **Privacy**: Runs 100% locally, no cloud/telemetry/accounts required
- **URL**: https://github.com/robsannaa/openclaw-mission-control

### 2.4 builderz-labs/mission-control
- **Description**: Agent fleet management, task tracking, cost monitoring, workflow orchestration
- **Features**: Multi-agent registration adapter layer (OpenClaw, CrewAI, LangGraph, AutoGen, Claude SDK), token usage dashboard, cost analysis with Recharts
- **URL**: https://github.com/builderz-labs/mission-control

### 2.5 carlosazaustre/tenacitOS
- **Description**: Real-time dashboard and control center built with Next.js, React 19, Tailwind CSS v4
- **Features**:
  - Agent Dashboard: All agents, sessions, token usage, model, and activity status
  - Cost Tracking: Real cost analytics from OpenClaw sessions
  - Visual Cron Manager: Weekly timeline, run history, manual triggering
  - Activity Feed: Real-time agent action log with heatmaps and charts
  - Memory Browser: Explore, search, and edit agent memory files
  - File Browser: Navigate workspace files
  - **3D Office**: Interactive 3D office with one voxel avatar per agent via React Three Fiber
- **Architecture**: Lives inside the OpenClaw workspace, reads configuration directly from the host. No extra DB/backend needed
- **URL**: https://github.com/carlosazaustre/tenacitOS

### 2.6 clawdeckio/clawdeck
- **Description**: Kanban-style dashboard for OpenClaw agents
- **Features**: Task tracking, assigning work to agents, asynchronous collaboration
- **URL**: https://github.com/clawdeckio/clawdeck

### 2.7 Clawtrol
- **Description**: The project with the most features in a single dashboard
- **Features**: System overview, remote screen viewer, web terminal (ttyd), file browser, session viewer, Kanban board, memory browser, cron manager, sub-agent monitor

---

## 3. Pixel Office / Virtual Office Implementations

### 3.1 WW-AI-Lab/openclaw-office
- **Description**: Visual monitoring and management frontend for OpenClaw Multi-Agent systems
- **Connection**: Connects to the OpenClaw Gateway via WebSocket to visualize agent collaboration as a "digital office"
- **Visualization**: Renders agent work status, collaboration connections, tool calls, and resource consumption in an isometric virtual office scene
- **URL**: https://github.com/WW-AI-Lab/openclaw-office

### 3.2 OpenClaw Live Workspace (Chrome Extension)
- **Description**: Brings agents to life in a real-time pixel-art office
- **Features**: Live agent monitoring, real-time workspace visualization, automatic local gateway discovery, interactive office map (editable layout)
- **URL**: https://chromewebstore.google.com/detail/openclaw-live-workspace/boffibelgiggpjcannbekjbockanjcfb

### 3.3 ringhyacinth/Star-Office-UI
- **Description**: Pixel office for OpenClaw with characters, daily notes, and guest agents, turning invisible work states into a cozy space
- **URL**: https://github.com/ringhyacinth/Star-Office-UI

### 3.4 GreenSheep01201/claw-empire
- **Description**: Manage your AI Agent Empire from the CEO's Desk — an office simulator operating as a virtual autonomous company
- **URL**: https://github.com/GreenSheep01201/claw-empire

### 3.5 Pixel Agents Dashboard (Skill)
- **Description**: Real-time pixel art ops dashboard that visualizes agent activity as character sprites in a shared office
- **Install**: `npx clawhub@latest install openclaw-pixel-agents-dashboard`
- **URL**: https://termo.ai/skills/openclaw-pixel-agents-dashboard

---

## 4. Cron Jobs System

### Gateway Scheduler
- OpenClaw cron is a scheduler that lives inside the Gateway
- No separate job runner required
- Can deliver results directly to Telegram/WhatsApp/Slack/Discord

### Schedule Types
- **at**: One-time execution
- **every**: Interval-based
- **cron**: Standard cron expressions (e.g., "0 9 * * 1" = Every Monday at 09:00)

### Features
- Job definitions stored on disk
- Run history kept separately
- Can run in isolated sessions (clean context, recommended) or the main session (with conversation history)

---

## 5. Community Observations

### Reddit/DEV Community Discussions
- The community hasn't fully agreed on what Mission Control should be
- Some users complain about lack of cost tracking (one user spent $60 overnight)
- Missing error recovery mechanisms is a common pain point
- "Circuit breaker" pattern is being discussed in the community

### Ecosystem Size
- 196,000+ GitHub stars
- 600+ contributors
- 5,400+ skills (ClawHub marketplace)
- Numerous independent dashboard applications

---

## 6. Technical References

### Gateway Protocol
- WebSocket-based control plane
- JSON-payload text frames
- Device identity + challenge/nonce authentication
- Scope: status, channels, models, chat, agent, sessions, nodes, approvals
- **Documentation**: https://docs.openclaw.ai/gateway/protocol

### Cron Jobs Documentation
- **Official Docs**: https://docs.openclaw.ai/automation/cron-jobs
- **Community Guide**: https://lumadock.com/tutorials/openclaw-cron-scheduler-guide

### Dashboard Official Docs
- **URL**: https://docs.openclaw.ai/web/dashboard

---

## 7. Reference URLs

| Source | URL |
|--------|-----|
| OpenClaw Main Repo | https://github.com/openclaw/openclaw |
| Official Documentation | https://docs.openclaw.ai |
| Mission Control (abhi1693) | https://github.com/abhi1693/openclaw-mission-control |
| Mission Control (crshdn) | https://github.com/crshdn/mission-control |
| Mission Control (robsannaa) | https://github.com/robsannaa/openclaw-mission-control |
| Mission Control (builderz-labs) | https://github.com/builderz-labs/mission-control |
| TenacitOS | https://github.com/carlosazaustre/tenacitOS |
| ClawDeck | https://github.com/clawdeckio/clawdeck |
| OpenClaw Office | https://github.com/WW-AI-Lab/openclaw-office |
| Star Office UI | https://github.com/ringhyacinth/Star-Office-UI |
| Claw Empire | https://github.com/GreenSheep01201/claw-empire |
| Claw Control | https://www.clawcontrol.xyz/ |
| ClawBoard (Kanban) | https://github.com/zielulab/clawboard |
| OpenClaw Dashboard (tugcan) | https://github.com/tugcantopaloglu/openclaw-dashboard |
| Best Dashboards 2026 | https://www.bitdoze.com/best-openclaw-dashboards/ |
| Jonathan Tsai Blog | https://www.jontsai.com/2026/02/12/building-mission-control-for-my-ai-workforce-introducing-openclaw-command-center |
| DEV Community Analysis | https://dev.to/octomind_dev/openclaw-mission-control-what-it-actually-is-and-what-nobodys-telling-you-4cfb |
| Awesome OpenClaw Skills | https://github.com/VoltAgent/awesome-openclaw-skills |
| Gateway Protocol Docs | https://docs.openclaw.ai/gateway/protocol |
| Cron Jobs Docs | https://docs.openclaw.ai/automation/cron-jobs |
