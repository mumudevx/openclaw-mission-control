"use client";

import type { Task } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";

const statusToBadge: Record<string, "active" | "idle" | "neutral" | "running" | "error"> = {
  in_progress: "active",
  assigned: "running",
  review: "idle",
  testing: "running",
  done: "neutral",
  backlog: "neutral",
  inbox: "neutral",
};

interface RecentTasksListProps {
  tasks: Task[];
}

export function RecentTasksList({ tasks }: RecentTasksListProps) {
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between rounded-xl border border-[var(--border-default)] px-4 py-3 transition-colors hover:bg-[var(--surface-card-alt)]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--content-primary)]">
              {task.title}
            </p>
            <p className="mt-0.5 text-xs text-[var(--content-muted)]">
              {task.assigneeId ? `Assigned` : "Unassigned"}
              {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
            </p>
          </div>
          <StatusBadge
            status={statusToBadge[task.status] || "neutral"}
            label={task.status.replace("_", " ")}
          />
        </li>
      ))}
    </ul>
  );
}
