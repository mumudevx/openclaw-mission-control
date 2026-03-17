"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navItems, bottomNavItems } from "@/lib/constants/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
}

export function Sidebar({ collapsed, onToggle, mobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const isMobileMode = mobileOpen !== undefined;
  const isVisible = isMobileMode ? mobileOpen : true;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border-default)] bg-[var(--surface-card)] transition-all duration-250",
        collapsed ? "w-16" : "w-60",
        isMobileMode && !isVisible && "-translate-x-full",
        isMobileMode && isVisible && "translate-x-0 w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--border-default)] px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white font-bold text-sm">
          OC
        </div>
        {(!collapsed || isMobileMode) && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-[var(--content-primary)] truncate">
              OpenClaw
            </span>
            <span className="text-[11px] text-[var(--content-muted)] truncate">
              Mission Control
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                onClick={isMobileMode ? onToggle : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--accent-light)] text-[var(--accent-primary)] border-l-[3px] border-[var(--accent-primary)]"
                    : "text-[var(--content-secondary)] hover:bg-[var(--surface-bg)] hover:text-[var(--content-primary)]",
                  collapsed && !isMobileMode && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {(!collapsed || isMobileMode) && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (collapsed && !isMobileMode) {
              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger render={<span />}>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.href}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border-default)] px-2 py-3">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobileMode ? onToggle : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent-light)] text-[var(--accent-primary)]"
                  : "text-[var(--content-secondary)] hover:bg-[var(--surface-bg)] hover:text-[var(--content-primary)]",
                collapsed && !isMobileMode && "justify-center px-0"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              {(!collapsed || isMobileMode) && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse toggle - only on desktop */}
        {!isMobileMode && (
          <button
            onClick={onToggle}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--content-muted)] hover:bg-[var(--surface-bg)] hover:text-[var(--content-primary)] transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
