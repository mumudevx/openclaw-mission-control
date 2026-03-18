# OpenClaw Mission Control

The command center for your AI agent army. A dashboard for managing AI agents, tasks, cron jobs, and gateway connections — built with Next.js 16, React 19, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- An [OpenClaw Gateway](https://github.com/openclaw) instance (for live data)

### Installation

```bash
git clone https://github.com/mumudevx/openclaw-mission-control.git
cd openclaw-mission-control
npm install
```

### Configuration

Copy the environment template and update as needed:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GATEWAY_URL` | WebSocket URL of your OpenClaw Gateway | `ws://localhost:18789` |
| `NEXT_PUBLIC_GATEWAY_TOKEN` | Authentication token for the gateway | _(empty)_ |

> These values can also be configured through the in-app Setup Wizard on first launch.

### Running

```bash
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Start production server
```

## Setup Wizard

On first launch, Mission Control presents a 4-step setup wizard:

1. **Welcome** — Introduction screen
2. **Connection** — Enter your gateway URL (`ws://` or `wss://`) and optional auth token
3. **Test** — Automatically tests the connection with a 15-second timeout
4. **Complete** — Displays server info and navigates to the dashboard

Connection settings are persisted in the browser's localStorage. You can re-run the wizard at any time from **Settings > Danger Zone > Reset Setup**.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** Zustand 5 (client stores)
- **Data Fetching:** TanStack Query v5 + Gateway RPC
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Icons:** Lucide React (1.5px stroke)
- **Forms:** React Hook Form + Zod
- **Dates:** date-fns

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Main dashboard with stats & charts
│   ├── gateways/     # Gateway connection management
│   ├── agents/       # AI agent list & detail views
│   ├── tasks/        # Kanban board
│   ├── logs/         # System log viewer
│   ├── cron/         # Cron job management
│   ├── calendar/     # Calendar view
│   ├── office/       # Pixel art virtual office
│   └── settings/     # App configuration & reset setup
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # Sidebar, TopBar, AppShell
│   ├── shared/       # StatCard, StatusBadge, EmptyState, PageHeader
│   ├── setup/        # Setup wizard steps
│   └── providers/    # GatewayProvider, SetupGuard, ThemeProvider
├── hooks/            # Gateway query/mutation/event hooks
├── stores/           # Zustand state stores
├── types/            # TypeScript type definitions
└── lib/
    ├── gateway/      # Gateway RPC client & adapters
    └── utils.ts      # Utility functions
```

## License

MIT
