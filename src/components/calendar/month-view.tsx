"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import type { CalendarEvent } from "@/types";
import { WEEK_STARTS_ON, eventTypeColors, getEventsForDay } from "./constants";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="p-4">
      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="py-2 text-xs font-medium uppercase text-[var(--content-muted)]">
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px rounded-xl bg-[var(--border-default)] overflow-hidden">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[100px] bg-[var(--surface-card)] p-2 cursor-pointer hover:bg-[var(--surface-bg)] transition-colors ${
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
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${eventTypeColors[event.type]} bg-opacity-10 cursor-pointer hover:opacity-80`}
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
  );
}
