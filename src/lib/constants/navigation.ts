import {
  LayoutDashboard,
  Radio,
  Bot,
  ScrollText,
  Building2,
  Clock,
  Calendar,
  KanbanSquare,
  Settings,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gateways", label: "Gateway", icon: Radio },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/office", label: "Team Office", icon: Building2 },
  { href: "/cron", label: "Cron Jobs", icon: Clock },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: KanbanSquare },
];

export const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];
