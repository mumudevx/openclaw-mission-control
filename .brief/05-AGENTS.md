# Feature Brief: Agents

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Agents page provides a central interface for managing, monitoring, and interacting with all OpenClaw agents throughout their lifecycle. Users can view agents, assign new tasks, track statuses, and send instant commands from this page.

---

## 2. Page Sections

### 2.1 Agent Overview Header

Summary metrics at the top:
```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 5 Active   │ │ 2 Idle     │ │ 1 Error    │ │ 8 Total    │
│ ● Running  │ │ ● Waiting  │ │ ● Failed   │ │   Agents   │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### 2.2 Agent List / Grid View

Two view modes:
- **Grid View**: Card-based (default)
- **List View**: Table-based (compact)

Switchable via toggle button.

#### Agent Card (Grid View):
```
┌───────────────────────────────────┐
│  [Avatar]  Agent Name              │
│            @agent-handle          │
│                                   │
│  Model: claude-sonnet-4-5-20250514          │
│  Status: ● Active                 │
│  Current Task: PR Review #142     │
│                                   │
│  Tokens Today:  12,450            │
│  Cost Today:    $0.82             │
│  Tasks Done:    7                 │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  [Mini Activity Sparkline]  │  │
│  └─────────────────────────────┘  │
│                                   │
│  [Send Command] [View Details]    │
└───────────────────────────────────┘
```

#### Agent Table (List View):

| Agent | Model | Status | Current Task | Tokens | Cost | Actions |
|-------|-------|--------|-------------|--------|------|---------|
| dev-agent | claude-sonnet | ● Active | PR Review | 12.4K | $0.82 | [▶] [👁] |
| qa-agent | gpt-4o | ● Idle | - | 3.2K | $0.21 | [▶] [👁] |

### 2.3 Agent Detail Page (Drawer/Sheet or Separate Page)

Detail view opened when clicking an agent card:

#### Header Info
- Avatar, name, handle
- Status badge (large)
- Model info
- Uptime

#### Session Info
- Active session ID
- Session type: DM / Group / Cron / SubAgent
- Context usage: Progress bar (e.g., 45% / 128K tokens)
- Session start time

#### Live Activity Feed
Shows the agent's real-time actions:
```
14:32:15  🔧 Tool Call: file_read("src/index.ts")
14:32:18  💭 Reasoning: Analyzing the import structure...
14:32:22  ✏️  File Edit: src/utils/helper.ts (lines 42-56)
14:32:25  🔧 Tool Call: bash("npm test")
14:32:30  ✅ Task Complete: PR Review #142
```

Each entry:
- Timestamp
- Action type icon
- Brief description
- Expandable detail (click to show full output)

#### Token & Cost Statistics
- Daily/weekly/monthly token usage chart
- Model-based breakdown
- Cost trend

#### Task History
- Recent tasks completed by this agent
- Each task: Title, duration, result (success/failure), token cost

#### Memory Browser (Mini)
- View agent's memory files
- Search capability
- Editing (advanced)

### 2.4 Send Command to Agent (Quick Command)

Quick command panel for each agent:
```
┌──────────────────────────────────────────┐
│  Agent: [dev-agent ▼]                    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Write a unit test for the       │    │
│  │  auth middleware...              │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Priority: [Normal ▼]  [Send Command →]  │
└──────────────────────────────────────────┘
```

- Agent selector (dropdown)
- Multi-line command input (textarea)
- Priority level: Low / Normal / High / Critical
- Send button
- History of recently sent commands

### 2.5 Agent Create / Edit

Modal for creating new agents or editing existing ones:

**Configuration Fields:**
- Agent name and handle
- Model selection (dropdown)
- System prompt / Instructions
- Allowed tools (checklist)
- Memory configuration
- Skill assignments
- Cron triggers (optional)

---

## 3. Filtering & Sorting

### Filters
- Status: All / Active / Idle / Error / Offline
- Model: All models list
- Task status: Has Task / No Task

### Sorting
- Name (A-Z, Z-A)
- Cost (high → low)
- Token usage
- Last activity time
- Task count

---

## 4. State Management

```typescript
interface AgentsState {
  agents: Agent[];
  selectedAgent: Agent | null;
  viewMode: 'grid' | 'list';
  filters: {
    status: AgentStatus | 'all';
    model: string | 'all';
    hasTask: boolean | null;
  };
  sortBy: 'name' | 'cost' | 'tokens' | 'lastActivity' | 'taskCount';
  sortOrder: 'asc' | 'desc';
}

interface Agent {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  model: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  currentTask: TaskSummary | null;
  session: {
    id: string;
    type: 'dm' | 'group' | 'cron' | 'subagent';
    contextUsage: number; // percentage
    tokens: number;
    startedAt: Date;
  } | null;
  stats: {
    tokensToday: number;
    costToday: number;
    tasksDone: number;
    activitySparkline: number[];
  };
  config: {
    systemPrompt: string;
    allowedTools: string[];
    skills: string[];
    memory: MemoryConfig;
  };
  activities: AgentActivity[];
  taskHistory: TaskSummary[];
}
```

---

## 5. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Agent card click | Open agent detail drawer/sheet |
| "Send Command" click | Focus on command input field |
| Send command | Deliver to agent via WebSocket, show in activity feed |
| Grid/List toggle | Switch view mode |
| Filter change | Filter agent list |
| "Create Agent" | Open creation modal |
| Agent edit | Open config editing modal |
| Activity entry click | Expand detail (tool output, full reasoning, etc.) |

---

## 6. Real-time Updates

- **Agent Status**: Instant status updates via WebSocket subscription
- **Activity Feed**: Live streaming (for selected agent)
- **Token/Cost Counter**: Increment animation on each session update
- **Task Assignment**: Card update + notification when new task assigned to agent

---

## 7. Technical Components

```
src/
  components/
    agents/
      AgentCard.tsx
      AgentTable.tsx
      AgentDetail.tsx
      AgentActivityFeed.tsx
      AgentStats.tsx
      AgentMemoryBrowser.tsx
      QuickCommand.tsx
      AgentCreateModal.tsx
      AgentFilters.tsx
      AgentStatusBadge.tsx
  hooks/
    useAgents.ts
    useAgentDetail.ts
    useAgentActivity.ts
    useAgentCommand.ts
  pages/
    agents/
      page.tsx
      [agentId]/
        page.tsx
```
