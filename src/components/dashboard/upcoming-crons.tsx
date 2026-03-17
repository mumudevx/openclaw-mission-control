"use client";

import { Clock } from "lucide-react";
import type { CronJob } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { CronBadge } from "@/components/shared/cron-badge";

interface UpcomingCronsProps {
  jobs: CronJob[];
}

export function UpcomingCrons({ jobs }: UpcomingCronsProps) {
  return (
    <ul className="space-y-3">
      {jobs.map((job) => (
        <li
          key={job.id}
          className="flex items-center justify-between rounded-xl border border-[var(--border-default)] px-4 py-3 transition-colors hover:bg-[var(--surface-card-alt)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)]">
              <Clock className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--content-primary)]">{job.name}</p>
              <CronBadge expression={job.expression} />
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={job.status === "active" ? "active" : "paused"} />
            {job.nextRun && (
              <p className="mt-1 text-[11px] text-[var(--content-muted)]" suppressHydrationWarning>
                Next: {new Date(job.nextRun).toLocaleTimeString()}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
