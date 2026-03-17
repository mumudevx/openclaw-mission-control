"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { mockCalendarEvents } from "@/lib/mock/data";
import type { EventType } from "@/types";

const eventTypeColors: Record<EventType, string> = {
  cron: "bg-blue-500",
  task_deadline: "bg-[var(--accent-primary)]",
  user_event: "bg-purple-500",
  agent_task: "bg-emerald-500",
  milestone: "bg-amber-500",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const events = mockCalendarEvents;

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startDate), day));

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="View scheduled events, cron jobs, and task deadlines">
        <button className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Event
        </button>
      </PageHeader>

      {/* Calendar header */}
      <div className="rounded-card border border-[var(--border-default)] bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-bg)] transition-colors">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <h2 className="text-lg font-semibold text-[var(--content-primary)]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-bg)] transition-colors">
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex rounded-xl border border-[var(--border-default)]">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-medium capitalize transition-colors first:rounded-l-xl last:rounded-r-xl ${
                  view === v
                    ? "bg-[var(--accent-primary)] text-white"
                    : "text-[var(--content-secondary)] hover:bg-[var(--surface-bg)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-xs font-medium uppercase text-[var(--content-muted)]">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px rounded-xl bg-[var(--border-default)] overflow-hidden">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] bg-white p-2 ${
                    !isSameMonth(day, currentDate) ? "opacity-40" : ""
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday(day)
                        ? "bg-[var(--accent-primary)] text-white font-medium"
                        : "text-[var(--content-primary)]"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${eventTypeColors[event.type]} bg-opacity-10`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${eventTypeColors[event.type]}`} />
                        <span className="truncate text-[10px] font-medium text-[var(--content-primary)]">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-[var(--content-muted)] pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
