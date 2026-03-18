"use client";

import { useEffect, useRef } from "react";
import {
  format,
  isToday,
  differenceInMinutes,
  getHours,
  getMinutes,
} from "date-fns";
import type { CalendarEvent } from "@/types";
import { HOUR_HEIGHT, eventTypeBorderColors, getEventsForDay } from "./constants";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
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

function EventBlock({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) {
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
      onClick={onClick}
      className={`absolute left-1 right-4 z-10 overflow-hidden rounded-md border-l-[3px] ${borderColor} bg-[var(--surface-card)]/90 px-3 py-2 shadow-sm cursor-pointer hover:opacity-80`}
      style={{ top, height }}
    >
      <p className="truncate text-sm font-medium text-[var(--content-primary)]">
        {event.title}
      </p>
      {event.description && (
        <p className="truncate text-xs text-[var(--content-secondary)] mt-0.5">
          {event.description}
        </p>
      )}
      <p className="text-xs text-[var(--content-muted)] mt-0.5">
        {format(start, "HH:mm")}
        {end ? ` – ${format(end, "HH:mm")}` : ""}
      </p>
    </div>
  );
}

export function DayView({ currentDate, events, onEventClick }: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayEvents = getEventsForDay(events, currentDate);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);
  const showIndicator = isToday(currentDate);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = showIndicator
        ? getHours(new Date()) * HOUR_HEIGHT - HOUR_HEIGHT
        : 8 * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [currentDate, showIndicator]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col">
      {/* All-day row */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-[var(--border-default)] px-4 py-2">
          <div className="w-16 shrink-0 flex items-center">
            <span className="text-[10px] uppercase text-[var(--content-muted)]">All day</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((event) => {
              const borderColor = eventTypeBorderColors[event.type];
              return (
                <span
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className={`inline-block truncate rounded-md border-l-[3px] ${borderColor} bg-[var(--surface-card)] px-3 py-1 text-xs font-medium text-[var(--content-primary)] shadow-sm cursor-pointer hover:opacity-80`}
                >
                  {event.title}
                </span>
              );
            })}
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

          {/* Day column */}
          <div className="relative flex-1 bg-[var(--surface-card)]">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-[var(--border-default)]"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {/* Events */}
            {timedEvents.map((event) => (
              <EventBlock key={event.id} event={event} onClick={() => onEventClick?.(event)} />
            ))}

            {/* Current time line */}
            {showIndicator && <CurrentTimeIndicator />}
          </div>
        </div>
      </div>
    </div>
  );
}
