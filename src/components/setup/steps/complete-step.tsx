"use client";

import { CheckCircle } from "lucide-react";
import type { ServerInfo } from "@/lib/gateway";

interface CompleteStepProps {
  serverInfo: ServerInfo;
  onFinish: () => void;
}

export function CompleteStep({ serverInfo, onFinish }: CompleteStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <CheckCircle className="h-16 w-16 text-[var(--accent-primary)]" strokeWidth={1.5} />
      <h1 className="mt-6 text-2xl font-bold text-[var(--content-primary)]">
        You&apos;re all set!
      </h1>
      <p className="mt-2 text-sm text-[var(--content-secondary)]">
        Your gateway is connected and ready to go
      </p>

      <div className="mt-6 w-full max-w-xs rounded-xl bg-[var(--surface-bg)] p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--content-muted)]">Server</span>
            <span className="font-medium text-[var(--content-primary)]">{serverInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--content-muted)]">Version</span>
            <span className="font-medium text-[var(--content-primary)]">{serverInfo.version}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="mt-8 rounded-btn bg-[var(--accent-primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
