"use client";

import { useCalendarSync } from "@/hooks/useCalendarSync";

export function CalendarSyncProvider({ children }: { children: React.ReactNode }) {
  useCalendarSync();
  return <>{children}</>;
}
