"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ icon: Icon, label, value, trend, className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <div
      className={cn(
        "rounded-card border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-card transition-shadow hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)]">
        <Icon className="h-5 w-5 text-[var(--accent-primary)]" strokeWidth={1.5} />
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--content-secondary)]">
        {label}
      </p>

      <p className="mt-1 text-[28px] font-bold leading-tight text-[var(--content-primary)]">
        {value}
      </p>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--status-success)]" strokeWidth={2} />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--status-error)]" strokeWidth={2} />
          )}
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-[var(--status-success)]" : "text-[var(--status-error)]"
            )}
          >
            {isPositive ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-[var(--content-muted)]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
