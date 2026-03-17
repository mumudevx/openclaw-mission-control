"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUIStore } from "@/stores/uiStore";

export default function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Configure your Mission Control preferences" />

      {/* Gateway connection */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h3 className="text-base font-semibold text-[var(--content-primary)]">Gateway Connection</h3>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">Configure the OpenClaw Gateway connection</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">Gateway URL</label>
            <Input
              defaultValue="http://localhost:3100"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">WebSocket URL</label>
            <Input
              defaultValue="ws://localhost:3100/ws"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
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
