# OpenClaw Mission Control

A modern web dashboard for managing and monitoring your OpenClaw AI agent fleet. Provides real-time gateway connectivity, agent oversight, cron job scheduling, session tracking, and system health monitoring through an intuitive control panel interface.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- An [OpenClaw Gateway](https://github.com/openclaw/openclaw) instance

### Installation

```bash
git clone https://github.com/mumudevx/openclaw-mission-control.git
cd openclaw-mission-control
npm install
```

### Running

```bash
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Start production server
```

## Setup Flow

On first launch, Mission Control presents a 5-step setup wizard:

1. **Welcome** — Introduction screen
2. **Admin Account** — Create admin credentials to protect the panel (skipped automatically if an admin already exists)
3. **Connection** — Enter your gateway URL (`ws://` or `wss://`) and authentication token
4. **Test** — Automatically tests the gateway connection
5. **Complete** — Displays server info and navigates to the dashboard

After setup, access is protected by login. Connection settings are persisted in localStorage and can be reset from **Settings > Danger Zone > Reset Setup**.

### Gateway Configuration

Your OpenClaw Gateway must allow connections from Mission Control's origin. Add it to `controlUi.allowedOrigins` in your gateway config if connecting from a different host.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** Zustand 5 (client stores)
- **Data Fetching:** TanStack Query v5 + Gateway WebSocket RPC
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Icons:** Lucide React (1.5px stroke)
- **Forms:** React Hook Form + Zod
- **Dates:** date-fns
- **Auth:** JWT sessions with file-based credentials

## Project Structure

```
src/
├── app/
│   ├── api/auth/       # Auth endpoints (login, logout, setup, status)
│   ├── dashboard/      # Main dashboard with stats & charts
│   ├── gateways/       # Gateway connection & health monitoring
│   ├── agents/         # AI agent list & detail views
│   ├── tasks/          # Kanban board
│   ├── logs/           # System log viewer
│   ├── cron/           # Cron job management
│   ├── calendar/       # Calendar view
│   ├── office/         # Pixel art virtual office
│   ├── login/          # Authentication page
│   └── settings/       # App configuration & reset setup
├── components/
│   ├── ui/             # shadcn/ui primitives
│   ├── layout/         # Sidebar, TopBar, AppShell
│   ├── shared/         # StatCard, StatusBadge, EmptyState, PageHeader
│   ├── setup/          # Setup wizard steps
│   ├── cron/           # Cron job sheet & components
│   └── providers/      # GatewayProvider, SetupGuard, ThemeProvider
├── hooks/              # Gateway query, mutation & event hooks
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── lib/
    ├── auth/           # JWT & credential utilities
    ├── gateway/        # WebSocket RPC client, types & adapters
    └── utils.ts        # Utility functions
```

## License

MIT
