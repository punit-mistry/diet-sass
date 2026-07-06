"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Bell, CheckCheck, Filter, Trash2, Clock, Weight,
  MessageSquare, FileText, Activity, UserPlus, Calendar,
} from "lucide-react";
import { toast } from "sonner";

const allNotifications = [
  { id: "1", type: "update", title: "New update from John Doe", description: "Weight: 75.5 kg, Mood: Good", time: "2 min ago", unread: true },
  { id: "2", type: "plan", title: "Diet plan assigned", description: "Keto Plan assigned to Sarah Wilson", time: "1 hour ago", unread: true },
  { id: "3", type: "message", title: "New message from Mike", description: "Hi, I have a question about my meal plan...", time: "3 hours ago", unread: false },
  { id: "4", type: "review", title: "Review needed", description: "3 weekly updates pending your review", time: "5 hours ago", unread: false },
  { id: "5", type: "client", title: "New client registered", description: "Emily Davis has joined the platform", time: "1 day ago", unread: false },
  { id: "6", type: "appointment", title: "Appointment reminder", description: "Follow-up with John tomorrow at 10:00 AM", time: "1 day ago", unread: false },
  { id: "7", type: "update", title: "Weight update from Jane", description: "Jane's weight: 68.2 kg (-1.3 kg this week)", time: "2 days ago", unread: false },
];

const typeIcons: Record<string, any> = {
  update: Weight, plan: FileText, message: MessageSquare,
  review: Activity, client: UserPlus, appointment: Calendar,
};

const typeColors: Record<string, string> = {
  update: "text-primary bg-primary/10",
  plan: "text-secondary bg-secondary/10",
  message: "text-warning bg-warning/10",
  review: "text-success bg-success/10",
  client: "text-success bg-success/10",
  appointment: "text-primary bg-primary/10",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState<string>("all");

  const filtered = notifications.filter((n) => filter === "all" || n.type === filter);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "No unread notifications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "update", label: "Updates" },
          { value: "plan", label: "Diet Plans" },
          { value: "message", label: "Messages" },
          { value: "review", label: "Reviews" },
          { value: "client", label: "Clients" },
          { value: "appointment", label: "Appointments" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/60 mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          filtered.map((notif, i) => {
            const Icon = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || "text-muted-foreground bg-muted";
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={cn("transition-colors", notif.unread && "border-primary/30 bg-primary/[0.02]")}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={cn("p-2 rounded-xl shrink-0", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm", notif.unread && "font-medium")}>{notif.title}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {notif.unread && <span className="size-2 rounded-full bg-primary" />}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{notif.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
