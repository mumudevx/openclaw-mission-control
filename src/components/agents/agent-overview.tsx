"use client";

import { Coins, MessageSquare, Sparkles, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentSessions, useAgentCronJobs } from "@/hooks/useAgent";
import { useAgentSkills } from "@/hooks/useAgents";
import type { Agent, AgentSession } from "@/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function MiniStatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-[var(--content-muted)]" strokeWidth={1.5} />
        <p className="text-[11px] text-[var(--content-muted)]">{label}</p>
      </div>
      <p className="text-lg font-semibold text-[var(--content-primary)]">{value}</p>
    </div>
  );
}

const sessionStatusVariant: Record<string, "active" | "running" | "error" | "idle"> = {
  running: "running",
  done: "active",
  failed: "error",
  killed: "error",
  timeout: "error",
};

export function AgentOverview({ agent }: { agent: Agent }) {
  const { sessions } = useAgentSessions(agent.id);
  const { jobs: cronJobs } = useAgentCronJobs(agent.id);
  const skillsQuery = useAgentSkills(agent.id);

  const totalInput = sessions.reduce((sum, s) => sum + (s.inputTokens ?? 0), 0);
  const totalOutput = sessions.reduce((sum, s) => sum + (s.outputTokens ?? 0), 0);
  const totalCost = sessions.reduce((sum, s) => sum + (s.estimatedCostUsd ?? 0), 0);

  const skills = skillsQuery.data?.skills ?? [];
  const activeSkills = skills.filter((s) => s.eligible).length;
  const totalSkills = skills.length;

  const latestSession = sessions[0];
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="space-y-6 p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStatCard icon={Coins} label="Total Tokens" value={formatTokens(totalInput + totalOutput)} />
        <MiniStatCard icon={MessageSquare} label="Sessions" value={String(sessions.length)} />
        <MiniStatCard icon={Coins} label="Estimated Cost" value={totalCost > 0 ? `$${totalCost.toFixed(2)}` : "$0.00"} />
        <MiniStatCard icon={Sparkles} label="Active Skills" value={`${activeSkills}/${totalSkills}`} />
      </div>

      {/* Info */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--content-primary)]">Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Model</p>
            <p className="font-medium text-[var(--content-primary)]">{latestSession?.model ?? "Default"}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Status</p>
            <p className="font-medium text-[var(--content-primary)] capitalize">{agent.status}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Cron Jobs</p>
            <p className="font-medium text-[var(--content-primary)]">{cronJobs.length} scheduled</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Last Active</p>
            <p className="font-medium text-[var(--content-primary)]">
              {agent.lastActive ? formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true }) : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          Recent Sessions
        </h3>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-[var(--content-muted)] text-center py-4">
            No sessions recorded
          </p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <SessionRow key={session.key} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: AgentSession }) {
  const variant = sessionStatusVariant[session.status ?? ""] ?? "idle";
  const label = session.status ?? "idle";

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-3">
      <div className="flex items-center gap-3 min-w-0">
        <StatusBadge status={variant} label={label} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--content-primary)] truncate">
            {session.displayName ?? session.key}
          </p>
          {session.updatedAt && (
            <p className="text-[11px] text-[var(--content-muted)]">
              {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-right shrink-0">
        {session.model && (
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Model</p>
            <p className="text-xs font-medium text-[var(--content-primary)]">{session.model}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Tokens</p>
          <p className="text-xs font-medium text-[var(--content-primary)]">
            {formatTokens(session.totalTokens ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
