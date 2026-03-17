"use client";

import { format } from "date-fns";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Agent } from "@/types";

function ConfigField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[var(--content-muted)] uppercase tracking-wider">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function AgentConfig({ agent }: { agent: Agent }) {
  const statusMap: Record<string, "active" | "idle" | "error" | "offline"> = {
    active: "active",
    idle: "idle",
    error: "error",
    offline: "offline",
  };

  return (
    <div className="p-5 space-y-6">
      {/* General */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-4">
          General
        </h3>
        <div className="space-y-4">
          <ConfigField label="Name">
            <p className="text-sm text-[var(--content-primary)]">{agent.name}</p>
          </ConfigField>
          <ConfigField label="Model">
            <p className="text-sm font-mono text-[var(--content-primary)]">
              {agent.model}
            </p>
          </ConfigField>
          <ConfigField label="Description">
            <p className="text-sm text-[var(--content-secondary)]">
              {agent.description}
            </p>
          </ConfigField>
          <ConfigField label="Status">
            <StatusBadge status={statusMap[agent.status] || "neutral"} />
          </ConfigField>
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-3">
          System Prompt
        </h3>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-bg)] p-4">
          <pre className="text-xs font-mono text-[var(--content-secondary)] whitespace-pre-wrap leading-relaxed">
            {`You are ${agent.name}, a specialized AI assistant.\n\nYour primary role is: ${agent.description}\n\nFollow the user's instructions carefully and provide accurate, helpful responses. Always explain your reasoning when asked.`}
          </pre>
        </div>
      </div>

      {/* Metadata */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-4">
          Metadata
        </h3>
        <div className="space-y-4">
          <ConfigField label="Created">
            <p className="text-sm text-[var(--content-secondary)]">
              {format(new Date(agent.createdAt), "MMM d, yyyy 'at' HH:mm")}
            </p>
          </ConfigField>
          <ConfigField label="Last Updated">
            <p className="text-sm text-[var(--content-secondary)]">
              {format(new Date(agent.updatedAt), "MMM d, yyyy 'at' HH:mm")}
            </p>
          </ConfigField>
          <ConfigField label="Agent ID">
            <p className="text-sm font-mono text-[var(--content-muted)]">
              {agent.id}
            </p>
          </ConfigField>
        </div>
      </div>
    </div>
  );
}
