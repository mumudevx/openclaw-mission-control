"use client";

import Link from "next/link";
import { Bot, CheckSquare, Radio, DollarSign, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TokenUsageChart } from "@/components/dashboard/token-usage-chart";
import { AgentActivityChart } from "@/components/dashboard/agent-activity-chart";
import { RecentTasksList } from "@/components/dashboard/recent-tasks-list";
import { UpcomingCrons } from "@/components/dashboard/upcoming-crons";
import { mockDashboardStats, mockAgents, mockTasks, mockCronJobs } from "@/lib/mock/data";

export default function DashboardPage() {
  const stats = mockDashboardStats;
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

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
          <AgentActivityChart agents={mockAgents} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--content-primary)]">
              Recent Tasks
            </h3>
            <StatusBadge status="active" label={`${mockTasks.filter(t => t.status === 'in_progress').length} in progress`} />
          </div>
          <RecentTasksList tasks={mockTasks.slice(0, 5)} />
        </div>
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">
            Upcoming Crons
          </h3>
          <UpcomingCrons jobs={mockCronJobs.filter(j => j.status === 'active').slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
