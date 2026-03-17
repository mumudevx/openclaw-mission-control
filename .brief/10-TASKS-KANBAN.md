# Feature Brief: Tasks (Kanban Board)

## Reference Files
- Design: [02-DESIGN-BRIEF.md](./02-DESIGN-BRIEF.md)
- Research: [01-RESEARCH-REFERENCES.md](./01-RESEARCH-REFERENCES.md)

---

## 1. Purpose

The Tasks page provides a central interface for managing all tasks in a Kanban board format. Users can create tasks, assign them to agents, track statuses, set priorities, and define deadlines. Agents can automatically pick up tasks or users can assign them manually.

---

## 2. Kanban Board Structure

### Board Columns (Flow Stages)

The most common 7-stage flow gathered from community research:

| Column | Description | Color |
|--------|-------------|-------|
| **Backlog** | Pending, unprioritized tasks | Gray |
| **Inbox** | Planned, awaiting assignment | Light Blue |
| **Assigned** | Assigned to agent, waiting to start | Blue |
| **In Progress** | Actively being worked on | Orange |
| **Testing** | In testing phase (optional) | Purple |
| **Review** | Awaiting review | Amber |
| **Done** | Completed | Green |

### Board Layout

```
┌─────────┬─────────┬─────────┬──────────┬─────────┬─────────┬─────────┐
│ Backlog │  Inbox  │Assigned │In Progress│ Testing │ Review  │  Done   │
│   (5)   │   (3)   │   (2)   │   (4)    │   (1)   │   (2)   │  (12)  │
├─────────┼─────────┼─────────┼──────────┼─────────┼─────────┼─────────┤
│┌───────┐│┌───────┐│┌───────┐│┌────────┐│┌───────┐│┌───────┐│┌───────┐│
││ Task  ││ │ Task  ││ │ Task  ││ │ Task   ││ │ Task  ││ │ Task  ││ │ Task  ││
││ Card  ││ │ Card  ││ │ Card  ││ │ Card   ││ │ Card  ││ │ Card  ││ │ Card  ││
│└───────┘│└───────┘│└───────┘│└────────┘│└───────┘│└───────┘│└───────┘│
│┌───────┐│┌───────┐│┌───────┐│┌────────┐│         │┌───────┐│┌───────┐│
││ Task  ││ │ Task  ││ │ Task  ││ │ Task   ││         ││ Task  ││ │ Task  ││
││ Card  ││ │ Card  ││ │ Card  ││ │ Card   ││         ││ Card  ││ │ Card  ││
│└───────┘│└───────┘│└───────┘│└────────┘│         │└───────┘│└───────┘│
│         │         │         │          │         │         │         │
│ [+ Add] │ [+ Add] │         │          │         │         │         │
└─────────┴─────────┴─────────┴──────────┴─────────┴─────────┴─────────┘
```

---

## 3. Task Card Design

### Compact Card (On Board)

```
┌─────────────────────────────────┐
│  🔴 High   #142                 │
│                                 │
│  Fix auth middleware bug        │
│                                 │
│  🤖 dev-agent    📅 Mar 20     │
│  💬 3 comments   🏷️ backend    │
│                                 │
│  ▓▓▓▓▓▓▓░░░ 70%               │
└─────────────────────────────────┘
```

Card elements:
- **Priority badge**: Color-coded (Critical: red, High: orange, Normal: blue, Low: gray)
- **Task ID**: #142
- **Title**: Brief task description (2 lines max)
- **Agent**: Assigned agent avatar + name
- **Deadline**: Date (red = overdue, orange = approaching)
- **Comment count**: 💬 icon + count
- **Labels**: Color-coded tags (backend, frontend, bug, feature, etc.)
- **Progress**: Progress bar (subtask completion ratio)

### Drag & Drop
- Cards can be dragged between columns
- Reorder within columns
- Target column highlights during drag
- Uses @dnd-kit or react-beautiful-dnd library

---

## 4. Task Detail View (Sheet/Modal)

Detailed view opened when clicking a card:

```
┌──────────────────────────────────────────────────────────┐
│  Fix auth middleware bug                          [X]    │
│  #142 | Created: Mar 15 | By: Muhsin                    │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Status: [In Progress ▼]   Priority: [🔴 High ▼]       │
│  Agent:  [dev-agent ▼]     Deadline: [Mar 20 📅]        │
│                                                          │
│  Labels: [backend] [bug] [auth] [+ Add]                  │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Description:                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ The JWT token validation in the auth middleware    │  │
│  │ fails when tokens contain special characters.     │  │
│  │ Need to update the validation logic and add       │  │
│  │ proper error handling.                            │  │
│  └────────────────────────────────────────────────────┘  │
│  [Edit Description]                                      │
│                                                          │
│  Agent Instructions:                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 1. Fix JWT validation in src/middleware/auth.ts    │  │
│  │ 2. Add unit tests for edge cases                  │  │
│  │ 3. Run existing test suite                        │  │
│  │ 4. Create a PR with the fix                       │  │
│  └────────────────────────────────────────────────────┘  │
│  [Edit Instructions]                                     │
│                                                          │
│  Sub-tasks:                                              │
│  ☑ Investigate the bug                                   │
│  ☑ Fix validation logic                                  │
│  ☐ Add unit tests                                        │
│  ☐ Run test suite                                        │
│  ☐ Create PR                                             │
│  [+ Add Sub-task]                                        │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Activity / Comments:                                    │
│                                                          │
│  🤖 dev-agent (2 hours ago):                            │
│  Found the issue in jwt.verify(). The special chars      │
│  in the payload aren't being escaped. Fixing now.        │
│                                                          │
│  👤 Muhsin (1 hour ago):                                │
│  Make sure to also check the refresh token flow.         │
│                                                          │
│  🤖 dev-agent (30 min ago):                             │
│  Fixed. Updated both access and refresh token            │
│  validation. Running tests now.                          │
│                                                          │
│  [Write a comment...]                            [Send]  │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Execution Details:                                      │
│  Tokens Used: 15,420    Cost: $1.03                     │
│  Duration: 1h 45m       Agent Sessions: 3                │
│                                                          │
│  [View Logs] [Assign to Agent] [Start Now] [Delete]      │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Task Creation

### Quick Create (In-Column)
Click the "+ Add" button at the bottom of a column:
```
┌─────────────────────────────────┐
│  [Task title...            ]    │
│  [Enter to create, Esc cancel]  │
└─────────────────────────────────┘
```

### Detailed Create (Modal)
Via "+ New Task" button or to add details after quick creation:

```
┌──────────────────────────────────────────────────────────┐
│  New Task                                         [X]    │
│──────────────────────────────────────────────────────────│
│                                                          │
│  Title:       [                              ]           │
│  Description: [                              ]           │
│                                                          │
│  Status:   [Backlog ▼]    Priority: [Normal ▼]          │
│  Agent:    [Select... ▼]  Deadline: [Select date 📅]    │
│  Board:    [Default ▼]                                   │
│                                                          │
│  Labels:   [+ Add Label]                                 │
│                                                          │
│  Agent Instructions:                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ (What should the agent do for this task?)         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Sub-tasks:                                              │
│  ☐ [                              ] [+ Add]              │
│                                                          │
│  ☐ Auto-assign to available agent                        │
│  ☐ Start immediately when assigned                       │
│                                                          │
│  [Cancel]                              [Create Task →]   │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Board Management

### Multiple Board Support
- Users can create multiple boards (e.g., "Development", "Operations", "Personal")
- Board selector: Tabs or dropdown

### Board Settings
- Add/remove/rename columns
- Change column order
- WIP (Work In Progress) limits: Max card count per column
- Automations: "Auto-send to agent when moved to Assigned column"

### Filters and Search

```
┌──────────────────────────────────────────────────────────┐
│  🔍 [Search tasks...]  Agent: [All ▼]  Priority: [All ▼]│
│  Labels: [backend ×] [bug ×]  [Clear Filters]           │
└──────────────────────────────────────────────────────────┘
```

- Text search: Within titles and descriptions
- Agent filter: Tasks assigned to a specific agent
- Priority filter: Critical / High / Normal / Low
- Label filter: Selected tags
- Deadline filter: Overdue / Today / This Week / No Deadline

---

## 7. Agent Integration

### Auto-Assignment
- Agents can automatically pick up suitable tasks (configurable)
- Skill-based matching: Suggest suitable tasks based on agent skills

### Instant Start
- "Start Now" button: Instantly delivers the task to the assigned agent via WebSocket
- Card automatically moves to "In Progress" when agent accepts the task
- Live progress: Progress updates on the card as the agent works

### Result Reporting
- When agent completes a task:
  - Card automatically moves to "Review" or "Done"
  - Execution details added (tokens, cost, duration)
  - Result output added as a comment

---

## 8. State Management

```typescript
interface TasksState {
  boards: Board[];
  activeBoard: string;
  tasks: Task[];
  filters: {
    search: string;
    agent: string | 'all';
    priority: Priority | 'all';
    labels: string[];
    deadline: 'all' | 'overdue' | 'today' | 'this-week' | 'no-deadline';
  };
  dragState: {
    isDragging: boolean;
    taskId: string | null;
    sourceColumn: string | null;
    targetColumn: string | null;
  };
  selectedTask: Task | null;
  createModal: {
    isOpen: boolean;
    prefillColumn?: string;
  };
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
  settings: {
    wipLimits: Record<string, number>;
    automations: BoardAutomation[];
  };
}

interface Column {
  id: string;
  name: string;
  order: number;
  color: string;
  wipLimit?: number;
}

interface Task {
  id: string;
  boardId: string;
  columnId: string;
  order: number; // position within column
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  agentId: string | null;
  agentInstructions: string;
  labels: Label[];
  deadline: Date | null;
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  execution: {
    status: 'pending' | 'running' | 'completed' | 'failed';
    tokens: number;
    cost: number;
    duration: number;
    sessions: number;
    output: string;
  } | null;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: {
    type: 'user' | 'agent';
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
}

interface Label {
  id: string;
  name: string;
  color: string;
}
```

---

## 9. User Interactions

| Interaction | Behavior |
|-------------|----------|
| Card drag (between columns) | Change task status |
| Card drag (within column) | Change order |
| Card click | Open detail sheet/modal |
| "+ Add" (column bottom) | Quick task creation |
| "+ New Task" (top bar) | Detailed creation modal |
| "Start Now" | Instantly send task to agent |
| Write comment | Add comment (agent or user) |
| Sub-task toggle | Complete/undo subtask |
| Filter change | Filter the board |
| Board tab change | Switch active board |
| "Assign to Agent" | Agent selection dropdown → assign |

---

## 10. Performance Requirements

- **Drag & Drop**: 60fps smooth dragging
- **Virtualized Columns**: Virtualization for columns with 100+ tasks
- **Optimistic Updates**: Instant UI update on drag completion, background API call
- **Real-time Sync**: Multi-tab/user support (WebSocket)

---

## 11. Technical Components

```
src/
  components/
    tasks/
      KanbanBoard.tsx
      KanbanColumn.tsx
      TaskCard.tsx
      TaskDetail.tsx
      TaskForm.tsx
      TaskComments.tsx
      TaskSubtasks.tsx
      TaskFilters.tsx
      BoardTabs.tsx
      BoardSettings.tsx
      QuickCreateInput.tsx
  hooks/
    useTasks.ts
    useTaskDetail.ts
    useTaskDragDrop.ts
    useBoards.ts
  pages/
    tasks/
      page.tsx
```
