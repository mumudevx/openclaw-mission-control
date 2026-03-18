"use client";

import {
  Wrench,
  FileEdit,
  Brain,
  RefreshCw,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Agent, AgentActivity as AgentActivityType, ActivityType } from "@/types";

const activityConfig: Record<
  ActivityType,
  { icon: typeof Wrench; iconColor: string; bgColor: string }
> = {
  tool_call: { icon: Wrench, iconColor: "text-blue-500", bgColor: "bg-blue-50" },
  file_operation: { icon: FileEdit, iconColor: "text-green-500", bgColor: "bg-green-50" },
  reasoning: { icon: Brain, iconColor: "text-purple-500", bgColor: "bg-purple-50" },
  status_change: { icon: RefreshCw, iconColor: "text-amber-500", bgColor: "bg-amber-50" },
  task_update: { icon: CheckSquare, iconColor: "text-teal-500", bgColor: "bg-teal-50" },
  error: { icon: AlertCircle, iconColor: "text-red-500", bgColor: "bg-red-50" },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AgentActivity({ agent }: { agent: Agent }) {
  // TODO: Wire to gateway RPC when agent.activities endpoint is available
  const activities: AgentActivityType[] = [];

  return (
    <div className="p-5 space-y-1">
      {activities.length === 0 && (
        <p className="text-sm text-[var(--content-muted)] text-center py-8">
          No recent activity
        </p>
      )}
      {activities.map((activity) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--surface-bg)]"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
            >
              <Icon className={`h-4 w-4 ${config.iconColor}`} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--content-primary)]">
                {activity.description}
              </p>
              <p className="text-[11px] text-[var(--content-muted)] mt-0.5">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
