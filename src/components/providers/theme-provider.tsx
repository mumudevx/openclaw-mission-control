"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  // Sync theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("openclaw-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, [setTheme]);

  // Apply .dark class to <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("openclaw-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
