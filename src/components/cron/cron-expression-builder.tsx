"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cronToHuman } from "@/lib/utils/cron-parser";

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at 9:00 AM", value: "0 9 * * *" },
  { label: "Every Monday at 9:00 AM", value: "0 9 * * 1" },
  { label: "Weekdays at 9:00 AM", value: "0 9 * * 1-5" },
  { label: "1st of every month", value: "0 0 1 * *" },
] as const;

const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

interface CronExpressionBuilderProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function CronExpressionBuilder({
  value,
  onChange,
  error,
}: CronExpressionBuilderProps) {
  const [tab, setTab] = useState<"presets" | "custom">("presets");

  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("9");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  function applyCustom() {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    onChange(expr);
  }

  const preview = value?.trim() ? cronToHuman(value.trim()) : null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-[var(--content-secondary)]">
        Cron Expression <span className="text-red-500">*</span>
      </Label>

      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-10 w-full items-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm transition-colors hover:border-[var(--content-muted)] text-left"
            />
          }
        >
          <span
            className={
              value
                ? "font-mono text-[var(--content-primary)]"
                : "text-[var(--content-muted)]"
            }
          >
            {value || "Click to build expression..."}
          </span>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[360px] p-0"
        >
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] shadow-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[var(--border-divider)]">
              <button
                type="button"
                onClick={() => setTab("presets")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  tab === "presets"
                    ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                    : "text-[var(--content-muted)] hover:text-[var(--content-secondary)]"
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setTab("custom")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  tab === "custom"
                    ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                    : "text-[var(--content-muted)] hover:text-[var(--content-secondary)]"
                }`}
              >
                Custom
              </button>
            </div>

            {tab === "presets" ? (
              <div className="max-h-[280px] overflow-y-auto">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onChange(preset.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-[var(--surface-card-alt)] ${
                      value === preset.value
                        ? "bg-[var(--accent-light)] text-[var(--accent-primary)]"
                        : "text-[var(--content-primary)]"
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono text-[var(--content-muted)]">
                      {preset.value}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* Custom builder fields */}
                <div className="grid grid-cols-5 gap-2">
                  {/* Minute */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase">
                      Min
                    </label>
                    <Select
                      value={minute}
                      onValueChange={(val) => setMinute(val as string)}
                    >
                      <SelectTrigger className="w-full h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-xs px-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">*</SelectItem>
                        <SelectItem value="*/5">*/5</SelectItem>
                        <SelectItem value="*/10">*/10</SelectItem>
                        <SelectItem value="*/15">*/15</SelectItem>
                        <SelectItem value="*/30">*/30</SelectItem>
                        {MINUTES.map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hour */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase">
                      Hour
                    </label>
                    <Select
                      value={hour}
                      onValueChange={(val) => setHour(val as string)}
                    >
                      <SelectTrigger className="w-full h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-xs px-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">*</SelectItem>
                        <SelectItem value="*/2">*/2</SelectItem>
                        <SelectItem value="*/6">*/6</SelectItem>
                        <SelectItem value="*/12">*/12</SelectItem>
                        {HOURS.map((h) => (
                          <SelectItem key={h} value={String(h)}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Day of Month */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase">
                      Day
                    </label>
                    <Input
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-xs px-1.5 text-center"
                    />
                  </div>

                  {/* Month */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase">
                      Mon
                    </label>
                    <Input
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-xs px-1.5 text-center"
                    />
                  </div>

                  {/* Day of Week */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase">
                      Wkd
                    </label>
                    <Select
                      value={dayOfWeek}
                      onValueChange={(val) => setDayOfWeek(val as string)}
                    >
                      <SelectTrigger className="w-full h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] text-xs px-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">*</SelectItem>
                        <SelectItem value="1-5">1-5</SelectItem>
                        <SelectItem value="0,6">0,6</SelectItem>
                        {WEEKDAYS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label.slice(0, 3)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-lg bg-[var(--surface-bg)] px-3 py-2">
                  <p className="text-[10px] text-[var(--content-muted)] uppercase font-medium mb-0.5">
                    Preview
                  </p>
                  <p className="text-xs font-mono text-[var(--content-primary)]">
                    {minute} {hour} {dayOfMonth} {month} {dayOfWeek}
                  </p>
                  <p className="text-[11px] text-[var(--accent-primary)] mt-0.5">
                    {cronToHuman(
                      `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
                    )}
                  </p>
                </div>

                {/* Apply button */}
                <button
                  type="button"
                  onClick={applyCustom}
                  className="w-full rounded-btn bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Direct input */}
            <div className="border-t border-[var(--border-divider)] px-3 py-2">
              <label className="text-[10px] font-medium text-[var(--content-muted)] uppercase mb-1 block">
                Or type directly
              </label>
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g., 0 9 * * 1-5"
                className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--surface-card)] font-mono text-xs"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {preview && preview !== value?.trim() && (
        <p className="text-xs text-[var(--accent-primary)] font-medium">
          {preview}
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
