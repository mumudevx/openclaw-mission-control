"use client";

import { useState } from "react";
import { Search, Download, Pause, Play } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/shared/date-picker";
import { generateMockLogs } from "@/lib/mock/data";
import type { LogLevel } from "@/types";

const levelColors: Record<LogLevel, string> = {
  debug: "text-gray-400",
  info: "text-blue-500",
  warn: "text-amber-500",
  error: "text-red-500",
  critical: "text-red-700 font-bold",
};

const levelBgColors: Record<LogLevel, string> = {
  debug: "bg-gray-100 text-gray-600",
  info: "bg-blue-100 text-blue-700",
  warn: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800",
};

const levels: LogLevel[] = ["debug", "info", "warn", "error", "critical"];

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<LogLevel[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const logs = generateMockLogs(50);

  const filtered = logs.filter((log) => {
    if (activeFilters.length > 0 && !activeFilters.includes(log.level)) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    if (startDate) {
      const logTime = new Date(log.timestamp);
      if (logTime < startDate) return false;
    }
    if (endDate) {
      const logTime = new Date(log.timestamp);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (logTime > endOfDay) return false;
    }
    return true;
  });

  const toggleFilter = (level: LogLevel) => {
    setActiveFilters((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Logs" description="Real-time system log viewer">
        <button className="flex items-center gap-2 rounded-btn border border-[var(--border-default)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]">
          <Download className="h-4 w-4" strokeWidth={1.5} />
          Export
        </button>
      </PageHeader>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" strokeWidth={1.5} />
          <Input
            placeholder="Search logs (supports regex)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[var(--border-default)] bg-white font-mono text-sm"
          />
        </div>

        {/* Level filters */}
        <div className="flex gap-1.5">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => toggleFilter(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeFilters.includes(level) || activeFilters.length === 0
                  ? levelBgColors[level]
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-3 text-sm text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
        >
          {autoScroll ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {autoScroll ? "Pause" : "Resume"}
        </button>
      </div>

      {/* Date filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--content-muted)]">Date range:</span>
        <DatePicker value={startDate} onChange={setStartDate} placeholder="Start date" />
        <span className="text-sm text-[var(--content-muted)]">to</span>
        <DatePicker value={endDate} onChange={setEndDate} placeholder="End date" />
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(undefined); setEndDate(undefined); }}
            className="text-xs text-[var(--accent-primary)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Log entries */}
      <div className="rounded-card border border-[var(--border-default)] bg-[#1A1A1A] p-4 shadow-card">
        <div className="max-h-[600px] space-y-0.5 overflow-y-auto font-mono text-xs">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="flex gap-3 rounded px-2 py-1 hover:bg-white/5 transition-colors"
            >
              <span className="shrink-0 text-gray-500">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className={`shrink-0 w-16 text-right ${levelColors[log.level]}`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="shrink-0 text-gray-400">
                [{log.source}]
              </span>
              <span className="text-gray-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-xs text-[var(--content-muted)]">
        <span>Total: {filtered.length} entries</span>
        <span>Errors: {filtered.filter((l) => l.level === "error" || l.level === "critical").length}</span>
        <span>Warnings: {filtered.filter((l) => l.level === "warn").length}</span>
      </div>
    </div>
  );
}
