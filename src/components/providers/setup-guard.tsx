"use client";

import { type ReactNode } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { SetupWizard } from "@/components/setup/setup-wizard";

export function SetupGuard({ children }: { children: ReactNode }) {
  const setupCompleted = useConnectionStore((s) => s.setupCompleted);

  if (!setupCompleted) {
    return <SetupWizard />;
  }

  return <>{children}</>;
}
