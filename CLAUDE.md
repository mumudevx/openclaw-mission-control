# OpenClaw Mission Control

AI agent management dashboard - "The command center for your AI agent army"

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
npm start        # Start production server
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **State:** Zustand 5 (client stores)
- **Data Fetching:** TanStack Query v5
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Icons:** Lucide React (1.5px stroke)
- **Forms:** React Hook Form + Zod
- **Dates:** date-fns

## Architecture

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
│   └── settings/     # App configuration
├── components/
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # Sidebar, TopBar, AppShell
│   ├── shared/       # StatCard, StatusBadge, PageHeader
│   ├── dashboard/    # Dashboard-specific components
│   └── providers/    # React context providers
├── stores/           # Zustand state stores
├── types/            # TypeScript type definitions
└── lib/
    ├── api/          # REST API client
    ├── ws/           # WebSocket client
    ├── mock/         # Mock data for development
    └── utils.ts      # Utility functions (cn helper)
```

## Design System

- **Accent:** #E8654A (Burnt Orange)
- **Background:** #F5F5F0 (Warm Off-White)
- **Cards:** White, 20px radius, subtle shadow
- **Buttons:** 24px radius (pill shape)
- **Font:** Inter (primary), JetBrains Mono (code)
- **Icons:** Lucide React, 1.5px stroke weight

## Conventions

- CSS variables defined in `globals.css` for design tokens
- shadcn/ui components in `src/components/ui/`
- Custom components use design token CSS variables (e.g., `var(--accent-primary)`)
- Mock data in `src/lib/mock/data.ts` for all entities
- Zustand stores follow `{entity}Store.ts` naming
- All pages are client components using mock data (API integration later)

## Brief Files

Detailed specs for each feature in `.brief/` directory:
- `00-MAIN-PRODUCT-BRIEF.md` - Master architecture
- `02-DESIGN-BRIEF.md` - Complete design system
- `03-10` - Individual feature specs
