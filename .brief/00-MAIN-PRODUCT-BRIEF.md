# OpenClaw Mission Control - Main Product Brief

## Project Name: OpenClaw Mission Control Panel
## Version: 1.0
## Date: March 16, 2026
## Prepared by: Claude (Research & Analysis Agent)

---

## 1. Project Summary

OpenClaw Mission Control is a comprehensive management and monitoring dashboard for the OpenClaw AI agent framework. This panel enables users to manage all their AI agents, tasks, scheduled jobs, and system resources from a single interface.

### Vision
"The command center for your AI agent army — see everything, control everything, from one screen."

### Core Value Proposition
- Real-time monitoring of agent statuses
- Manage tasks with a Kanban board and assign them to agents
- Visually manage scheduled jobs (cron jobs)
- Fun and functional team visualization with pixel art virtual office
- Cost and performance tracking
- Send instant commands to agents and plan future tasks

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 14+ |
| **UI Library** | React | 18+ |
| **Styling** | Tailwind CSS | 3+ |
| **Component Library** | shadcn/ui | Latest |
| **State Management** | Zustand or React Context | - |
| **Real-time** | WebSocket (native or socket.io) | - |
| **Charts** | Recharts | Latest |
| **Drag & Drop** | @dnd-kit/core | Latest |
| **Icons** | Lucide React | Latest |
| **Date Handling** | date-fns | Latest |
| **Form Handling** | React Hook Form + Zod | Latest |
| **Data Fetching** | TanStack Query (React Query) | v5 |
| **Canvas (Office)** | HTML5 Canvas API | - |
| **Type Safety** | TypeScript | 5+ |

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │  Pages   │  │Components│  │   State (Zustand) │    │
│  │ (Routes) │  │(shadcn/ui│  │   + React Query  │    │
│  │          │  │+ custom) │  │                  │    │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘    │
│       │              │                  │              │
│  ┌────┴──────────────┴──────────────────┴──────────┐  │
│  │              Hooks Layer                         │  │
│  │  (useAgents, useTasks, useGateway, useLogs...)  │  │
│  └──────────────────┬──────────────────────────────┘  │
│                     │                                  │
│  ┌──────────────────┴──────────────────────────────┐  │
│  │           API / WebSocket Layer                  │  │
│  │  ┌───────────┐    ┌────────────────┐            │  │
│  │  │ REST API  │    │  WebSocket     │            │  │
│  │  │ Client    │    │  Client        │            │  │
│  │  └─────┬─────┘    └───────┬────────┘            │  │
│  └────────┼──────────────────┼─────────────────────┘  │
└───────────┼──────────────────┼─────────────────────────┘
            │                  │
            ▼                  ▼
   ┌────────────────────────────────────┐
   │      OpenClaw Gateway              │
   │   (WebSocket API + REST)           │
   │                                    │
   │   ┌──────────┐ ┌───────────┐      │
   │   │  Agents  │ │ Cron Jobs │      │
   │   └──────────┘ └───────────┘      │
   │   ┌──────────┐ ┌───────────┐      │
   │   │ Channels │ │  Memory   │      │
   │   └──────────┘ └───────────┘      │
   └────────────────────────────────────┘
```

### Data Flow
1. **Real-time**: Agent statuses, activity feed, log stream via WebSocket
2. **Periodic**: Cost data, historical statistics via REST API (cached with TanStack Query)
3. **User Actions**: Command sending, task assignment, cron creation via WebSocket or REST
4. **Local State**: Board layouts, user preferences, office layout (localStorage/IndexedDB)

---

## 4. Page Structure and Routing

```
/                          → Dashboard Home (redirect)
/dashboard                 → Dashboard Home/Overview
/gateways                  → Gateway Management
/agents                    → Agent List
/agents/[agentId]          → Agent Detail
/logs                      → System Logs
/office                    → Team/Pixel Office
/cron                      → Cron Jobs Management
/calendar                  → Calendar
/tasks                     → Kanban Board
/settings                  → Application Settings
```

---

## 5. Feature Briefs (Detailed References)

A separate detailed brief has been prepared for each feature. Refer to the relevant brief during development:

| # | Feature | Brief File | Priority |
|---|---------|-----------|----------|
| 1 | Research References | [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md) | - |
| 2 | Design System | [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md) | P0 |
| 3 | Dashboard Home | [03-DASHBOARD-HOME.md](./03-DASHBOARD-HOME.md) | P0 |
| 4 | Gateways | [04-GATEWAYS.md](./04-GATEWAYS.md) | P0 |
| 5 | Agents | [05-AGENTS.md](./05-AGENTS.md) | P0 |
| 6 | Logs | [06-LOGS.md](./06-LOGS.md) | P1 |
| 7 | Team/Pixel Office | [07-TEAM-OFFICE.md](./07-TEAM-OFFICE.md) | P1 |
| 8 | Cron Jobs | [08-CRON-JOBS.md](./08-CRON-JOBS.md) | P0 |
| 9 | Calendar | [09-CALENDAR.md](./09-CALENDAR.md) | P1 |
| 10 | Tasks (Kanban) | [10-TASKS-KANBAN.md](./10-TASKS-KANBAN.md) | P0 |

### Priority Definitions
- **P0**: Required for MVP (Minimum Viable Product) — must be developed in the first sprint
- **P1**: Should be developed in the second sprint
- **P2**: To be evaluated in future iterations

---

## 6. Development Phases

### Phase 1: Foundation (Sprint 1 - Weeks 1-2)
1. Next.js project setup (App Router, TypeScript)
2. Tailwind CSS + shadcn/ui configuration
3. Design system implementation (theme from 02-DESIGN-BRIEF.md)
4. Layout structure: Sidebar + Top Bar + Content Area
5. WebSocket connection layer
6. REST API client layer (TanStack Query)
7. Global state management (Zustand)
8. Routing structure

### Phase 2: Core Pages (Sprint 2 - Weeks 3-4)
1. **Dashboard Home** — Stat cards, charts, activity feed
2. **Gateways** — Gateway status, resources, channel management
3. **Agents** — Agent list, grid/list view, detail page, command sending
4. **Tasks (Kanban)** — Board structure, drag & drop, task creation/editing

### Phase 3: Secondary Pages (Sprint 3 - Weeks 5-6)
1. **Cron Jobs** — Timeline, job creation, run history
2. **Logs** — Log stream, filtering, search, detail view
3. **Calendar** — Month/week/day views, event creation
4. **Team Office** — Pixel art canvas, sprite animations, interactions

### Phase 4: Polish & Advanced Features (Sprint 4 - Weeks 7-8)
1. Responsive design (tablet, mobile)
2. Dark mode support
3. Command palette (Cmd+K)
4. Notification system
5. Performance optimization (lazy loading, virtualization)
6. E2E tests
7. Settings page

---

## 7. Project File Structure

```
openclaw-mission-control/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (sidebar + topbar)
│   │   ├── page.tsx                  # Redirect to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── gateways/
│   │   │   └── page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── [agentId]/
│   │   │       └── page.tsx
│   │   ├── logs/
│   │   │   └── page.tsx
│   │   ├── office/
│   │   │   └── page.tsx
│   │   ├── cron/
│   │   │   └── page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   └── NotificationPanel.tsx
│   │   ├── dashboard/                # 03-DASHBOARD-HOME.md
│   │   ├── gateway/                  # 04-GATEWAYS.md
│   │   ├── agents/                   # 05-AGENTS.md
│   │   ├── logs/                     # 06-LOGS.md
│   │   ├── office/                   # 07-TEAM-OFFICE.md
│   │   ├── cron/                     # 08-CRON-JOBS.md
│   │   ├── calendar/                 # 09-CALENDAR.md
│   │   ├── tasks/                    # 10-TASKS-KANBAN.md
│   │   └── shared/                   # Shared components
│   │       ├── StatCard.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── AgentAvatar.tsx
│   │       ├── Sparkline.tsx
│   │       └── SkeletonCard.tsx
│   │
│   ├── hooks/
│   │   ├── useWebSocket.ts           # WebSocket connection management
│   │   ├── useDashboardStats.ts
│   │   ├── useGatewayStatus.ts
│   │   ├── useAgents.ts
│   │   ├── useLogs.ts
│   │   ├── useCronJobs.ts
│   │   ├── useCalendarEvents.ts
│   │   ├── useTasks.ts
│   │   ├── useOffice.ts
│   │   └── useNotifications.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── dashboardStore.ts
│   │   ├── gatewayStore.ts
│   │   ├── agentStore.ts
│   │   ├── logStore.ts
│   │   ├── cronStore.ts
│   │   ├── calendarStore.ts
│   │   ├── taskStore.ts
│   │   ├── officeStore.ts
│   │   └── uiStore.ts               # Sidebar state, theme, etc.
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios/fetch wrapper
│   │   │   ├── gateway.ts           # Gateway API endpoints
│   │   │   ├── agents.ts            # Agent API endpoints
│   │   │   ├── tasks.ts             # Task API endpoints
│   │   │   └── cron.ts              # Cron API endpoints
│   │   ├── ws/
│   │   │   ├── client.ts            # WebSocket client
│   │   │   ├── events.ts            # Event type definitions
│   │   │   └── handlers.ts          # Event handlers
│   │   └── utils/
│   │       ├── cronParser.ts
│   │       ├── formatters.ts        # Number, date, currency formatters
│   │       ├── colors.ts            # Color helpers
│   │       └── constants.ts
│   │
│   ├── types/
│   │   ├── agent.ts
│   │   ├── task.ts
│   │   ├── gateway.ts
│   │   ├── cron.ts
│   │   ├── calendar.ts
│   │   ├── log.ts
│   │   └── office.ts
│   │
│   ├── assets/
│   │   └── sprites/                  # Pixel office sprites
│   │
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
│
├── public/
│   └── sprites/                      # Static pixel art assets
│
├── tailwind.config.ts                # 02-DESIGN-BRIEF.md theme
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 8. Cross-Feature Integrations

Important data connections between pages:

| Source | Target | Integration |
|--------|--------|-------------|
| Cron Jobs → Calendar | Active cron jobs automatically appear on calendar |
| Tasks → Calendar | Task deadlines appear on calendar |
| Tasks → Agents | Assign tasks to agents, auto-start |
| Agents → Office | Agent status reflected in pixel office |
| Agents → Logs | Agent logs are filterable |
| Cron → Logs | Cron execution logs are filterable |
| Dashboard → All | Summary data from all pages on dashboard |
| Gateway → Agents | Agents discovered through gateway |
| Calendar → Tasks | Create tasks from calendar, change deadlines |

---

## 9. Design Principles

Design principles to follow throughout this project (details in 02-DESIGN-BRIEF.md):

1. **Minimalist & Functional**: Clean whitespace, rounded cards, soft shadows
2. **Color Palette**: Burnt orange accent (#E8654A), warm off-white background (#F5F5F0)
3. **Typography**: Inter font family, clear hierarchy
4. **Components**: shadcn/ui based, customized (pill-shape buttons, 20px radius cards)
5. **Icons**: Lucide React, consistent 1.5px stroke
6. **Animations**: Fast (150-300ms), purposeful, performant
7. **Responsive**: Desktop-first, tablet and mobile support

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| First Load (LCP) | < 2 seconds |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| WebSocket Message Processing | < 100ms |
| Drag & Drop | 60fps |
| Bundle Size (initial) | < 200KB (gzipped) |

---

## 11. Security Requirements

- HTTPS mandatory
- WebSocket connections authenticated via challenge/nonce
- API keys shown with masked display (all but last 4 characters)
- Local operation: Data never leaves the machine (no cloud, no telemetry)
- Optional: TOTP MFA support
- Rate limiting: Flood protection on command sending

---

## 12. Next Steps

1. Deliver this brief to the full-stack dev agent
2. Agent starts development beginning with Phase 1
3. Demo/review at the end of each phase
4. Use state management and component structures from feature briefs as reference
5. Implement the design brief (02) as Tailwind theme configuration in the first step

---

## Appendices

### Research Sources
For all research references, community projects, and technical documentation links:
→ [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

### Design System
For color palette, typography, component details, Tailwind configuration, and wireframes:
→ [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
