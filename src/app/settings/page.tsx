"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUIStore } from "@/stores/uiStore";
import { useConnectionStore } from "@/stores/connectionStore";
import { useGateway } from "@/components/providers/gateway-provider";

export default function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const gatewayUrl = useConnectionStore((s) => s.gatewayUrl);
  const gatewayToken = useConnectionStore((s) => s.gatewayToken);
  const mockMode = useConnectionStore((s) => s.mockMode);
  const setGatewayUrl = useConnectionStore((s) => s.setGatewayUrl);
  const setGatewayToken = useConnectionStore((s) => s.setGatewayToken);
  const setMockMode = useConnectionStore((s) => s.setMockMode);

  const { connectionState, reconnect } = useGateway();
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    reconnect();
    // Give it a moment to connect
    await new Promise((r) => setTimeout(r, 2000));
    setTesting(false);
    if (connectionState === "connected") {
      toast.success("Connection successful");
    } else {
      toast.error("Connection failed — check URL and token");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Configure your Mission Control preferences" />

      {/* Gateway connection */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h3 className="text-base font-semibold text-[var(--content-primary)]">Gateway Connection</h3>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">Configure the OpenClaw Gateway connection</p>

        {/* Connection status */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              connectionState === "connected"
                ? "bg-emerald-500"
                : connectionState === "reconnecting" || connectionState === "connecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-500"
            }`}
          />
          <span className="text-sm text-[var(--content-secondary)] capitalize">
            {connectionState}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">Gateway URL</label>
            <Input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="ws://localhost:18789"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">Gateway Token</label>
            <Input
              type="password"
              value={gatewayToken}
              onChange={(e) => setGatewayToken(e.target.value)}
              placeholder="Enter gateway token"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--content-primary)]">Mock Mode</p>
              <p className="text-xs text-[var(--content-muted)]">Use mock data instead of live gateway</p>
            </div>
            <Switch
              checked={mockMode}
              onCheckedChange={(checked) => {
                setMockMode(checked);
                toast.success(checked ? "Mock mode enabled" : "Mock mode disabled — will connect to gateway");
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing || mockMode}
              className="flex items-center gap-2 rounded-btn bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionState === "connected" ? (
                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <XCircle className="h-4 w-4" strokeWidth={1.5} />
              )}
              Test Connection
            </button>
            <button
              onClick={reconnect}
              className="rounded-btn border border-[var(--border-default)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
            >
              Reconnect
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h3 className="text-base font-semibold text-[var(--content-primary)]">Appearance</h3>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">Customize the look and feel</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--content-primary)]">Dark Mode</p>
              <p className="text-xs text-[var(--content-muted)]">Switch between light and dark theme</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h3 className="text-base font-semibold text-[var(--content-primary)]">Notifications</h3>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">Manage notification preferences</p>
        <div className="mt-4 space-y-3">
          {["Agent errors", "Task completions", "Cron failures", "Gateway status changes"].map((item) => (
            <div key={item} className="flex items-center justify-between py-1">
              <span className="text-sm text-[var(--content-primary)]">{item}</span>
              <div className="h-6 w-11 rounded-full bg-[var(--accent-primary)] relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
