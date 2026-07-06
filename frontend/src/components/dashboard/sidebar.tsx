"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  Utensils,
  MessageSquare,
  Calendar,
  Bell,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Pin,
  Circle,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

type NavItem = {
  href: string;
  label: string;
  icon: any;
  match?: (p: string) => boolean;
};

type NavGroup = {
  label: string;
  icon: any;
  match?: (p: string) => boolean;
  children: NavItem[];
};

const adminNav: (NavItem | NavGroup)[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  {
    label: "Management", icon: Users,
    match: (p: string) => p.startsWith("/dashboard/clients"),
    children: [
      { href: "/dashboard/clients", label: "All Clients", icon: Circle },
    ],
  },
  { href: "/dashboard/diet-plans", label: "Diet Plans", icon: FileText, match: (p: string) => p === "/dashboard/diet-plans" },
  { href: "/dashboard/updates", label: "Updates", icon: TrendingUp, match: (p: string) => p === "/dashboard/updates" },
  { href: "/dashboard/meal-recalls", label: "Meal Tracking", icon: Utensils, match: (p: string) => p === "/dashboard/meal-recalls" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, match: (p: string) => p === "/dashboard/messages" },
];

const adminBottom: NavItem[] = [
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const clientNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/diet-plans", label: "Diet Plans", icon: FileText, match: (p: string) => p === "/dashboard/diet-plans" },
  { href: "/dashboard/updates", label: "Updates", icon: TrendingUp, match: (p: string) => p === "/dashboard/updates" },
  { href: "/dashboard/meal-recalls", label: "Meal Tracking", icon: Utensils, match: (p: string) => p === "/dashboard/meal-recalls" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, match: (p: string) => p === "/dashboard/messages" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, match: (p: string) => p === "/dashboard/settings" },
];

export function Sidebar({ collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Management"]);

  const collapsed = controlledCollapsed ?? internalCollapsed;
  const toggle = onToggle ?? (() => setInternalCollapsed(!internalCollapsed));

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNav : clientNav;
  const bottomItems = isAdmin ? adminBottom : [];

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem | NavGroup) => {
    if ("match" in item && item.match) return item.match(pathname);
    if ("children" in item) return item.children?.some((c) => isActive(c.href));
    return isActive((item as NavItem).href);
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const renderNavLink = (item: NavItem, collapsedView: boolean) => {
    const active = isActive(item.href);
    return (
      <Tooltip key={item.href} content={collapsedView ? item.label : ""} side="right">
        <Link
          href={item.href}
          className={cn(
            "flex items-center rounded-lg text-sm transition-all duration-200 relative group",
            collapsedView ? "justify-center w-full h-9" : "gap-2.5 px-2.5 py-2",
            active
              ? "text-primary bg-primary/10 font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {active && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
          {!collapsedView && (
            <span className="flex-1 text-left truncate">{item.label}</span>
          )}
        </Link>
      </Tooltip>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 border-r bg-sidebar transition-all duration-200 z-50",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-12 border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center" : "px-3 gap-2.5"
      )}>
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground truncate">NutriSuite</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {navItems.map((item: any) => {
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.label);
            const parentActive = isParentActive(item);
            return (
              <div key={item.label}>
                {collapsed ? (
                  <Tooltip content={item.label} side="right">
                    <button
                      onClick={toggle}
                      className={cn(
                        "flex items-center justify-center w-full h-9 rounded-lg text-sm transition-all duration-200",
                        parentActive
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", parentActive && "text-primary")} />
                    </button>
                  </Tooltip>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 relative group",
                        parentActive
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {parentActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn("h-4 w-4 shrink-0", parentActive && "text-primary")} />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-sidebar-muted shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-5 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-1.5">
                            {item.children.map((child: NavItem) => {
                              const childActive = isActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 relative",
                                    childActive
                                      ? "text-primary bg-primary/10 font-medium"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  {childActive && (
                                    <motion.div
                                      layoutId="sidebar-active"
                                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-primary rounded-full"
                                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                  )}
                                  <div className="size-1 rounded-full bg-sidebar-muted shrink-0" />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            );
          }

          return renderNavLink(item, collapsed);
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border shrink-0">
        {/* Bottom nav items */}
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Tooltip key={item.href} content={collapsed ? item.label : ""} side="right">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg text-sm transition-all duration-200",
                  collapsed ? "justify-center h-9 mx-2" : "gap-2.5 px-3 py-1.5",
                  active
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bottom"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </Tooltip>
          );
        })}

        {/* Theme toggle */}
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center h-9 mx-2" : "justify-between px-3 py-1.5"
        )}>
          {!collapsed && <span className="text-xs text-sidebar-muted">Theme</span>}
          <ThemeToggle />
        </div>

        {/* User area + collapse toggle */}
        <div className={cn(
          "flex items-center border-t border-sidebar-border",
          collapsed ? "flex-col py-2 gap-1" : "gap-2 px-2 py-2"
        )}>
          {/* Logout - always visible */}
          <Tooltip content={collapsed ? "Log out" : ""} side="right">
            <button
              onClick={() => { logout(); }}
              className={cn(
                "flex items-center justify-center rounded-lg text-sidebar-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0",
                collapsed ? "h-8 w-8" : "h-7 w-7"
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </Tooltip>

          {/* Collapse toggle - always visible */}
          <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
            <button
              onClick={toggle}
              className={cn(
                "flex items-center justify-center rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0",
                collapsed ? "h-8 w-8" : "h-7 w-7"
              )}
            >
              <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
            </button>
          </Tooltip>

          {!collapsed && (
            <>
              <div className="flex-1" />
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 max-w-[80px]">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-sidebar-muted truncate capitalize">{user?.role}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
