# Feature Brief: Cron Jobs

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Cron Jobs page provides a visual interface for managing, monitoring, and creating scheduled tasks running on the OpenClaw Gateway. Users can view cron jobs on a visual timeline, create new jobs, edit existing ones, and review run history.

---

## 2. OpenClaw Cron System (Reference)

- A scheduler that lives inside the Gateway
- No separate job runner required
- 3 schedule types: `at` (one-time), `every` (interval), `cron` (standard expression)
- Job definitions stored on disk
- Run history kept in a separate file
- Isolated session (clean context) or main session (with conversation history) option
- Can deliver results directly to messaging channels

---

## 3. Page Sections

### 3.1 Summary Stat Cards

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 12 Total   │ │ 8 Active   │ │ 3 Running  │ │ 1 Failed   │
│ Cron Jobs  │ │ Scheduled  │ │ Right Now  │ │ Last 24h   │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### 3.2 Weekly Timeline View

Inspired by TenacitOS, a weekly timeline view:

```
        Mon     Tue     Wed     Thu     Fri     Sat     Sun
00:00   ─────── ─────── ─────── ─────── ─────── ─────── ───────
06:00   ░░░░░░░ ░░░░░░░ ░░░░░░░ ░░░░░░░ ░░░░░░░
08:00   ██ sync ██ sync ██ sync ██ sync ██ sync
09:00   ██ mail ██ mail ██ mail ██ mail ██ mail
12:00   ░░░░░░░ ░░░░░░░ ░░░░░░░ ░░░░░░░ ░░░░░░░
18:00   ██ rpt                          ██ rpt
00:00   ─────── ─────── ─────── ─────── ─────── ─────── ───────
```

- Horizontal axis: Days of the week
- Vertical axis: Hours (00:00 - 23:59)
- Colored blocks: Scheduled jobs (different color per job)
- Hover: Job name, schedule, last run status
- Click: Navigate to job detail
- Current time: Red horizontal line

### 3.3 Cron Jobs List

Table format showing all cron jobs:

| Column | Description |
|--------|-------------|
| Status | Badge: Active / Paused / Error |
| Job Name | Name + brief description |
| Schedule | Cron expression + human-readable translation |
| Agent | Assigned agent |
| Last Run | Last run time + status (✅/❌) |
| Next Run | Next run time (countdown) |
| Duration | Average run duration |
| Cost | Last run cost |
| Actions | Play/Pause/Edit/Delete/Run Now |

### 3.4 Cron Job Detail Panel

When a job is selected:

```
┌──────────────────────────────────────────────────────────┐
│  📋 daily-code-review                                    │
│  Schedule: 0 9 * * 1-5 (Weekdays at 9:00 AM)           │
│  Agent: dev-agent | Model: claude-sonnet                 │
│  Status: ● Active                                       │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Prompt/Instructions:                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Review all open PRs in the repo. Check for:       │  │
│  │ - Code quality issues                              │  │
│  │ - Security vulnerabilities                         │  │
│  │ - Test coverage gaps                               │  │
│  │ Send summary to #dev-updates Slack channel.        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Run History:                                            │
│  ┌──────────┬──────────┬────────┬───────┬──────┐        │
│  │ Time     │ Duration │ Status │ Tokens│ Cost │        │
│  ├──────────┼──────────┼────────┼───────┼──────┤        │
│  │ Today 09 │ 2m 34s   │ ✅     │ 8.4K  │$0.56 │        │
│  │ Yest. 09 │ 3m 12s   │ ✅     │ 9.1K  │$0.61 │        │
│  │ 2d ago   │ 1m 45s   │ ❌     │ 4.2K  │$0.28 │        │
│  └──────────┴──────────┴────────┴───────┴──────┘        │
│                                                          │
│  [Edit] [Pause] [Run Now] [Delete] [View Logs]          │
└──────────────────────────────────────────────────────────┘
```

### 3.5 Cron Job Create / Edit Modal

```
┌──────────────────────────────────────────────────────────┐
│  Create New Cron Job                              [X]    │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Job Name:    [daily-code-review          ]              │
│  Description: [Review PRs every morning   ]              │
│                                                          │
│  Schedule Type:                                          │
│  ○ Cron Expression  ● Interval  ○ One-time              │
│                                                          │
│  Every: [30] [minutes ▼]                                 │
│  - or -                                                  │
│  Cron: [0 9 * * 1-5]                                    │
│  Preview: "Every weekday at 9:00 AM"                     │
│                                                          │
│  Agent: [dev-agent ▼]                                    │
│  Model: [claude-sonnet-4-5-20250514 ▼]                             │
│  Session: ○ Isolated (Recommended)  ● Main Session       │
│                                                          │
│  Instructions/Prompt:                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  (Multi-line textarea)                             │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Notification Channel: [Slack: #dev-updates ▼]           │
│  Max Retries: [3]                                        │
│  Timeout: [5 minutes ▼]                                  │
│                                                          │
│  [Cancel]                              [Create Job →]    │
└──────────────────────────────────────────────────────────┘
```

#### Cron Expression Builder
Visual builder below the cron expression field:
- Minute, hour, day, month, day of week selectors
- Human-readable preview: "Every Monday through Friday at 9:00 AM"
- List next 5 run times

### 3.6 Run Now / Manual Trigger

- "Run Now" button for each job
- Confirmation dialog: "Run this job now?"
- Live progress display while running
- Notification on completion

---

## 4. State Management

```typescript
interface CronJobsState {
  jobs: CronJob[];
  selectedJob: CronJob | null;
  viewMode: 'timeline' | 'list';
  filters: {
    status: 'all' | 'active' | 'paused' | 'error';
    agent: string | 'all';
  };
  createModal: {
    isOpen: boolean;
    editingJob: CronJob | null; // null = create new
  };
  timelineWeek: Date; // Start of displayed week
}

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: {
    type: 'cron' | 'interval' | 'once';
    expression: string; // cron expression or interval
    humanReadable: string; // "Every weekday at 9:00 AM"
    nextRuns: Date[]; // Next 5 run times
  };
  agent: string; // agent ID
  model: string;
  sessionType: 'isolated' | 'main';
  prompt: string;
  config: {
    notificationChannel: string;
    maxRetries: number;
    timeout: number; // seconds
  };
  status: 'active' | 'paused' | 'error' | 'running';
  lastRun: CronRunResult | null;
  nextRun: Date | null;
  history: CronRunResult[];
  stats: {
    avgDuration: number;
    avgCost: number;
    successRate: number;
    totalRuns: number;
  };
}

interface CronRunResult {
  id: string;
  startedAt: Date;
  completedAt: Date;
  duration: number; // seconds
  status: 'success' | 'failure' | 'timeout' | 'cancelled';
  tokens: number;
  cost: number;
  output?: string;
  error?: string;
}
```

---

## 5. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Click block on timeline | Show job detail panel |
| Drag timeline | Change week |
| "Create Job" button | Open creation modal |
| "Run Now" | Confirmation → Run job immediately |
| "Pause/Resume" | Pause/resume job |
| "Edit" | Open editing modal |
| "Delete" | Danger confirmation → Delete job |
| Cron expression input | Update live preview |
| "View Logs" | Navigate to Logs page (filtered for this job) |

---

## 6. Technical Components

```
src/
  components/
    cron/
      CronStats.tsx
      CronTimeline.tsx
      CronJobList.tsx
      CronJobDetail.tsx
      CronJobForm.tsx
      CronExpressionBuilder.tsx
      CronRunHistory.tsx
      CronRunNowButton.tsx
  hooks/
    useCronJobs.ts
    useCronJobDetail.ts
    useCronExpressionParser.ts
  utils/
    cronParser.ts          // Cron expression → human readable
    cronNextRuns.ts        // Calculate next run times
  pages/
    cron/
      page.tsx
```
