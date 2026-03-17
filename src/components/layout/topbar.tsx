"use client";

import { useRouter } from "next/navigation";
import { Bell, Search, Settings, LogOut, Sun, Moon, CheckCircle2, AlertTriangle, Info, AlertOctagon, X, Menu } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useNotificationStore, type NotificationType } from "@/stores/notificationStore";
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
  sidebarWidth: number;
  onSearchClick: () => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const typeIcons: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const typeColors: Record<NotificationType, string> = {
  success: "text-[var(--status-success)]",
  error: "text-[var(--status-error)]",
  warning: "text-[var(--status-warning)]",
  info: "text-[var(--status-info)]",
};

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TopBar({ sidebarWidth, onSearchClick, onMenuClick, isMobile }: TopBarProps) {
  const router = useRouter();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const dismiss = useNotificationStore((s) => s.dismiss);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-default)] bg-[var(--surface-card)]/80 backdrop-blur-sm px-4 md:px-6 transition-all duration-250"
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu button */}
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] hover:bg-[var(--surface-bg)] transition-colors shrink-0"
          >
            <Menu className="h-[18px] w-[18px] text-[var(--content-secondary)]" strokeWidth={1.5} />
          </button>
        )}

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
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-default)] bg-transparent hover:bg-[var(--surface-bg)] transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px] text-[var(--content-secondary)]" strokeWidth={1.5} />
          ) : (
            <Moon className="h-[18px] w-[18px] text-[var(--content-secondary)]" strokeWidth={1.5} />
          )}
        </button>

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
            <div className="flex items-center justify-between px-3 pt-2 pb-2">
              <span className="text-sm font-semibold text-[var(--accent-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium text-[var(--content-muted)] bg-[var(--surface-bg)] px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[var(--content-muted)]">
                No notifications
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => {
                  const Icon = typeIcons[notification.type];
                  const color = typeColors[notification.type];
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex items-start gap-3 px-3 py-2.5"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-bg)]">
                        <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.read ? "text-[var(--content-muted)]" : "text-[var(--content-primary)] font-medium"}`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-[var(--content-muted)] truncate">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-[10px] text-[var(--content-muted)] mt-0.5">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notification.id);
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded text-[var(--content-muted)] hover:text-[var(--content-primary)] hover:bg-[var(--surface-bg)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-xs text-[var(--accent-primary)] font-medium"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </DropdownMenuItem>
              </>
            )}
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
