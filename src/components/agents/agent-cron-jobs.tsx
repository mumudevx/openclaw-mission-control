"use client";

import { Clock, Play, Pause, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentCronJobs } from "@/hooks/useAgent";
import type { CronJob, CronStatus } from "@/types";

const cronStatusVariant: Record<CronStatus, "active" | "running" | "error" | "idle"> = {
  active: "active",
  running: "running",
  failed: "error",
  paused: "idle",
};

export function AgentCronJobs({ agentId }: { agentId: string }) {
  const { jobs, isLoading } = useAgentCronJobs(agentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-[var(--content-muted)]">Loading cron jobs...</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--content-primary)]">
          Cron Jobs ({jobs.length})
        </h3>
        <Link
          href="/cron"
          className="flex items-center gap-1 text-xs text-[var(--accent-primary)] hover:underline"
        >
          View all cron jobs
          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-10 w-10 text-[var(--content-muted)] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-[var(--content-muted)]">
            No cron jobs assigned to this agent
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <CronJobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

function CronJobRow({ job }: { job: CronJob }) {
  const variant = cronStatusVariant[job.status] ?? "idle";

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-light)]">
          {job.status === "paused" ? (
            <Pause className="h-4 w-4 text-[var(--content-muted)]" strokeWidth={1.5} />
          ) : (
            <Play className="h-4 w-4 text-[var(--accent-primary)]" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--content-primary)] truncate">{job.name}</p>
          <p className="text-xs text-[var(--content-muted)] font-mono">{job.expression}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-[11px] text-[var(--content-muted)]">Next run</p>
          <p className="text-xs text-[var(--content-secondary)]">
            {formatDistanceToNow(new Date(job.nextRun), { addSuffix: true })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[var(--content-muted)]">Runs</p>
          <p className="text-xs font-medium text-[var(--content-primary)]">{job.runCount}</p>
        </div>
        <StatusBadge status={variant} label={job.status} />
      </div>
    </div>
  );
}
