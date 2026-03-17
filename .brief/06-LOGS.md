# Feature Brief: Logs

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Logs page aggregates all events, agent actions, gateway messages, and error records from the entire OpenClaw system into a central, searchable, and filterable interface. It is a critical tool for debugging, performance monitoring, and auditing.

---

## 2. Page Sections

### 2.1 Log Search and Filter Bar

Sticky search/filter bar at the top of the page:

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 [Search logs...                    ]  [Filters ▼]       │
│                                                              │
│  Level: [All] [Info] [Warn] [Error] [Debug]                 │
│  Source: [All ▼]  Agent: [All ▼]  Time: [Last 1h ▼]        │
│                                                              │
│  ☐ Auto-scroll   ☐ Show timestamps   [Export ↓]  [Clear]    │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Log Level Filters (Chip/Tag Buttons)

| Level | Color | Usage |
|-------|-------|-------|
| **DEBUG** | Gray (#9B9B9B) | Detailed technical info |
| **INFO** | Blue (#4285F4) | Normal operation messages |
| **WARN** | Amber (#FBBC04) | Warnings, potential issues |
| **ERROR** | Red (#EA4335) | Errors, failed operations |
| **CRITICAL** | Dark Red (#B71C1C) | System-level critical errors |

### 2.3 Log Source Filters

| Source | Description |
|--------|-------------|
| Gateway | Gateway daemon messages |
| Agent | Agent activity and action logs |
| Cron | Cron job execution logs |
| Channel | Messaging channel logs |
| System | System resources and performance logs |
| Security | Authentication, authorization logs |

### 2.4 Log List (Main Content)

Terminal-like appearance with monospace font:

```
┌──────────────────────────────────────────────────────────────┐
│ 14:32:15.234  INFO   [agent:dev-agent]  Task started: PR... │
│ 14:32:15.456  DEBUG  [agent:dev-agent]  Tool call: file_... │
│ 14:32:16.012  INFO   [gateway]          Heartbeat OK (12ms) │
│ 14:32:17.891  WARN   [cron:daily-sync]  Retry attempt 2/3   │
│ 14:32:18.234  ERROR  [agent:qa-agent]   Tool failed: bash... │
│ 14:32:18.234  ├── Stack trace:                               │
│               │   at processCommand (/src/handler.ts:42)     │
│               │   at Agent.run (/src/agent.ts:128)           │
│               └── Exit code: 1                               │
└──────────────────────────────────────────────────────────────┘
```

Each log entry:
- **Timestamp**: HH:mm:ss.SSS format, monospace
- **Level badge**: Colored pill badge
- **Source**: [source:identifier] format
- **Message**: Brief description
- **Expand**: Click to show full detail (stack trace, payload, context)

### 2.5 Log Detail Panel (Expanded View)

When clicking a log entry:

```
┌──────────────────────────────────────────────────────────────┐
│  ❌ ERROR  |  14:32:18.234  |  agent:qa-agent               │
│──────────────────────────────────────────────────────────────│
│                                                              │
│  Message: Tool execution failed: bash("npm test")            │
│                                                              │
│  Context:                                                    │
│    Session: ses_abc123                                       │
│    Task: #142 - Unit test implementation                     │
│    Agent: qa-agent (claude-sonnet-4-5-20250514)                        │
│    Duration: 3.2s                                            │
│                                                              │
│  Stack Trace:                                                │
│    at processCommand (/src/handler.ts:42)                    │
│    at Agent.run (/src/agent.ts:128)                          │
│    at TaskRunner.execute (/src/runner.ts:67)                 │
│                                                              │
│  Output:                                                     │
│  ┌────────────────────────────────────────────────┐          │
│  │  FAIL src/auth.test.ts                          │          │
│  │  ● should validate token expiry                │          │
│  │    Expected: true                              │          │
│  │    Received: false                             │          │
│  └────────────────────────────────────────────────┘          │
│                                                              │
│  [Copy Log] [View Agent] [View Task] [Report Issue]          │
└──────────────────────────────────────────────────────────────┘
```

### 2.6 Log Statistics Sidebar (Optional)

Small panel on the right side or top:
- Log distribution for the last hour (bar chart: Info/Warn/Error)
- Error rate trend (sparkline)
- Top log-producing agent/source
- Last critical error summary

---

## 3. Advanced Features

### 3.1 Real-time Streaming
- Live log stream via WebSocket
- Auto-scroll toggle: Automatically scrolls when new logs arrive
- Pause/Resume: Temporarily pause live stream
- New log badge: Show "X new logs" when paused

### 3.2 Search
- Full-text search: Search within log messages
- Regex support: Advanced pattern matching
- Highlight: Highlight found terms
- Search history: Recent searches in dropdown

### 3.3 Export
- Export in JSON format
- Export in CSV format
- Time range selection
- Export with filters applied

### 3.4 Log Bookmarking
- Bookmark important log entries
- View bookmarked logs in a separate tab
- Add notes

### 3.5 Log Correlation
- Group logs by session
- Group logs by task
- Timeline view: Show all related logs in chronological order

---

## 4. State Management

```typescript
interface LogsState {
  entries: LogEntry[];
  filters: {
    search: string;
    levels: LogLevel[];
    sources: LogSource[];
    agentId: string | null;
    timeRange: TimeRange;
  };
  isStreaming: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  selectedEntry: LogEntry | null;
  bookmarkedIds: Set<string>;
  stats: {
    countByLevel: Record<LogLevel, number>;
    errorRate: number[];
    topSources: { source: string; count: number }[];
  };
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  source: LogSource;
  sourceId: string; // agent id, cron job id, etc.
  message: string;
  context?: {
    sessionId?: string;
    taskId?: string;
    agentId?: string;
    model?: string;
    duration?: number;
  };
  stackTrace?: string;
  output?: string;
  metadata?: Record<string, any>;
}
```

---

## 5. Performance Requirements

- **Virtualized List**: Use react-window or tanstack-virtual for performant rendering of thousands of logs
- **Buffer Management**: Keep a maximum of 10,000 log entries in memory, discard older ones
- **Lazy Loading**: Fetch historical logs when scrolling up
- **Debounced Search**: 300ms debounce on search input
- **WebSocket Throttle**: Batch updates during heavy log flow (100ms interval)

---

## 6. Technical Components

```
src/
  components/
    logs/
      LogSearch.tsx
      LogFilters.tsx
      LogList.tsx
      LogEntry.tsx
      LogDetail.tsx
      LogStats.tsx
      LogExport.tsx
  hooks/
    useLogs.ts
    useLogStream.ts
    useLogSearch.ts
  pages/
    logs/
      page.tsx
```
