"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Grid3X3, List, Plus, Search, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const AddAgentSheet = dynamic(() => import("@/components/agents/add-agent-sheet").then((m) => m.AddAgentSheet));
const ConfirmDeleteDialog = dynamic(() => import("@/components/shared/confirm-delete-dialog").then((m) => m.ConfirmDeleteDialog));
import { SkillsBadge } from "@/components/agents/agent-skills";
import { useAgentsList, useDeleteAgent } from "@/hooks/useAgents";
import { useAgentLiveSync } from "@/hooks/useAgentLiveSync";
import type { Agent } from "@/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const AgentCard = React.memo(function AgentCard({
  agent,
  onNavigate,
}: {
  agent: Agent;
  onNavigate: (id: string) => void;
}) {
  const statusMap: Record<string, "active" | "idle" | "offline"> = {
    active: "active",
    idle: "idle",
    offline: "offline",
  };

  return (
    <div onClick={() => onNavigate(agent.id)} className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-card transition-shadow hover:shadow-card-hover cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            {agent.identity?.emoji ? (
              <span className="text-lg">{agent.identity.emoji}</span>
            ) : (
              <Bot className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[var(--content-primary)]">{agent.name}</p>
              {agent.isDefault && (
                <Star className="h-3.5 w-3.5 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
              )}
            </div>
            <p className="text-xs text-[var(--content-muted)]">{agent.id}</p>
            <SkillsBadge agentId={agent.id} />
          </div>
        </div>
        <StatusBadge status={statusMap[agent.status] || "offline"} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-divider)] pt-3">
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Sessions</p>
          <p className="text-sm font-semibold text-[var(--content-primary)]">
            {agent.sessionCount}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--content-muted)]">Tokens</p>
          <p className="text-sm font-semibold text-[var(--content-primary)]">
            {formatTokens(agent.totalTokens)}
          </p>
        </div>
        {agent.estimatedCost > 0 && (
          <div>
            <p className="text-[11px] text-[var(--content-muted)]">Cost</p>
            <p className="text-sm font-semibold text-[var(--content-primary)]">
              ${agent.estimatedCost.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default function AgentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [deleteAgent, setDeleteAgentState] = useState<Agent | null>(null);

  const { agents, isLoading, refetch } = useAgentsList();
  const deleteMutation = useDeleteAgent();

  // Delta updates from gateway events (invalidate cache instead of full refetch)
  useAgentLiveSync();

  const filtered = useMemo(
    () => agents.filter(
      (a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
    ),
    [agents, search],
  );

  const stats = useMemo(() => ({
    activeCount: agents.filter((a) => a.status === "active").length,
    totalSessions: agents.reduce((sum, a) => sum + a.sessionCount, 0),
    totalTokens: agents.reduce((sum, a) => sum + a.totalTokens, 0),
  }), [agents]);

  const navigateToAgent = useCallback((agentId: string) => {
    router.push(`/agents/${agentId}`);
  }, [router]);

  const confirmDelete = () => {
    if (deleteAgent) {
      const agentId = deleteAgent.id;
      setDeleteAgentState(null);

      // Optimistic delete via query cache
      queryClient.setQueryData(
        ['gateway', 'agents.list', undefined],
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as { agents: Array<{ id: string }>; defaultId?: string };
          return { ...data, agents: data.agents.filter((a) => a.id !== agentId) };
        },
      );

      deleteMutation.mutate(
        { agentId },
        {
          onSuccess: () => {
            toast.success("Agent deleted");
          },
          onError: () => {
            toast.error("Failed to delete agent");
            refetch();
          },
        },
      );
    }
  };

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

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
        <StatCard icon={Bot} label="Active" value={stats.activeCount} />
        <StatCard icon={Bot} label="Sessions" value={stats.totalSessions} />
        <StatCard icon={Bot} label="Total Tokens" value={formatTokens(stats.totalTokens)} />
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
      <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onNavigate={navigateToAgent} />
        ))}
      </div>

      <AddAgentSheet
        open={addAgentOpen}
        onOpenChange={(open) => {
          if (!open) setAddAgentOpen(false);
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteAgent}
        onOpenChange={(open) => { if (!open) setDeleteAgentState(null); }}
        onConfirm={confirmDelete}
        entityName={deleteAgent?.name ?? ""}
        entityType="agent"
      />
    </div>
  );
}
