"use client";

import { PageHeader } from "@/components/shared/page-header";
import { mockAgents } from "@/lib/mock/data";
import dynamic from "next/dynamic";

const OfficeCanvas = dynamic(() => import("@/components/office/office-canvas").then((m) => m.OfficeCanvas), { ssr: false });

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

      {/* Canvas office */}
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] shadow-card overflow-hidden">
        <OfficeCanvas agents={agents} width={900} height={480} />
      </div>
    </div>
  );
}
