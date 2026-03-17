"use client";

import React, { useState, useRef } from "react";
import { Clock, Play, Pause, Trash2, Plus, Timer, AlertCircle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CronBadge } from "@/components/shared/cron-badge";
import dynamic from "next/dynamic";

const AddCronJobSheet = dynamic(() => import("@/components/cron/add-cron-job-sheet").then((m) => m.AddCronJobSheet));
import { useCronStore } from "@/stores/cronStore";
import { mockCronJobs } from "@/lib/mock/data";

export default function CronPage() {
  const [addJobOpen, setAddJobOpen] = useState(false);
  const { jobs, setJobs } = useCronStore();

  const initialized = useRef(false);
  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setJobs(mockCronJobs);
    }
  }, [setJobs]);

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const runningCount = jobs.filter((j) => j.status === "running").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Cron Jobs" description="Schedule and manage automated tasks">
        <button
          onClick={() => setAddJobOpen(true)}
          className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Job
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Total Jobs" value={jobs.length} />
        <StatCard icon={Timer} label="Active" value={activeCount} />
        <StatCard icon={CheckCircle} label="Running" value={runningCount} />
        <StatCard icon={AlertCircle} label="Failed" value={failedCount} />
      </div>

      {/* Jobs list */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] shadow-card">
        <div className="border-b border-[var(--border-default)] px-6 py-3">
          <div className="grid grid-cols-12 text-xs font-medium uppercase tracking-wide text-[var(--content-muted)]">
            <span className="col-span-3">Name</span>
            <span className="col-span-2">Schedule</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-2">Last Run</span>
            <span className="col-span-2">Next Run</span>
            <span className="col-span-1">Runs</span>
            <span className="col-span-1">Actions</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-divider)]">
          {jobs.map((job) => {
            const statusMap: Record<string, "active" | "paused" | "running" | "failed"> = {
              active: "active",
              paused: "paused",
              running: "running",
              failed: "failed",
            };

            return (
              <div
                key={job.id}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-[var(--surface-card-alt)] transition-colors cursor-pointer"
              >
                <div className="col-span-3">
                  <p className="text-sm font-medium text-[var(--content-primary)]">{job.name}</p>
                  <p className="text-xs text-[var(--content-muted)]">{job.description}</p>
                </div>
                <div className="col-span-2">
                  <CronBadge expression={job.expression} />
                </div>
                <div className="col-span-1">
                  <StatusBadge status={statusMap[job.status]} />
                </div>
                <div className="col-span-2 text-sm text-[var(--content-secondary)]">
                  {job.lastRun ? new Date(job.lastRun).toLocaleString() : "Never"}
                </div>
                <div className="col-span-2 text-sm text-[var(--content-secondary)]">
                  {new Date(job.nextRun).toLocaleString()}
                </div>
                <div className="col-span-1 text-sm text-[var(--content-primary)]">
                  {job.runCount}
                </div>
                <div className="col-span-1 flex gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-[var(--surface-bg)] transition-colors">
                    {job.status === "active" ? (
                      <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddCronJobSheet open={addJobOpen} onOpenChange={setAddJobOpen} />
    </div>
  );
}
