"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Bell,
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  ChevronDown,
  PanelLeft,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "admin";

  const notifications = isAdmin
    ? [
        { id: "1", title: "New update from John", description: "Weight: 75.5 kg", time: "2 min ago", unread: true },
        { id: "2", title: "Diet plan assigned", description: "Keto plan → Sarah", time: "1 hour ago", unread: true },
        { id: "3", title: "Meal recall submitted", description: "Breakfast logged by Mike", time: "3 hours ago", unread: false },
        { id: "4", title: "Review needed", description: "3 updates pending review", time: "5 hours ago", unread: false },
      ]
    : [
        { id: "1", title: "New message from nutritionist", description: "Check your latest feedback", time: "2 hours ago", unread: true },
        { id: "2", title: "Diet plan updated", description: "Your meal plan has been revised", time: "1 day ago", unread: false },
        { id: "3", title: "Reminder", description: "Submit your weekly update", time: "2 days ago", unread: false },
      ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const quickActions = isAdmin
    ? [
        { icon: Plus, label: "Add Client", href: "/dashboard/clients", desc: "Create a new client account" },
        { icon: Plus, label: "Create Diet Plan", href: "/dashboard/diet-plans", desc: "Upload a new diet plan" },
        { icon: MessageSquare, label: "Send Message", href: "/dashboard/messages", desc: "Message a client" },
        { icon: Calendar, label: "Schedule", href: "/dashboard/calendar", desc: "Schedule an appointment" },
      ]
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 flex items-center gap-4">
          <CommandPalette />
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Actions (admin only) */}
          {isAdmin && (
            <div className="relative" ref={quickRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuickOpen(!quickOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <AnimatePresence>
                {quickOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-popover p-1.5 shadow-premium-lg"
                  >
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick Actions</div>
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() => setQuickOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <action.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-muted-foreground hover:text-foreground relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-popover shadow-premium-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="text-sm font-semibold">Notifications</span>
                    <Button variant="ghost" size="xs" className="text-xs text-muted-foreground">Mark all read</Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0",
                          notif.unread && "bg-primary/5"
                        )}
                      >
                        <div className={cn("mt-1 size-2 rounded-full shrink-0", notif.unread ? "bg-primary" : "bg-muted-foreground/30")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-sm truncate", notif.unread && "font-medium")}>{notif.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/dashboard/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-2.5 text-sm text-center text-primary hover:bg-muted/50 transition-colors border-t font-medium"
                  >
                    View all notifications
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
            >
              <Avatar className="size-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover p-1.5 shadow-premium-lg"
                >
                  <div className="px-2 py-2 border-b mb-1">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); router.push("/login"); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent transition-colors text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
