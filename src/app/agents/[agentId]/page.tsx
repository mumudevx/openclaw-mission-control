"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Star,
  Trash2,
  LayoutDashboard,
  MessageSquare,
  MonitorDot,
  Sparkles,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgent } from "@/hooks/useAgent";
import { useDeleteAgent } from "@/hooks/useAgents";
import { useAgentStore } from "@/stores/agentStore";
import { useGatewayEvent } from "@/hooks/useGatewayEvent";
import dynamic from "next/dynamic";

const AgentOverview = dynamic(() =>
  import("@/components/agents/agent-overview").then((m) => m.AgentOverview)
);
const AgentChat = dynamic(() =>
  import("@/components/agents/agent-chat").then((m) => m.AgentChat)
);
const AgentSessions = dynamic(() =>
  import("@/components/agents/agent-sessions").then((m) => m.AgentSessions)
);
const AgentSkills = dynamic(() =>
  import("@/components/agents/agent-skills").then((m) => m.AgentSkills)
);
const AgentFiles = dynamic(() =>
  import("@/components/agents/agent-files").then((m) => m.AgentFiles)
);
const AgentCronJobs = dynamic(() =>
  import("@/components/agents/agent-cron-jobs").then((m) => m.AgentCronJobs)
);

const statusMap: Record<string, "active" | "idle" | "offline"> = {
  active: "active",
  idle: "idle",
  offline: "offline",
};

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const router = useRouter();
  const { agent, isLoading, refetch } = useAgent(agentId);
  const deleteMutation = useDeleteAgent();
  const { removeAgent } = useAgentStore();

  const handlePresenceEvent = useCallback(() => {
    refetch();
  }, [refetch]);

  useGatewayEvent("presence", handlePresenceEvent);
  useGatewayEvent("agent", handlePresenceEvent);

  const handleDelete = () => {
    if (!agent) return;
    removeAgent(agent.id);
    deleteMutation.mutate(
      { id: agent.id },
      {
        onSuccess: () => {
          toast.success("Agent deleted");
          router.push("/agents");
        },
        onError: () => {
          toast.error("Failed to delete agent");
          refetch();
        },
      }
    );
  };

  if (isLoading && !agent) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-[var(--content-muted)]">Agent not found</p>
        <button
          onClick={() => router.push("/agents")}
          className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/agents")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--content-muted)] hover:bg-[var(--surface-bg)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            {agent.identity?.emoji ? (
              <span className="text-xl">{agent.identity.emoji}</span>
            ) : (
              <Bot className="h-6 w-6 text-[var(--accent-primary)]" strokeWidth={1.5} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--content-primary)]">
                {agent.name}
              </h1>
              {agent.isDefault && (
                <Star className="h-4 w-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
              )}
              <StatusBadge status={statusMap[agent.status] || "offline"} />
            </div>
            <p className="text-xs text-[var(--content-muted)] font-mono">{agent.id}</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="flex h-9 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          Delete
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList variant="line" className="mb-5">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.5} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
            Chat
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <MonitorDot className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            Skills
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Files
          </TabsTrigger>
          <TabsTrigger value="cron" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            Cron Jobs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AgentOverview agent={agent} />
        </TabsContent>
        <TabsContent value="chat" className="min-h-[500px]">
          <AgentChat key={agent.id} agent={agent} />
        </TabsContent>
        <TabsContent value="sessions">
          <AgentSessions agent={agent} />
        </TabsContent>
        <TabsContent value="skills">
          <AgentSkills agent={agent} />
        </TabsContent>
        <TabsContent value="files">
          <AgentFiles agent={agent} />
        </TabsContent>
        <TabsContent value="cron">
          <AgentCronJobs agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
