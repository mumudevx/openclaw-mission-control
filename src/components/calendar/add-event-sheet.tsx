"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNotificationStore } from "@/stores/notificationStore";
import type { EventType } from "@/types";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["cron", "task_deadline", "user_event", "agent_task", "milestone"]),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  allDay: z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface AddEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}

const eventTypes: { value: EventType; label: string }[] = [
  { value: "user_event", label: "User Event" },
  { value: "task_deadline", label: "Task Deadline" },
  { value: "milestone", label: "Milestone" },
  { value: "agent_task", label: "Agent Task" },
  { value: "cron", label: "Cron Job" },
];

export function AddEventSheet({ open, onOpenChange, defaultDate }: AddEventSheetProps) {
  const dateStr = defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "user_event",
      startDate: dateStr,
      startTime: "09:00",
      endDate: "",
      endTime: "",
      allDay: false,
    },
  });

  const allDay = form.watch("allDay");

  const addNotification = useNotificationStore((s) => s.addNotification);

  const onSubmit = (data: EventFormValues) => {
    toast.success(`Event "${data.title}" created`);
    addNotification({ type: "success", title: `Event "${data.title}" created`, message: `${data.startDate} ${data.allDay ? "(all day)" : data.startTime}` });
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[480px] max-w-[90vw] !sm:max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">New Event</SheetTitle>
        <SheetDescription className="sr-only">Create a new calendar event</SheetDescription>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            <CalendarDays className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--content-primary)]">New Event</h2>
            <p className="text-xs text-[var(--content-muted)]">Add an event to the calendar</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-[var(--content-primary)]">
                Title <span className="text-[var(--status-error)]">*</span>
              </label>
              <Input
                {...form.register("title")}
                placeholder="Event title"
                className="mt-1.5 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-xs text-[var(--status-error)]">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium text-[var(--content-primary)]">Type</label>
              <Select
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as EventType)}
              >
                <SelectTrigger className="mt-1.5 w-full !h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* All day toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--content-primary)]">All Day</label>
              <Switch
                checked={allDay}
                onCheckedChange={(checked) => form.setValue("allDay", checked)}
              />
            </div>

            {/* Start date/time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[var(--content-primary)]">
                  Start Date <span className="text-[var(--status-error)]">*</span>
                </label>
                <Input
                  type="date"
                  {...form.register("startDate")}
                  className="mt-1.5 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                />
              </div>
              {!allDay && (
                <div>
                  <label className="text-sm font-medium text-[var(--content-primary)]">
                    Start Time <span className="text-[var(--status-error)]">*</span>
                  </label>
                  <Input
                    type="time"
                    {...form.register("startTime")}
                    className="mt-1.5 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                  />
                </div>
              )}
            </div>

            {/* End date/time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[var(--content-primary)]">End Date</label>
                <Input
                  type="date"
                  {...form.register("endDate")}
                  className="mt-1.5 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                />
              </div>
              {!allDay && (
                <div>
                  <label className="text-sm font-medium text-[var(--content-primary)]">End Time</label>
                  <Input
                    type="time"
                    {...form.register("endTime")}
                    className="mt-1.5 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-[var(--content-primary)]">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Optional description..."
                rows={3}
                className="mt-1.5 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)] text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--border-divider)] px-5 py-4">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-btn border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Create Event
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
