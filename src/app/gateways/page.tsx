"use client";

import { useCallback } from "react";
import { Wifi, WifiOff, Activity, Monitor, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useGateway } from "@/components/providers/gateway-provider";
import { useGatewayQuery } from "@/hooks/useGatewayQuery";
import { useGatewayEvent } from "@/hooks/useGatewayEvent";
import { adaptHealth, adaptChannel } from "@/lib/gateway/adapters";
import { useConnectionStore } from "@/stores/connectionStore";
import type {
  GatewayHealthResponse,
  ChannelsStatusResponse,
} from "@/lib/gateway";

function ResourceGauge({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" stroke="#F0F0EC" strokeWidth="6" fill="none" />
          <circle
            cx="40" cy="40" r="36"
            stroke="#E8654A"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[var(--content-primary)]">{percentage}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-[var(--content-secondary)]">{label}</span>
      <span className="text-[11px] text-[var(--content-muted)]">
        {value}{unit} / {max}{unit}
      </span>
    </div>
  );
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
    ? adaptHealth(healthQuery.data, connectionState, gatewayUrl)
    : null;

  const channels = (channelsQuery.data?.channels ?? []).map(adaptChannel);

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
                {Math.floor(gw.uptime / 3600)}h {Math.floor((gw.uptime % 3600) / 60)}m
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System resources */}
      {gw && (
        <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
          <h3 className="mb-6 text-base font-semibold text-[var(--content-primary)]">System Resources</h3>
          <div className="flex items-center justify-around">
            <ResourceGauge label="CPU" value={gw.resources.cpu} max={100} unit="%" />
            <ResourceGauge
              label="Memory"
              value={Math.round(gw.resources.memory.used)}
              max={Math.round(gw.resources.memory.total)}
              unit="GB"
            />
            <ResourceGauge
              label="Disk"
              value={Math.round(gw.resources.disk.used)}
              max={Math.round(gw.resources.disk.total)}
              unit="GB"
            />
            <ResourceGauge
              label="Network"
              value={Math.round(gw.resources.network.in)}
              max={2000}
              unit="KB/s"
            />
          </div>
        </div>
      )}

      {/* Channels grid */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-[var(--content-primary)]">Connected Channels</h3>
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
              <p className="mt-3 text-xs text-[var(--content-secondary)]">
                {channel.messageCount.toLocaleString()} messages
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
