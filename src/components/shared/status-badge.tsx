import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "idle" | "error" | "offline" | "neutral" | "running" | "paused" | "failed";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  idle: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  offline: "bg-gray-100 text-gray-500 border-gray-200",
  neutral: "bg-[var(--surface-bg)] text-[var(--content-secondary)] border-[var(--border-default)]",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  paused: "bg-orange-50 text-orange-700 border-orange-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

const pulseVariants: BadgeVariant[] = ["active", "running"];

interface StatusBadgeProps {
  status: BadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[status],
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" || status === "running" ? "bg-current" : "bg-current opacity-60",
          pulseVariants.includes(status) && "animate-pulse"
        )}
      />
      {displayLabel}
    </span>
  );
}
