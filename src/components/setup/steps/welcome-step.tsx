"use client";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
        <span className="text-xl font-bold text-white">OC</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[var(--content-primary)]">
        OpenClaw Mission Control
      </h1>
      <p className="mt-2 text-sm text-[var(--content-secondary)]">
        The command center for your AI agent army
      </p>
      <button
        onClick={onNext}
        className="mt-8 rounded-btn bg-[var(--accent-primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Get Started
      </button>
    </div>
  );
}
