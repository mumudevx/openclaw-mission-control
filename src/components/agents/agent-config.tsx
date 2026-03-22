"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { Agent } from "@/types";

function ConfigField({ label, children }: { label: string; children: React.ReactNode }) {
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
  const statusMap: Record<string, "active" | "idle" | "offline"> = {
    active: "active",
    idle: "idle",
    offline: "offline",
  };

  return (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--content-primary)] mb-4">
          General
        </h3>
        <div className="space-y-4">
          <ConfigField label="Name">
            <p className="text-sm text-[var(--content-primary)]">{agent.name}</p>
          </ConfigField>
          <ConfigField label="Agent ID">
            <p className="text-sm font-mono text-[var(--content-muted)]">{agent.id}</p>
          </ConfigField>
          <ConfigField label="Status">
            <StatusBadge status={statusMap[agent.status] || "offline"} />
          </ConfigField>
          <ConfigField label="Default Agent">
            <p className="text-sm text-[var(--content-secondary)]">
              {agent.isDefault ? "Yes" : "No"}
            </p>
          </ConfigField>
        </div>
      </div>
    </div>
  );
}
