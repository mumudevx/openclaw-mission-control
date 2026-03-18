"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardList, Pencil, Plus, Trash2, Bot } from "lucide-react";
import { toast } from "sonner";
import { useNotificationStore } from "@/stores/notificationStore";
import { useTaskStore } from "@/stores/taskStore";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { mockAgents } from "@/lib/mock/data";
import type { Task } from "@/types";

const addTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["backlog", "inbox", "assigned", "in_progress", "testing", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  labels: z.string().optional(),
  subtasks: z.array(z.object({ title: z.string().min(1, "Subtask title is required") })),
});

type AddTaskFormValues = z.infer<typeof addTaskSchema>;

interface AddTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

export function AddTaskSheet({ open, onOpenChange, task }: AddTaskSheetProps) {
  const isEditing = !!task;

  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "inbox",
      priority: "medium",
      assigneeId: "",
      dueDate: "",
      labels: "",
      subtasks: [],
    },
  });

  const {
    fields: subtaskFields,
    append: appendSubtask,
    remove: removeSubtask,
  } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  useEffect(() => {
    if (task && open) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        labels: task.labels.join(", "),
        subtasks: task.subtasks.map((st) => ({ title: st.title })),
      });
    }
  }, [task, open, form]);

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  }

  function onSubmit(values: AddTaskFormValues) {
    const now = new Date().toISOString();
    const labels = values.labels
      ? values.labels.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const subtasks = values.subtasks.map((st) => ({
      id: `st-${crypto.randomUUID().slice(0, 8)}`,
      title: st.title,
      completed: false,
    }));

    if (isEditing) {
      useTaskStore.getState().updateTask(task.id, {
        title: values.title,
        description: values.description || "",
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId || undefined,
        dueDate: values.dueDate || undefined,
        labels,
        subtasks: task.subtasks.map((existing) => {
          const still = values.subtasks.find((s) => s.title === existing.title);
          return still ? existing : null;
        }).filter(Boolean).concat(
          values.subtasks
            .filter((s) => !task.subtasks.some((e) => e.title === s.title))
            .map((s) => ({ id: `st-${crypto.randomUUID().slice(0, 8)}`, title: s.title, completed: false }))
        ) as Task["subtasks"],
        updatedAt: now,
      });
      toast.success("Task updated successfully");
      useNotificationStore.getState().addNotification({
        type: "success",
        title: "Task updated",
        message: values.title,
      });
    } else {
      const newTask: Task = {
        id: `task-${crypto.randomUUID().slice(0, 8)}`,
        title: values.title,
        description: values.description || "",
        status: values.status,
        priority: values.priority,
        assigneeId: values.assigneeId || undefined,
        dueDate: values.dueDate || undefined,
        createdAt: now,
        updatedAt: now,
        labels,
        subtasks,
      };

      useTaskStore.getState().addTask(newTask);
      toast.success("Task created successfully");
      useNotificationStore.getState().addNotification({
        type: "success",
        title: "Task created",
        message: newTask.title,
      });
    }

    handleClose(false);
  }

  const STATUS_OPTIONS = [
    { value: "backlog", label: "Backlog" },
    { value: "inbox", label: "Inbox" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "testing", label: "Testing" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
  ];

  const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[var(--sheet-width)] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">{isEditing ? "Edit Task" : "New Task"}</SheetTitle>
        <SheetDescription className="sr-only">
          {isEditing ? "Edit an existing task" : "Create a new task for the Kanban board"}
        </SheetDescription>

        {/* Header */}
        <div className="border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
            ) : (
              <ClipboardList className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
            )}
            <h2 className="text-base font-semibold text-[var(--content-primary)]">
              {isEditing ? "Edit Task" : "New Task"}
            </h2>
          </div>
          <p className="text-xs text-[var(--content-muted)] mt-0.5">
            {isEditing ? "Update task details" : "Add a new task to the Kanban board"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-[var(--content-secondary)]">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Implement user authentication"
                className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-[var(--content-secondary)]">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe the task..."
                className="rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                {...form.register("description")}
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[var(--content-secondary)]">
                  Status
                </Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(val) =>
                    form.setValue("status", val as AddTaskFormValues["status"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[var(--content-secondary)]">
                  Priority
                </Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(val) =>
                    form.setValue("priority", val as AddTaskFormValues["priority"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Assignee
              </Label>
              <Select
                value={form.watch("assigneeId") || "unassigned"}
                onValueChange={(val) =>
                  form.setValue("assigneeId", val === "unassigned" ? "" : val ?? "")
                }
              >
                <SelectTrigger className="w-full h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {mockAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                          <Bot className="h-3 w-3" strokeWidth={1.5} />
                        </span>
                        {agent.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-medium text-[var(--content-secondary)]">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                {...form.register("dueDate")}
              />
            </div>

            {/* Labels */}
            <div className="space-y-1.5">
              <Label htmlFor="labels" className="text-xs font-medium text-[var(--content-secondary)]">
                Labels
              </Label>
              <Input
                id="labels"
                placeholder="e.g., frontend, bug, urgent"
                className="h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                {...form.register("labels")}
              />
              <p className="text-[11px] text-[var(--content-muted)]">
                Comma-separated list of labels
              </p>
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--content-secondary)]">
                Subtasks
              </Label>

              {subtaskFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Subtask title"
                      className="h-9 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-sm"
                      {...form.register(`subtasks.${index}.title`)}
                    />
                    {form.formState.errors.subtasks?.[index]?.title && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {form.formState.errors.subtasks[index].title?.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--content-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendSubtask({ title: "" })}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Add Subtask
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border-divider)] px-5 py-4 flex gap-3">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="flex-1 flex items-center justify-center rounded-btn border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
