"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useConnectionStore } from "@/stores/connectionStore";
import { SetupWizard } from "@/components/setup/setup-wizard";

export function SetupGuard({ children }: { children: ReactNode }) {
  const setupCompleted = useConnectionStore((s) => s.setupCompleted);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand persist to hydrate from localStorage
    const unsub = useConnectionStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. fast load)
    if (useConnectionStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) {
    return null;
  }

  if (!setupCompleted) {
    return <SetupWizard />;
  }

  return <>{children}</>;
}
