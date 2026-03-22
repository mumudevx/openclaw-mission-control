"use client";

import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/shared/status-badge";
import { useSessionsList } from "@/hooks/useSessions";
import type { Agent, AgentSession } from "@/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

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

const sessionStatusVariant: Record<string, "active" | "running" | "error" | "idle"> = {
  running: "running",
  done: "active",
  failed: "error",
  killed: "error",
  timeout: "error",
};

export function AgentStats({ agent }: { agent: Agent }) {
  const { sessions: allSessions } = useSessionsList();
  const sessions = allSessions
    .filter((s) => s.agentId === agent.id)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  const totalInput = sessions.reduce((sum, s) => sum + (s.inputTokens ?? 0), 0);
  const totalOutput = sessions.reduce((sum, s) => sum + (s.outputTokens ?? 0), 0);
  const totalCost = sessions.reduce((sum, s) => sum + (s.estimatedCostUsd ?? 0), 0);

  return (
    <div className="p-5 space-y-6">
      {/* Token & Cost grid */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          Usage
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard label="Input Tokens" value={formatTokens(totalInput)} />
          <MiniStatCard label="Output Tokens" value={formatTokens(totalOutput)} />
          <MiniStatCard label="Total Tokens" value={formatTokens(agent.totalTokens)} />
          {totalCost > 0 && (
            <MiniStatCard label="Estimated Cost" value={`$${totalCost.toFixed(2)}`} />
          )}
        </div>
      </div>

      {/* Sessions list */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          Sessions ({sessions.length})
        </h3>
        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--content-muted)] text-center py-4">
            No sessions recorded
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <SessionRow key={session.key} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: AgentSession }) {
  const variant = sessionStatusVariant[session.status ?? ''] ?? "idle";
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
            <p className="text-xs font-medium text-[var(--content-primary)]">
              {session.model}
            </p>
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
