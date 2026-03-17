"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button className="flex h-9 items-center gap-2 rounded-lg border border-[var(--border-default)] bg-white px-3 text-sm transition-colors hover:border-[var(--content-muted)] min-w-[140px]" />
        }
      >
        <CalendarDays className="h-4 w-4 text-[var(--content-muted)]" strokeWidth={1.5} />
        <span className={value ? "text-[var(--content-secondary)]" : "text-[var(--content-muted)]"}>
          {value ? format(value, "MMM dd, yyyy") : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          className="rounded-xl border border-[var(--border-default)] bg-white shadow-card"
        />
      </PopoverContent>
    </Popover>
  );
}
