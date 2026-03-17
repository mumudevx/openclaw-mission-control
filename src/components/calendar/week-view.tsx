"use client";

import { useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isToday,
  differenceInMinutes,
  getHours,
  getMinutes,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import { WEEK_STARTS_ON, HOUR_HEIGHT, eventTypeBorderColors, getEventsForDay } from "./constants";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
}

function CurrentTimeIndicator() {
  const now = new Date();
  const top = getHours(now) * HOUR_HEIGHT + (getMinutes(now) / 60) * HOUR_HEIGHT;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="h-0.5 bg-red-500 w-full" />
      <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
    </div>
  );
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;
  const startHour = getHours(start);
  const startMinute = getMinutes(start);
  const top = startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
  const height = end
    ? Math.max((differenceInMinutes(end, start) / 60) * HOUR_HEIGHT, 24)
    : HOUR_HEIGHT;

  const borderColor = eventTypeBorderColors[event.type];

  return (
    <div
      className={`absolute left-1 right-1 z-10 overflow-hidden rounded-md border-l-[3px] ${borderColor} bg-[var(--surface-card)]/90 px-2 py-1 shadow-sm`}
      style={{ top, height }}
    >
      <p className="truncate text-[11px] font-medium text-[var(--content-primary)]">
        {event.title}
      </p>
      <p className="truncate text-[10px] text-[var(--content-muted)]">
        {format(start, "HH:mm")}
        {end ? ` – ${format(end, "HH:mm")}` : ""}
      </p>
    </div>
  );
}

export function WeekView({ currentDate, events, onDayClick }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: WEEK_STARTS_ON });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allDayEvents = weekDays.map((day) =>
    getEventsForDay(events, day).filter((e) => e.allDay)
  );
  const hasAllDay = allDayEvents.some((dayEvents) => dayEvents.length > 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, [currentDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="flex border-b border-[var(--border-default)]">
        <div className="w-16 shrink-0" />
        <div className="grid flex-1 grid-cols-7">
          {weekDays.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`flex flex-col items-center py-3 transition-colors hover:bg-[var(--surface-bg)] ${
                isToday(day) ? "bg-[var(--accent-primary)]/5" : ""
              }`}
            >
              <span className="text-xs font-medium uppercase text-[var(--content-muted)]">
                {format(day, "EEE")}
              </span>
              <span
                className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday(day)
                    ? "bg-[var(--accent-primary)] text-white"
                    : "text-[var(--content-primary)]"
                }`}
              >
                {format(day, "d")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* All-day row */}
      {hasAllDay && (
        <div className="flex border-b border-[var(--border-default)]">
          <div className="flex w-16 shrink-0 items-center justify-center">
            <span className="text-[10px] uppercase text-[var(--content-muted)]">All day</span>
          </div>
          <div className="grid flex-1 grid-cols-7 gap-px bg-[var(--border-default)]">
            {allDayEvents.map((dayEvents, i) => (
              <div key={i} className="flex flex-wrap gap-1 bg-[var(--surface-card)] p-1.5">
                {dayEvents.map((event) => {
                  const borderColor = eventTypeBorderColors[event.type];
                  return (
                    <span
                      key={event.id}
                      className={`inline-block truncate rounded-md border-l-[3px] ${borderColor} bg-[var(--surface-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--content-primary)] shadow-sm`}
                    >
                      {event.title}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <div className="flex">
          {/* Time gutter */}
          <div className="w-16 shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2.5 right-3 text-[11px] text-[var(--content-muted)]">
                  {format(new Date(2000, 0, 1, hour), "HH:mm")}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="grid flex-1 grid-cols-7 gap-px bg-[var(--border-default)]">
            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(events, day).filter((e) => !e.allDay);
              const showIndicator = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`relative bg-[var(--surface-card)] ${isToday(day) ? "bg-[var(--accent-primary)]/5" : ""}`}
                >
                  {/* Hour lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-[var(--border-default)]"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event) => (
                    <EventBlock key={event.id} event={event} />
                  ))}

                  {/* Current time line */}
                  {showIndicator && <CurrentTimeIndicator />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
