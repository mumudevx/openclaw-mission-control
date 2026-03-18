"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Filter, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { useTaskStore } from "@/stores/taskStore";
import dynamic from "next/dynamic";

const TaskDetailSheet = dynamic(() => import("@/components/tasks/task-detail-sheet").then((m) => m.TaskDetailSheet));
const AddTaskSheet = dynamic(() => import("@/components/tasks/add-task-sheet").then((m) => m.AddTaskSheet));
const ConfirmDeleteDialog = dynamic(() => import("@/components/shared/confirm-delete-dialog").then((m) => m.ConfirmDeleteDialog));
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

function TaskCardContent({ task }: { task: Task }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--content-primary)] line-clamp-2">
          {task.title}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}
        >
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
        {task.dueDate && (
          <span suppressHydrationWarning>
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </>
  );
}

function SortableTaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-3 shadow-sm transition-shadow hover:shadow-card-hover ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-1">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded text-[var(--content-muted)] opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <TaskCardContent task={task} />
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="w-[280px] shrink-0">
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
            {tasks.length}
          </span>
        </div>
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--content-muted)] hover:bg-[var(--surface-bg)] transition-colors">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          className="min-h-[200px] space-y-2 rounded-xl bg-[var(--surface-bg)] p-2"
          data-column={column.id}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const { tasks, setTasks, moveTask, removeTask } = useTaskStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const findColumnForTask = useCallback(
    (taskId: string): TaskStatus | null => {
      const task = tasks.find((t) => t.id === taskId);
      return task?.status ?? null;
    },
    [tasks]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = findColumnForTask(activeId);
      const overColumn =
        findColumnForTask(overId) ??
        (columns.find((c) => c.id === overId)?.id ?? null);

      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      moveTask(activeId, overColumn);
    },
    [findColumnForTask, moveTask]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeColumn = findColumnForTask(activeId);
      const overColumn = findColumnForTask(overId);

      if (activeColumn && overColumn && activeColumn === overColumn) {
        const columnTasks = tasks.filter((t) => t.status === activeColumn);
        const otherTasks = tasks.filter((t) => t.status !== activeColumn);
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const newIndex = columnTasks.findIndex((t) => t.id === overId);

        const reordered = [...columnTasks];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        setTasks([...otherTasks, ...reordered]);
      }
    },
    [findColumnForTask, tasks, setTasks]
  );

  const handleEdit = (task: Task) => {
    setSelectedTask(null);
    setEditTask(task);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(null);
    setDeleteTask(task);
  };

  const confirmDelete = () => {
    if (deleteTask) {
      removeTask(deleteTask.id);
      toast.success("Task deleted");
      setDeleteTask(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Manage tasks with drag & drop Kanban board">
        <button
          onClick={() => setAddTaskOpen(true)}
          className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
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
            className="pl-9 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-4 text-sm text-[var(--content-secondary)] hover:bg-[var(--surface-bg)] transition-colors">
          <Filter className="h-4 w-4" strokeWidth={1.5} />
          Filter
        </button>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id
            );
            return (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onTaskClick={setSelectedTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-[260px] rounded-xl border border-[var(--accent-primary)] bg-[var(--surface-card)] p-3 shadow-card-lg opacity-90">
              <TaskCardContent task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddTaskSheet
        open={addTaskOpen || !!editTask}
        onOpenChange={(open) => {
          if (!open) {
            setAddTaskOpen(false);
            setEditTask(undefined);
          }
        }}
        task={editTask}
      />

      <ConfirmDeleteDialog
        open={!!deleteTask}
        onOpenChange={(open) => { if (!open) setDeleteTask(null); }}
        onConfirm={confirmDelete}
        entityName={deleteTask?.title ?? ""}
        entityType="task"
      />
    </div>
  );
}
