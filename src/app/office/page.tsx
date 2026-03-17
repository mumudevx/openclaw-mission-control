"use client";

import { PageHeader } from "@/components/shared/page-header";
import { mockAgents } from "@/lib/mock/data";
import { Bot, Zap, Coffee, AlertTriangle, WifiOff } from "lucide-react";

const stateIcons = {
  active: Zap,
  idle: Coffee,
  error: AlertTriangle,
  offline: WifiOff,
};

const stateColors = {
  active: "bg-emerald-400",
  idle: "bg-amber-400",
  error: "bg-red-400",
  offline: "bg-gray-400",
};

const badgeBgColors = {
  active: "bg-emerald-50",
  idle: "bg-amber-50",
  error: "bg-red-50",
  offline: "bg-gray-100",
};

const iconColors = {
  active: "text-emerald-600",
  idle: "text-amber-600",
  error: "text-red-600",
  offline: "text-gray-400",
};

const deskPositions = [
  { x: 120, y: 80 },
  { x: 320, y: 80 },
  { x: 520, y: 80 },
  { x: 720, y: 80 },
  { x: 120, y: 260 },
  { x: 320, y: 260 },
  { x: 520, y: 260 },
  { x: 720, y: 260 },
];

export default function OfficePage() {
  const agents = mockAgents;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Office"
        description="Your AI agents' virtual workspace"
      />

      {/* Stats bar */}
      <div className="flex items-center gap-6 rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] px-6 py-3 shadow-card">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[var(--content-secondary)]">Active:</span>
          <span className="font-semibold text-[var(--content-primary)]">
            {agents.filter((a) => a.status === "active").length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[var(--content-secondary)]">Idle:</span>
          <span className="font-semibold text-[var(--content-primary)]">
            {agents.filter((a) => a.status === "idle").length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-[var(--content-secondary)]">Error:</span>
          <span className="font-semibold text-[var(--content-primary)]">
            {agents.filter((a) => a.status === "error").length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="text-[var(--content-secondary)]">Offline:</span>
          <span className="font-semibold text-[var(--content-primary)]">
            {agents.filter((a) => a.status === "offline").length}
          </span>
        </div>
      </div>

      {/* Pixel office */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] shadow-card overflow-hidden">
        <div className="relative h-[480px] bg-[#F8F6F1]" style={{ imageRendering: "pixelated" }}>
          {/* Floor pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, #000 0px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #000 0px, transparent 1px, transparent 32px)",
          }} />

          {/* Desks and agents */}
          {agents.slice(0, 8).map((agent, i) => {
            const pos = deskPositions[i];
            const StateIcon = stateIcons[agent.status as keyof typeof stateIcons] || Bot;
            const statusColor = stateColors[agent.status as keyof typeof stateColors] || "bg-gray-400";
            const badgeBg = badgeBgColors[agent.status as keyof typeof badgeBgColors] || "bg-gray-100";
            const iconColor = iconColors[agent.status as keyof typeof iconColors] || "text-gray-400";

            return (
              <div
                key={agent.id}
                className="absolute cursor-pointer group"
                style={{ left: pos.x, top: pos.y }}
              >
                {/* Desk */}
                <div className="h-20 w-32 rounded-lg border-2 border-[#D4C9B8] bg-[#E8DFD0] shadow-sm">
                  {/* Monitor */}
                  <div className="mx-auto mt-2 h-10 w-16 rounded-sm border border-[#BEBEBE] bg-[#333] flex items-center justify-center">
                    <div className={`h-1.5 w-1.5 rounded-full ${statusColor} ${agent.status === "active" ? "animate-pulse" : ""}`} />
                  </div>
                  {/* Keyboard */}
                  <div className="mx-auto mt-1 h-2 w-12 rounded-[1px] bg-[#BEBEBE]" />
                </div>

                {/* Agent sprite */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-md ${badgeBg}`}>
                    <StateIcon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.5} />
                  </div>
                  <span className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[var(--content-primary)] shadow-sm">
                    {agent.name}
                  </span>
                </div>

                {/* Activity bubble */}
                {agent.status === "active" && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="rounded-lg bg-[var(--surface-card)] px-2 py-1 text-[9px] font-medium text-[var(--content-secondary)] shadow-md border border-[var(--border-default)]">
                      Working...
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Decorations */}
          <div className="absolute bottom-4 left-4 text-4xl opacity-30">🪴</div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-30">🪴</div>
          <div className="absolute top-4 right-4 text-2xl opacity-20">📋</div>
        </div>
      </div>
    </div>
  );
}
