import { isSameDay } from "date-fns";
import type { CalendarEvent, EventType } from "@/types";

export const WEEK_STARTS_ON = 1; // Monday

export const HOUR_HEIGHT = 48; // px per hour row

export const eventTypeColors: Record<EventType, string> = {
  cron: "bg-blue-500",
  task_deadline: "bg-[var(--accent-primary)]",
  user_event: "bg-purple-500",
  agent_task: "bg-emerald-500",
  milestone: "bg-amber-500",
};

export const eventTypeBorderColors: Record<EventType, string> = {
  cron: "border-blue-500",
  task_deadline: "border-[var(--accent-primary)]",
  user_event: "border-purple-500",
  agent_task: "border-emerald-500",
  milestone: "border-amber-500",
};

export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(new Date(e.startDate), day));
}
