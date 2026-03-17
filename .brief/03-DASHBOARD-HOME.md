# Feature Brief: Dashboard Home (Overview)

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Dashboard home page provides a bird's-eye view of the entire OpenClaw system. Every time the user lands on this page, they should be able to see agent statuses, active tasks, gateway health, costs, and recent activities at a glance.

---

## 2. Sections and Components

### 2.1 Top Bar
- **Left**: Logo + "Mission Control" title
- **Center**: Global search (Command palette trigger - Cmd+K)
- **Right**: Notification icon (with badge count), user avatar + name, quick settings

### 2.2 Welcome & Date Section
Similar to the reference's "Tue, 19 December" + "Show my Tasks" button:
- Today's date (day name, day, month)
- "Show my Tasks" → Redirect button to Tasks page (pill shape, accent color)
- Calendar icon → Shortcut to Calendar page
- Right side: Welcome message (optional) or quick command input

### 2.3 Summary Stat Cards (Stat Cards Row)
Top row with 4-5 small cards, each displaying a key metric:

| Card | Metric | Icon | Detail |
|------|--------|------|--------|
| **Active Agents** | Count (e.g., 5/8) | Bot | Running/total ratio, mini donut |
| **Active Tasks** | Count (e.g., 12) | CheckSquare | Status distribution mini bar |
| **Gateway Status** | Status badge | Radio | Uptime percentage, last ping time |
| **Today's Cost** | Currency (e.g., $4.32) | DollarSign | Trend (vs yesterday), sparkline |
| **Cron Jobs** | Running/Total | Clock | Next run time |

Each card:
- Top: Icon (inside accent-light circle) + mini trend arrow
- Center: Large number (28-36px, bold)
- Bottom: Label + brief description or sparkline mini chart
- Clickable: Navigates to relevant detail page

### 2.4 Performance Charts Row

#### 2.4.1 Token Usage / Cost Chart (Left)
Similar to the reference's "Annual profits" chart:
- Time series area/bar chart (Recharts)
- Filter: Last 7 days / 30 days / This month (dropdown)
- Model-based breakdown (stacked bar with different colors)
- Tooltip with detailed info
- Y-axis: Token count or $ cost
- X-axis: Date

#### 2.4.2 Agent Activity Summary (Right)
Similar to the reference's "Activity manager" section:
- Last 24-hour activity summary
- Filter chips: "Team", "Insights", "Today" (like the reference)
- Search bar: "Search in activities..."
- Recent activities list (compact format):
  - Agent name + avatar
  - Action description
  - Timestamp
  - Status badge

### 2.5 Lower Section Cards

#### 2.5.1 Recent Tasks Summary
- Last 5 tasks, compact Kanban-mini view
- Each task: Title, assigned agent, status badge, duration
- "View All" → Link to Tasks page

#### 2.5.2 Gateway Health Panel
Similar to the reference's "System Lock" and donut gauge:
- Gateway uptime gauge (donut chart, percentage in center)
- Connected channels list (with Telegram, Slack, Discord icons)
- Recent error count
- Memory/CPU usage mini gauges

#### 2.5.3 Upcoming Cron Jobs
- Next 5 cron jobs to run
- Each: Name, schedule expression, next run time, last status badge
- "View All" → Link to Cron Jobs page

#### 2.5.4 Quick Command / Agent Task Assignment
- Similar to the reference's "Hey, Need help? Just ask me anything!" section
- Text input field: Send instant command to an agent
- Agent selector dropdown: Which agent to send to
- "Send" button
- Mini history of recently sent commands

---

## 3. Data Sources

### WebSocket (Real-time)
- Agent statuses (active, idle, error, offline)
- Active task counts and status changes
- Gateway heartbeat and status
- Live activity feed

### REST API (Periodic)
- Cost data (every 5 min)
- Token usage statistics
- Cron job schedule info
- Historical performance data

---

## 4. State Management

```typescript
interface DashboardState {
  // Stat Cards
  activeAgents: { running: number; total: number };
  activeTasks: { count: number; byStatus: Record<TaskStatus, number> };
  gatewayStatus: {
    status: 'online' | 'offline' | 'degraded';
    uptime: number; // percentage
    lastPing: number; // ms
    channels: ChannelInfo[];
  };
  todayCost: {
    amount: number;
    trend: number; // percentage change
    sparkline: number[]; // last 7 days
  };
  cronJobs: {
    running: number;
    total: number;
    nextRun: CronJobSummary;
  };

  // Charts
  costHistory: CostDataPoint[];
  tokenUsage: TokenUsageDataPoint[];

  // Activity
  recentActivities: Activity[];
  recentTasks: TaskSummary[];
  upcomingCrons: CronJobSummary[];

  // Quick Command
  selectedAgent: string | null;
  commandHistory: CommandEntry[];
}
```

---

## 5. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Stat Card click | Navigate to relevant detail page |
| Chart time filter change | Re-fetch data and update chart |
| Activity chip filter | Filter activities (Team/Agent/Cron) |
| Activity search | Text-based activity search |
| Quick Command send | Send command to selected agent via WebSocket |
| Notification icon | Open notification panel (Sheet/Drawer) |
| Cmd+K | Open command palette (global search + quick navigation) |

---

## 6. Responsive Behavior

- **Desktop**: 4 stat cards side by side, 2-column chart row, 3-4 column lower cards
- **Tablet**: 2 stat cards per row, charts stacked, 2-column lower cards
- **Mobile**: 1 stat card per row (horizontal scroll), full-width charts, stacked lower cards

---

## 7. Performance Requirements

- Initial load: < 2 seconds (show skeleton loading)
- WebSocket message processing: < 100ms
- Chart render: Lazy load, render when visible
- Stat updates: Smooth number transition animation
- Activity feed: Virtualized list (for 100+ items)

---

## 8. Technical Components

```
src/
  components/
    dashboard/
      StatCard.tsx
      CostChart.tsx
      ActivityFeed.tsx
      GatewayHealthPanel.tsx
      UpcomingCrons.tsx
      QuickCommand.tsx
      RecentTasks.tsx
      WelcomeBar.tsx
  hooks/
    useDashboardStats.ts
    useActivityFeed.ts
    useCostData.ts
  pages/
    dashboard/
      page.tsx
      layout.tsx
```
