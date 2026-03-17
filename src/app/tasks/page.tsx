"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { mockTasks } from "@/lib/mock/data";
import type { Task, TaskStatus } from "@/types";

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "#9B9B9B" },
  { id: "inbox", label: "Inbox", color: "#4285F4" },
  { id: "assigned", label: "Assigned", color: "#FBBC04" },
  { id: "in_progress", label: "In Progress", color: "#E8654A" },
  { id: "testing", label: "Testing", color: "#34A853" },
  { id: "review", label: "Review", color: "#8B5CF6" },
  { id: "done", label: "Done", color: "#6B6B6B" },
];

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-white p-3 shadow-sm transition-shadow hover:shadow-card-hover cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--content-primary)] line-clamp-2">
          {task.title}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        {task.labels.map((label) => (
          <span
            key={label}
            className="inline-flex rounded-full bg-[var(--surface-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--content-secondary)]"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--content-muted)]">
        <span>{task.assigneeId ? "Assigned" : "Unassigned"}</span>
        {task.dueDate && <span suppressHydrationWarning>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const tasks = mockTasks;

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage tasks with drag & drop Kanban board">
        <button className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Task
        </button>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" strokeWidth={1.5} />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[var(--border-default)] bg-white"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-4 text-sm text-[var(--content-secondary)] hover:bg-[var(--surface-bg)] transition-colors">
          <Filter className="h-4 w-4" strokeWidth={1.5} />
          Filter
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          return (
            <div key={column.id} className="w-[280px] shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="text-sm font-semibold text-[var(--content-primary)]">
                    {column.label}
                  </span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--surface-bg)] px-1.5 text-[11px] font-medium text-[var(--content-muted)]">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--content-muted)] hover:bg-[var(--surface-bg)] transition-colors">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="min-h-[200px] space-y-2 rounded-xl bg-[var(--surface-bg)] p-2">
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
