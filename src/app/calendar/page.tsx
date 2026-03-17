"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { mockCalendarEvents } from "@/lib/mock/data";
import dynamic from "next/dynamic";
import { MonthView } from "@/components/calendar/month-view";

const WeekView = dynamic(() => import("@/components/calendar/week-view").then((m) => m.WeekView));
const DayView = dynamic(() => import("@/components/calendar/day-view").then((m) => m.DayView));
const AddEventSheet = dynamic(() => import("@/components/calendar/add-event-sheet").then((m) => m.AddEventSheet));
import { WEEK_STARTS_ON } from "@/components/calendar/constants";

type View = "month" | "week" | "day";

function getHeaderTitle(view: View, date: Date): string {
  switch (view) {
    case "month":
      return format(date, "MMMM yyyy");
    case "week": {
      const ws = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
      const we = endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
      return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
    }
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
  }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const events = mockCalendarEvents;

  const navigate = (direction: 1 | -1) => {
    switch (view) {
      case "month":
        setCurrentDate((d) => (direction === 1 ? addMonths(d, 1) : subMonths(d, 1)));
        break;
      case "week":
        setCurrentDate((d) => (direction === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
        break;
      case "day":
        setCurrentDate((d) => (direction === 1 ? addDays(d, 1) : subDays(d, 1)));
        break;
    }
  };

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView("day");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="View scheduled events, cron jobs, and task deadlines">
        <button
          onClick={() => setAddEventOpen(true)}
          className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Event
        </button>
      </PageHeader>

      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] shadow-card">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-bg)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <h2 className="text-lg font-semibold text-[var(--content-primary)]">
              {getHeaderTitle(view, currentDate)}
            </h2>
            <button
              onClick={() => navigate(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-bg)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-2 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
            >
              Today
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

        {view === "month" && <MonthView currentDate={currentDate} events={events} onDayClick={handleDayClick} />}
        {view === "week" && <WeekView currentDate={currentDate} events={events} onDayClick={handleDayClick} />}
        {view === "day" && <DayView currentDate={currentDate} events={events} />}
      </div>

      <AddEventSheet
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        defaultDate={currentDate}
      />
    </div>
  );
}
