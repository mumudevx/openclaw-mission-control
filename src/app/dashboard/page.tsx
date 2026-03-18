"use client";

import Link from "next/link";
import { Bot, CheckSquare, Radio, DollarSign, Clock, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import dynamic from "next/dynamic";

const TokenUsageChart = dynamic(() => import("@/components/dashboard/token-usage-chart").then((m) => m.TokenUsageChart));
const AgentActivityChart = dynamic(() => import("@/components/dashboard/agent-activity-chart").then((m) => m.AgentActivityChart));
const RecentTasksList = dynamic(() => import("@/components/dashboard/recent-tasks-list").then((m) => m.RecentTasksList));
const UpcomingCrons = dynamic(() => import("@/components/dashboard/upcoming-crons").then((m) => m.UpcomingCrons), { ssr: false });
import { useDashboardStats } from "@/hooks/useDashboard";
import { useTaskStore } from "@/stores/taskStore";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  const { stats, agents, cronJobs, isLoading } = useDashboardStats();
  const { tasks } = useTaskStore();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <PageHeader
            title="Welcome back!"
            description={today}
          />
        </div>
        <Link
          href="/tasks"
          className="flex cursor-pointer items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Show my Tasks
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Bot}
          label="Active Agents"
          value={stats.activeAgents}
          trend={{ value: 12.5, label: "vs last week" }}
        />
        <StatCard
          icon={CheckSquare}
          label="Active Tasks"
          value={stats.activeTasks}
          trend={{ value: 8.2, label: "vs last week" }}
        />
        <StatCard
          icon={Radio}
          label="Gateway Status"
          value={stats.gatewayStatus === "connected" ? "Online" : "Offline"}
        />
        <StatCard
          icon={DollarSign}
          label="Today's Cost"
          value={`$${stats.todayCost.toFixed(2)}`}
          trend={{ value: -3.1, label: "vs yesterday" }}
        />
        <StatCard
          icon={Clock}
          label="Cron Jobs"
          value={stats.cronJobs}
          trend={{ value: 0, label: "no change" }}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">
            Token Usage
          </h3>
          <TokenUsageChart />
        </div>
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">
            Agent Activity
          </h3>
          <AgentActivityChart agents={agents} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--content-primary)]">
              Recent Tasks
            </h3>
            {tasks.length > 0 && (
              <StatusBadge status="active" label={`${tasks.filter(t => t.status === 'in_progress').length} in progress`} />
            )}
          </div>
          {tasks.length > 0 ? (
            <RecentTasksList tasks={tasks.slice(0, 5)} />
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Create a task from the Tasks page to get started"
            />
          )}
        </div>
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">
            Upcoming Crons
          </h3>
          <UpcomingCrons jobs={cronJobs.filter(j => j.status === 'active').slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
