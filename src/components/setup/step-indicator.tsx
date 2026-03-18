"use client";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i < currentStep
              ? "bg-[var(--accent-primary)]"
              : i === currentStep
                ? "bg-[var(--accent-primary)]"
                : "bg-[var(--border-default)]"
          }`}
        />
      ))}
    </div>
  );
}
