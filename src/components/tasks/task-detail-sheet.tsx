"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentStore } from "@/stores/agentStore";
import type { Task } from "@/types";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

const statusToVariant: Record<string, "active" | "idle" | "neutral" | "error"> = {
  backlog: "neutral",
  inbox: "neutral",
  assigned: "idle",
  in_progress: "active",
  testing: "active",
  review: "idle",
  done: "neutral",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  inbox: "Inbox",
  assigned: "Assigned",
  in_progress: "In Progress",
  testing: "Testing",
  review: "Review",
  done: "Done",
};

export function TaskDetailSheet({ task, open, onOpenChange, onEdit, onDelete }: TaskDetailSheetProps) {
  const { agents } = useAgentStore();
  const getAgentName = (agentId?: string) =>
    agentId ? agents.find((a) => a.id === agentId)?.name ?? agentId : null;

  if (!task) return null;

  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const agentName = getAgentName(task.assigneeId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[var(--sheet-width)] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <SheetDescription className="sr-only">
          Task details for {task.title}
        </SheetDescription>

        {/* Header */}
        <div className="border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={statusToVariant[task.status] || "neutral"} label={statusLabels[task.status]} />
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-[var(--surface-bg)] hover:text-[var(--content-primary)] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[var(--content-primary)]">
            {task.title}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          {task.description && (
            <div className="border-b border-[var(--border-divider)] px-5 py-4">
              <h3 className="text-xs font-medium uppercase text-[var(--content-muted)] mb-2">
                Description
              </h3>
              <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="border-b border-[var(--border-divider)] px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium uppercase text-[var(--content-muted)]">
                  Subtasks
                </h3>
                <span className="text-xs text-[var(--content-muted)]">
                  {completedCount}/{task.subtasks.length}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-[var(--surface-bg)] mb-3">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all"
                  style={{
                    width: `${(completedCount / task.subtasks.length) * 100}%`,
                  }}
                />
              </div>
              <ul className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center gap-2.5">
                    {subtask.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--status-success)]" strokeWidth={1.5} />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-[var(--content-muted)]" strokeWidth={1.5} />
                    )}
                    <span
                      className={`text-sm ${
                        subtask.completed
                          ? "text-[var(--content-muted)] line-through"
                          : "text-[var(--content-primary)]"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta */}
          <div className="px-5 py-4 space-y-3">
            <h3 className="text-xs font-medium uppercase text-[var(--content-muted)] mb-3">
              Details
            </h3>

            {agentName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[var(--content-muted)]" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] text-[var(--content-muted)]">Assignee</p>
                  <p className="text-sm text-[var(--content-primary)]">{agentName}</p>
                </div>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-[var(--content-muted)]" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] text-[var(--content-muted)]">Due Date</p>
                  <p className="text-sm text-[var(--content-primary)]">
                    {format(new Date(task.dueDate), "MMM d, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-[var(--content-muted)]" strokeWidth={1.5} />
              <div>
                <p className="text-[11px] text-[var(--content-muted)]">Created</p>
                <p className="text-sm text-[var(--content-primary)]">
                  {format(new Date(task.createdAt), "MMM d, yyyy 'at' HH:mm")}
                </p>
              </div>
            </div>

            {task.labels.length > 0 && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 shrink-0 text-[var(--content-muted)]" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] text-[var(--content-muted)] mb-1">Labels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex rounded-full bg-[var(--surface-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--content-secondary)]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
