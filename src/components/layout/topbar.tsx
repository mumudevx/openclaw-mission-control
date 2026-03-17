"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, Settings, LogOut, Bot, AlertTriangle, Radio, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onSearchClick: () => void;
}

const mockNotifications = [
  {
    id: 1,
    icon: Bot,
    message: "Agent ResearchBot completed task",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    icon: AlertTriangle,
    message: "Cron job Daily Report failed",
    time: "15m ago",
    read: false,
  },
  {
    id: 3,
    icon: Radio,
    message: "Gateway reconnected successfully",
    time: "1h ago",
    read: false,
  },
  {
    id: 4,
    icon: CheckCircle,
    message: "System backup completed",
    time: "3h ago",
    read: true,
  },
];

export function TopBar({ sidebarCollapsed, onSearchClick }: TopBarProps) {
  const router = useRouter();
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-default)] bg-white/80 backdrop-blur-sm px-6 transition-all duration-250"
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--content-muted)]" strokeWidth={1.5} />
        <button
          onClick={onSearchClick}
          className="flex h-10 w-full items-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-bg)] pl-9 pr-3 text-sm text-[var(--content-muted)] text-left transition-colors hover:border-[var(--content-muted)]"
        >
          Search anything... (⌘K)
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-transparent hover:bg-[var(--surface-bg)] transition-colors" />
            }
          >
            <Bell className="h-[18px] w-[18px] text-[var(--content-secondary)]" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-80 pt-1">
            <div className="px-3 pt-2 pb-2 text-sm font-semibold text-[var(--accent-primary)]">
              Notifications
            </div>
            <DropdownMenuSeparator />
            {mockNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <DropdownMenuItem key={notification.id} className="flex items-start gap-3 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-bg)]">
                    <Icon className="h-4 w-4 text-[var(--content-secondary)]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? "text-[var(--content-muted)]" : "text-[var(--content-primary)] font-medium"}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-[var(--content-muted)]">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-primary)]" />
                  )}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-[var(--accent-primary)] font-medium">
              Mark all as read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar / Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="rounded-full outline-none" />
            }
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[var(--accent-light)] text-[var(--accent-primary)] text-sm font-medium">
                U
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-56 pt-1">
            <div className="px-3 pt-2 pb-2">
              <div className="text-sm font-semibold text-[var(--accent-primary)]">User</div>
              <div className="text-xs text-[var(--content-muted)]">user@openclaw.dev</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")} className="gap-2">
              <Settings className="h-4 w-4" strokeWidth={1.5} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-red-600">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
