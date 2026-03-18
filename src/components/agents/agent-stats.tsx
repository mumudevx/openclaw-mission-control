"use client";

import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/status-badge";
import { useSessionsList } from "@/hooks/useSessions";
import type { Agent, AgentSessionStatus } from "@/types";

const sessionStatusMap: Record<
  AgentSessionStatus,
  { variant: "active" | "running" | "error" | "idle"; label: string }
> = {
  active: { variant: "running", label: "Active" },
  completed: { variant: "active", label: "Completed" },
  error: { variant: "error", label: "Error" },
  idle: { variant: "idle", label: "Idle" },
};

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4">
      <p className="text-[11px] text-[var(--content-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[var(--content-primary)]">
        {value}
      </p>
    </div>
  );
}

export function AgentStats({ agent }: { agent: Agent }) {
  const { sessions: allSessions } = useSessionsList();
  const sessions = allSessions
    .filter((s) => s.agentId === agent.id)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div className="p-5 space-y-6">
      {/* Token & Cost grid */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          Token Usage & Cost
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard
            label="Prompt Tokens"
            value={`${(agent.tokenUsage.prompt / 1000).toFixed(1)}k`}
          />
          <MiniStatCard
            label="Completion Tokens"
            value={`${(agent.tokenUsage.completion / 1000).toFixed(1)}k`}
          />
          <MiniStatCard
            label="Total Tokens"
            value={`${(agent.tokenUsage.total / 1000).toFixed(1)}k`}
          />
          <MiniStatCard
            label="Total Cost"
            value={`$${agent.costTotal.toFixed(2)}`}
          />
        </div>
      </div>

      {/* Sessions list */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          Sessions
        </h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--content-muted)] text-center py-4">
            No sessions recorded
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const mapping = sessionStatusMap[session.status];
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={mapping.variant}
                      label={mapping.label}
                    />
                    <div>
                      <p className="text-xs text-[var(--content-secondary)]">
                        {format(new Date(session.startedAt), "MMM d, HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[11px] text-[var(--content-muted)]">Tokens</p>
                      <p className="text-xs font-medium text-[var(--content-primary)]">
                        {(session.tokensUsed / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--content-muted)]">Cost</p>
                      <p className="text-xs font-medium text-[var(--content-primary)]">
                        ${session.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
