"use client";

import { useCallback } from "react";
import { Wifi, WifiOff, Monitor, Bot, MessageSquare, Radio, Timer, Tag, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGateway } from "@/components/providers/gateway-provider";
import { useGatewayQuery } from "@/hooks/useGatewayQuery";
import { useGatewayEvent } from "@/hooks/useGatewayEvent";
import { adaptHealth, adaptChannelsFromStatus } from "@/lib/gateway/adapters";
import { gateway } from "@/lib/gateway";
import { useConnectionStore } from "@/stores/connectionStore";
import type {
  GatewayHealthResponse,
  ChannelsStatusResponse,
} from "@/lib/gateway";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-card)] p-4 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-light)]">
        <Icon className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[var(--content-primary)]">{value}</p>
        <p className="text-xs text-[var(--content-secondary)]">{label}</p>
        {sub && <p className="text-[11px] text-[var(--content-muted)]">{sub}</p>}
      </div>
    </div>
  );
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function GatewaysPage() {
  const { connectionState } = useGateway();
  const gatewayUrl = useConnectionStore((s) => s.gatewayUrl);

  const healthQuery = useGatewayQuery<undefined, GatewayHealthResponse>("health");
  const channelsQuery = useGatewayQuery<undefined, ChannelsStatusResponse>("channels.status");

  // Subscribe to health events for real-time updates
  const handleHealthEvent = useCallback(() => {
    healthQuery.refetch();
  }, [healthQuery.refetch]); // eslint-disable-line react-hooks/exhaustive-deps
  useGatewayEvent("health", handleHealthEvent);

  const isLoading = healthQuery.isLoading || channelsQuery.isLoading;

  const gw = healthQuery.data
    ? adaptHealth(healthQuery.data, connectionState, gatewayUrl, gateway.serverInfo, gateway.snapshot)
    : null;

  const channels = channelsQuery.data
    ? adaptChannelsFromStatus(channelsQuery.data)
    : [];

  const isConnected = connectionState === "connected";

  if (isLoading && !gw) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gateway" description="Monitor and manage your OpenClaw Gateway connection" />

      {/* Status hero */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-4 md:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isConnected ? "bg-emerald-50" : "bg-red-50"}`}>
              {isConnected ? (
                <Wifi className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
              ) : (
                <WifiOff className="h-7 w-7 text-red-600" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[var(--content-primary)]">
                  {isConnected ? "Connected" : connectionState === "reconnecting" ? "Reconnecting..." : "Disconnected"}
                </h2>
                <StatusBadge status={isConnected ? "active" : connectionState === "reconnecting" ? "idle" : "error"} />
              </div>
              <p className="mt-1 text-sm text-[var(--content-secondary)]">{gatewayUrl}</p>
            </div>
          </div>
          {gw && (
            <div className="text-right">
              <p className="text-sm text-[var(--content-secondary)]">Uptime</p>
              <p className="text-lg font-semibold text-[var(--content-primary)]">
                {gw.uptime > 0 ? formatUptime(gw.uptime) : "-"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gateway stats */}
      {gw && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard icon={Bot} label="Agents" value={gw.stats.agentCount} />
          <StatCard icon={MessageSquare} label="Sessions" value={gw.stats.sessionCount} />
          <StatCard icon={Radio} label="Channels" value={gw.stats.channelCount} />
          <StatCard
            icon={Timer}
            label="Heartbeat"
            value={gw.stats.heartbeatSeconds > 0 ? `${gw.stats.heartbeatSeconds}s` : "-"}
          />
          <StatCard
            icon={Tag}
            label="Version"
            value={gw.version}
          />
        </div>
      )}

      {/* Channels grid */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">Connected Channels</h3>
        {channels.length === 0 ? (
          <p className="text-sm text-[var(--content-muted)]">No channels configured</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
                      <Monitor className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--content-primary)]">{channel.name}</p>
                      <p className="text-xs text-[var(--content-muted)] capitalize">{channel.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={channel.status === "active" ? "active" : "offline"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
