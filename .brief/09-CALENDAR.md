# Feature Brief: Calendar

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Calendar page consolidates all scheduled events, cron job runs, task deadlines, and user-created reminders into a single calendar view. Users can assign future tasks to agents, plan ahead, and manage timelines from this page.

---

## 2. Page Sections

### 2.1 Calendar View Modes

3 different view modes:
- **Month**: Traditional calendar grid (default)
- **Week**: Detailed 7-day view
- **Day**: Hourly detail view for a single day

Toggle buttons: `[Month] [Week] [Day]` (pill-shape toggle group)

### 2.2 Calendar Header

```
┌──────────────────────────────────────────────────────────┐
│  ← March 2026 →    [Month] [Week] [Day]   [+ New Event] │
│                                            [Today]       │
└──────────────────────────────────────────────────────────┘
```

- Month/week navigation: Left/right arrows
- "Today" button: Quick return to today
- "+ New Event" button: Create new event/task

### 2.3 Month View

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  1  │  2  │  3  │  4  │  5  │  6  │  7  │
│     │ 🔄  │     │     │ 📋  │     │     │
│     │cron │     │     │task │     │     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │
│ 🔄  │ 🔄  │ 🔄  │ 🔄  │ 🔄  │     │     │
│ 📋  │     │     │ ⏰  │     │     │     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│ ...                                       │
└───────────────────────────────────────────┘
```

Each day cell:
- Day number
- Event dots or mini badges for that day
- Color coding: Cron (blue), Task deadline (orange), User event (green), Agent task (purple)
- Click: Navigate to that day's daily view
- "+": Add new event to that day

### 2.4 Week View

```
         Mon 16    Tue 17    Wed 18    Thu 19    Fri 20
08:00    ┌────────┐
         │ Daily  │
09:00    │ Sync   │ ┌────────┐
         └────────┘ │Code    │
10:00               │Review  │
                    └────────┘
11:00
12:00    ┌────────────────────────────────────────────┐
         │ Weekly Report Generation (cron)            │
13:00    └────────────────────────────────────────────┘
...
18:00                          ┌────────┐
                               │Deploy  │
19:00                          │Task    │
                               └────────┘
```

- Vertical axis: Hours
- Horizontal axis: Days
- Colored blocks: Events (height based on duration)
- Drag & resize: Move events and change duration
- Current time: Red horizontal line

### 2.5 Day View

```
Thursday, March 19, 2026

08:00  ┌─────────────────────────────────────────┐
       │  🔄 Daily Code Review                    │
       │  Agent: dev-agent | Cron: 0 9 * * 1-5   │
09:00  └─────────────────────────────────────────┘

09:30  ┌─────────────────────────────────────────┐
       │  📋 Sprint Planning Task                 │
       │  Agent: pm-agent | Priority: High        │
10:30  └─────────────────────────────────────────┘

12:00  ┌─────────────────────────────────────────┐
       │  🔄 Weekly Report Gen                    │
       │  Agent: data-agent | Cron: 0 12 * * 4   │
13:00  └─────────────────────────────────────────┘

14:00  ┌─────────────────────────────────────────┐
       │  ⏰ Reminder: Review deployment results  │
       │  Note: Check staging metrics             │
15:00  └─────────────────────────────────────────┘

18:00  ┌─────────────────────────────────────────┐
       │  📋 Deploy to Production                 │
       │  Agent: ops-agent | Deadline             │
19:00  └─────────────────────────────────────────┘
```

Detailed hourly view:
- Each event block is clickable → Detail panel
- Click empty hours to create new events
- Right side or bottom: Summary list for the day

### 2.6 Event Types and Color Codes

| Type | Color | Icon | Description |
|------|-------|------|-------------|
| **Cron Job** | Blue (#4285F4) | 🔄 | Automatically scheduled jobs |
| **Task Deadline** | Orange (#E8654A) | 📋 | Kanban task deadlines |
| **User Event** | Green (#34A853) | ⏰ | User-created reminders |
| **Agent Task** | Purple (#7B1FA2) | 🤖 | Scheduled tasks assigned to agents |
| **Milestone** | Gold (#FFB300) | 🏁 | Project milestones |

### 2.7 Event Create / Edit Modal

```
┌──────────────────────────────────────────────────────────┐
│  New Event                                        [X]    │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Title:  [Deploy v2.1 to staging        ]                │
│                                                          │
│  Type:   ○ Reminder  ● Agent Task  ○ Milestone           │
│                                                          │
│  Date:   [March 19, 2026]  Time: [18:00]                │
│  End:    [March 19, 2026]  Time: [19:00]                │
│                                                          │
│  ☐ All Day Event                                         │
│  ☐ Recurring  [Configure...]                             │
│                                                          │
│  --- Agent Task Options ---                              │
│  Agent:  [ops-agent ▼]                                   │
│  Priority: [High ▼]                                      │
│                                                          │
│  Instructions:                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Deploy the latest build to staging environment.   │  │
│  │ Run smoke tests. Report results to Slack.         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Notification: [30 min before ▼]                         │
│  Color: [● Auto]  [● Blue]  [● Orange]  [● Green]       │
│                                                          │
│  Notes:                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (Optional notes)                                  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [Cancel]                              [Create Event →]  │
└──────────────────────────────────────────────────────────┘
```

**Agent Task** type:
- Automatically sends task to agent at the specified time
- Marked as "completed" on the calendar when done
- Result and cost info added to event details

**Recurring:**
- Daily / Weekly / Monthly / Custom cron expression
- End date or repeat count

### 2.8 Sidebar: Mini Calendar + Upcoming Events

```
┌──────────────────┐
│   March 2026     │
│ Mo Tu We Th Fr   │
│        1  2  3   │
│  4  5  6  7  8   │
│  9 10 11 12 13   │
│ 14 15 [16] 17 18 │
│ 21 22 23 24 25   │
│ 28 29 30 31      │
│──────────────────│
│  Upcoming:       │
│  • 09:00 Daily   │
│    Code Review   │
│  • 12:00 Weekly  │
│    Report        │
│  • 18:00 Deploy  │
│    to staging    │
└──────────────────┘
```

---

## 3. Cron Jobs Integration

- All active cron jobs from the Cron Jobs page automatically appear on the calendar
- Clicking a cron job block opens the Cron Jobs detail panel
- Cron jobs are not editable here (edit from the Cron page), only viewable
- Distinguished from other events by color code and icon

---

## 4. Tasks Integration

- Task deadlines from the Kanban board are shown on the calendar
- Clicking a task block shows task details
- Drag & drop to change task deadlines on the calendar → Also updates Kanban

---

## 5. State Management

```typescript
interface CalendarState {
  viewMode: 'month' | 'week' | 'day';
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  filters: {
    types: EventType[]; // which types to show
    agents: string[]; // which agents' events
  };
  createModal: {
    isOpen: boolean;
    prefillDate?: Date;
    editingEvent?: CalendarEvent;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'cron' | 'task-deadline' | 'user-event' | 'agent-task' | 'milestone';
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    cronExpression?: string;
    endDate?: Date;
    count?: number;
  };
  agentConfig?: {
    agentId: string;
    priority: 'low' | 'normal' | 'high' | 'critical';
    instructions: string;
  };
  notification?: {
    before: number; // minutes
    channel: string;
  };
  color: string;
  notes: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  linkedCronId?: string; // cron job reference
  linkedTaskId?: string; // kanban task reference
  result?: {
    completedAt: Date;
    tokens: number;
    cost: number;
    output: string;
  };
}
```

---

## 6. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Day cell click (month) | Switch to that day's daily view |
| Empty hour click (week/day) | Create new event modal for that time |
| Event block click | Event detail panel |
| Event block drag | Move event (change date/time) |
| Event block resize | Change duration |
| "+ New Event" button | Creation modal |
| Filter chips | Filter event types |
| View mode change | Month ↔ Week ↔ Day |
| "Today" button | Return to today |

---

## 7. Technical Components

```
src/
  components/
    calendar/
      CalendarHeader.tsx
      MonthView.tsx
      WeekView.tsx
      DayView.tsx
      CalendarEvent.tsx
      EventDetail.tsx
      EventForm.tsx
      MiniCalendar.tsx
      UpcomingEvents.tsx
      CalendarFilters.tsx
  hooks/
    useCalendar.ts
    useCalendarEvents.ts
    useEventDragDrop.ts
  utils/
    calendarHelpers.ts    // Date calculations
    eventColors.ts        // Color coding logic
  pages/
    calendar/
      page.tsx
```
