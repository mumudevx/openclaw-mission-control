"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (e.matches) {
        setSidebarCollapsed(false);
        setMobileOpen(false);
      }
    };
    onChange(mq);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-[var(--surface-bg)]">
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={() => {
          if (isMobile) setMobileOpen(false);
          else setSidebarCollapsed(!sidebarCollapsed);
        }}
        mobileOpen={isMobile ? mobileOpen : undefined}
      />

      <TopBar
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        onSearchClick={() => setCommandPaletteOpen(true)}
        onMenuClick={() => setMobileOpen(true)}
        isMobile={isMobile}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      <main
        className="pt-16 transition-all duration-250"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
