"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentSessions } from "@/hooks/useAgent";
import type { Agent, AgentSession } from "@/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const sessionStatusVariant: Record<string, "active" | "running" | "error" | "idle"> = {
  running: "running",
  done: "active",
  failed: "error",
  killed: "error",
  timeout: "error",
};

export function AgentSessions({ agent, onSelectSession }: { agent: Agent; onSelectSession?: (sessionKey: string) => void }) {
  const { sessions, isLoading } = useAgentSessions(agent.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-[var(--content-muted)]">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--content-primary)]">
          Sessions ({sessions.length})
        </h3>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-[var(--content-muted)] text-center py-8">
          No sessions recorded for this agent
        </p>
      ) : (
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-divider)] bg-[var(--surface-bg)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Session</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Model</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Input</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Output</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Cost</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">Updated</th>
                {onSelectSession && (
                  <th className="px-4 py-2.5 w-10"></th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-divider)]">
              {sessions.map((session) => (
                <SessionTableRow key={session.key} session={session} onSelect={onSelectSession} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SessionTableRow({ session, onSelect }: { session: AgentSession; onSelect?: (sessionKey: string) => void }) {
  const variant = sessionStatusVariant[session.status ?? ""] ?? "idle";
  const label = session.status ?? "idle";

  return (
    <tr
      className={`hover:bg-[var(--surface-bg)] transition-colors ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(session.key)}
    >
      <td className="px-4 py-3">
        <p className={`font-medium text-[var(--content-primary)] truncate max-w-[200px] ${onSelect ? "group-hover:text-[var(--accent-primary)]" : ""}`}>
          {session.displayName ?? session.key}
        </p>
        <p className="text-[11px] text-[var(--content-muted)] font-mono truncate max-w-[200px]">
          {session.key}
        </p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={variant} label={label} />
      </td>
      <td className="px-4 py-3 text-[var(--content-secondary)]">
        {session.model ?? "-"}
      </td>
      <td className="px-4 py-3 text-right text-[var(--content-secondary)] font-mono">
        {formatTokens(session.inputTokens ?? 0)}
      </td>
      <td className="px-4 py-3 text-right text-[var(--content-secondary)] font-mono">
        {formatTokens(session.outputTokens ?? 0)}
      </td>
      <td className="px-4 py-3 text-right text-[var(--content-secondary)] font-mono">
        {session.estimatedCostUsd ? `$${session.estimatedCostUsd.toFixed(3)}` : "-"}
      </td>
      <td className="px-4 py-3 text-right text-[var(--content-muted)]">
        {session.updatedAt
          ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })
          : "-"}
      </td>
      {onSelect && (
        <td className="px-4 py-3 text-center">
          <MessageSquare className="h-4 w-4 text-[var(--content-muted)] hover:text-[var(--accent-primary)] transition-colors inline-block" strokeWidth={1.5} />
        </td>
      )}
    </tr>
  );
}
