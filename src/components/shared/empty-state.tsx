"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-primary)]/10">
        <Icon className="h-6 w-6 text-[var(--accent-primary)]" strokeWidth={1.5} />
      </div>
      <h3 className="mt-3 text-sm font-medium text-[var(--content-primary)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--content-muted)]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-btn bg-[var(--accent-primary)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
