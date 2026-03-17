"use client";

import React, { useState, useRef } from "react";
import { Bot, Grid3X3, List, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const AgentDetailSheet = dynamic(() => import("@/components/agents/agent-detail-sheet").then((m) => m.AgentDetailSheet));
const AddAgentSheet = dynamic(() => import("@/components/agents/add-agent-sheet").then((m) => m.AddAgentSheet));
import { useAgentStore } from "@/stores/agentStore";
import { mockAgents } from "@/lib/mock/data";
import type { Agent } from "@/types";

function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  const statusMap: Record<string, "active" | "idle" | "error" | "offline"> = {
    active: "active",
    idle: "idle",
    error: "error",
    offline: "offline",
  };

  return (
    <div onClick={onClick} className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-card transition-shadow hover:shadow-card-hover cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            <Bot className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--content-primary)]">{agent.name}</p>
            <p className="text-xs text-[var(--content-muted)]">{agent.model}</p>
          </div>
        </div>
        <StatusBadge status={statusMap[agent.status] || "neutral"} />
      </div>

      {agent.description && (
        <p className="mt-3 text-xs text-[var(--content-secondary)] line-clamp-2">
          {agent.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-divider)] pt-3">
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Tokens</p>
          <p className="text-sm font-semibold text-[var(--content-primary)]">
            {(agent.tokenUsage.total / 1000).toFixed(1)}k
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Cost</p>
          <p className="text-sm font-semibold text-[var(--content-primary)]">
            ${agent.costTotal.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Sessions</p>
          <p className="text-sm font-semibold text-[var(--content-primary)]">
            {agent.activeSessions}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [addAgentOpen, setAddAgentOpen] = useState(false);

  const { agents, setAgents } = useAgentStore();

  const initialized = useRef(false);
  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setAgents(mockAgents);
    }
  }, [setAgents]);
  const filtered = agents.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = agents.filter((a) => a.status === "active").length;
  const idleCount = agents.filter((a) => a.status === "idle").length;
  const totalTokens = agents.reduce((sum, a) => sum + a.tokenUsage.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Agents" description="Manage and monitor your AI agents">
        <button
          onClick={() => setAddAgentOpen(true)}
          className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Agent
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Bot} label="Total Agents" value={agents.length} />
        <StatCard icon={Bot} label="Active" value={activeCount} />
        <StatCard icon={Bot} label="Idle" value={idleCount} />
        <StatCard icon={Bot} label="Total Tokens" value={`${(totalTokens / 1000).toFixed(0)}k`} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" strokeWidth={1.5} />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-[var(--border-default)] bg-[var(--surface-card)]"
          />
        </div>
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)]">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors ${viewMode === "grid" ? "bg-[var(--accent-light)] text-[var(--accent-primary)]" : "text-[var(--content-muted)]"}`}
          >
            <Grid3X3 className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors ${viewMode === "list" ? "bg-[var(--accent-light)] text-[var(--accent-primary)]" : "text-[var(--content-muted)]"}`}
          >
            <List className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Agent grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
        ))}
      </div>

      <AgentDetailSheet
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => {
          if (!open) setSelectedAgent(null);
        }}
      />

      <AddAgentSheet
        open={addAgentOpen}
        onOpenChange={setAddAgentOpen}
      />
    </div>
  );
}
