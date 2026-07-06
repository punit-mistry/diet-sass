"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Utensils,
  MessageSquare,
  Settings,
  Search,
  Command,
} from "lucide-react";

const clientPages = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FileText, label: "Diet Plans", href: "/dashboard/diet-plans" },
  { icon: TrendingUp, label: "Updates", href: "/dashboard/updates" },
  { icon: Utensils, label: "Meal Tracking", href: "/dashboard/meal-recalls" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const adminActions = [
  { icon: TrendingUp, label: "Add Client", href: "/dashboard/clients" },
  { icon: FileText, label: "Create Diet Plan", href: "/dashboard/diet-plans" },
  { icon: MessageSquare, label: "Send Message", href: "/dashboard/messages" },
];

const adminPages = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Clients", href: "/dashboard/clients" },
  { icon: FileText, label: "Diet Plans", href: "/dashboard/diet-plans" },
  { icon: TrendingUp, label: "Updates", href: "/dashboard/updates" },
  { icon: Utensils, label: "Meal Tracking", href: "/dashboard/meal-recalls" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border rounded-lg hover:bg-muted transition-colors w-full max-w-xs"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-background border rounded select-none">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {isAdmin && (
            <>
              <CommandGroup heading="Quick Actions">
                {adminActions.map((action) => (
                  <CommandItem
                    key={action.href}
                    onSelect={() => handleSelect(action.href)}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          <CommandGroup heading="Pages">
            {(isAdmin ? adminPages : clientPages).map((page) => (
              <CommandItem
                key={page.href}
                onSelect={() => handleSelect(page.href)}
              >
                <page.icon className="mr-2 h-4 w-4" />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
