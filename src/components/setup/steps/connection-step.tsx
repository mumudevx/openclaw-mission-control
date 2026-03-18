"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ConnectionStepProps {
  url: string;
  token: string;
  onUrlChange: (url: string) => void;
  onTokenChange: (token: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ConnectionStep({
  url,
  token,
  onUrlChange,
  onTokenChange,
  onBack,
  onNext,
}: ConnectionStepProps) {
  const [urlError, setUrlError] = useState("");

  const handleNext = () => {
    if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
      setUrlError("URL must start with ws:// or wss://");
      return;
    }
    setUrlError("");
    onNext();
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--content-primary)]">
          Connection Details
        </h2>
        <p className="mt-1 text-sm text-[var(--content-secondary)]">
          Enter your OpenClaw Gateway connection information
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">
              Gateway URL
            </label>
            <Input
              value={url}
              onChange={(e) => {
                onUrlChange(e.target.value);
                if (urlError) setUrlError("");
              }}
              placeholder="ws://localhost:18789"
              className="mt-1.5 rounded-xl border-[var(--border-default)] font-mono text-sm"
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-500">{urlError}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--content-primary)]">
              Gateway Token
            </label>
            <Input
              type="password"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="Paste your gateway token"
              className="mt-1.5 rounded-xl border-[var(--border-default)]"
            />
            <p className="mt-1 text-xs text-[var(--content-muted)]">
              Leave empty if your gateway doesn&apos;t require authentication
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            className="rounded-btn border border-[var(--border-default)] bg-[var(--surface-card)] px-5 py-2.5 text-sm font-medium text-[var(--content-secondary)] transition-colors hover:bg-[var(--surface-bg)]"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!url.trim()}
            className="rounded-btn bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
