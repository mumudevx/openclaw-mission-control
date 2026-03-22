"use client";

import { Bot, MessageSquare, Activity, BarChart3, FileText, Sparkles, Trash2, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { AgentChat } from "./agent-chat";
import { AgentActivity } from "./agent-activity";
import { AgentStats } from "./agent-stats";
import { AgentFiles } from "./agent-files";
import { AgentSkills } from "./agent-skills";
import type { Agent } from "@/types";

interface AgentDetailSheetProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (agent: Agent) => void;
}

export function AgentDetailSheet({
  agent,
  open,
  onOpenChange,
  onDelete,
}: AgentDetailSheetProps) {
  if (!agent) return null;

  const statusMap: Record<string, "active" | "idle" | "offline"> = {
    active: "active",
    idle: "idle",
    offline: "offline",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={true}
        className="w-[var(--sheet-width-wide)] max-w-[90vw] sm:!max-w-none p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">{agent.name} Details</SheetTitle>
        <SheetDescription className="sr-only">
          View details and interact with {agent.name}
        </SheetDescription>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-divider)] px-5 py-4 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
            {agent.identity?.emoji ? (
              <span className="text-lg">{agent.identity.emoji}</span>
            ) : (
              <Bot className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[var(--content-primary)] truncate">
                {agent.name}
              </h2>
              {agent.isDefault && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
              )}
              <StatusBadge status={statusMap[agent.status] || "offline"} />
            </div>
            <p className="text-xs text-[var(--content-muted)] font-mono">
              {agent.id}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {onDelete && (
              <button
                onClick={() => onDelete(agent)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--content-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
          <TabsList variant="line" className="px-5 pt-1">
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" strokeWidth={1.5} />
              Activity
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Stats
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
              Skills
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 min-h-0">
            <AgentChat key={agent.id} agent={agent} />
          </TabsContent>
          <TabsContent value="activity" className="flex-1 overflow-y-auto">
            <AgentActivity agent={agent} />
          </TabsContent>
          <TabsContent value="stats" className="flex-1 overflow-y-auto">
            <AgentStats agent={agent} />
          </TabsContent>
          <TabsContent value="skills" className="flex-1 overflow-y-auto">
            <AgentSkills agent={agent} />
          </TabsContent>
          <TabsContent value="files" className="flex-1 overflow-y-auto">
            <AgentFiles agent={agent} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
