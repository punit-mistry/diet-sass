"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import type { WeeklyUpdate, MealRecall, DietPlan, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  Users, UserPlus, ClipboardList, Activity, Bell, MessageSquare,
  Calendar, Weight, TrendingUp, TrendingDown, Smile, Zap,
  Plus, ArrowRight, Clock, CheckCircle2, FileText, Utensils,
  Dumbbell, Droplets, Flame, Apple,
} from "lucide-react";

const moodColors: Record<string, string> = { excellent: "#10B981", good: "#6C63FF", okay: "#F59E0B", poor: "#F97316", terrible: "#EF4444" };
const moodLabels: Record<string, string> = { excellent: "Excellent", good: "Good", okay: "Okay", poor: "Poor", terrible: "Terrible" };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <ClientDashboard />;
}

function StatCard({ title, value, icon: Icon, trend, color, loading }: {
  title: string; value: string | number; icon: any; trend?: { value: string; positive: boolean }; color: string; loading?: boolean;
}) {
  const colors: Record<string, string> = {
    primary: "from-primary/10 to-primary/5 text-primary border-primary/20",
    secondary: "from-secondary/10 to-secondary/5 text-secondary border-secondary/20",
    success: "from-success/10 to-success/5 text-success border-success/20",
    warning: "from-warning/10 to-warning/5 text-warning border-warning/20",
    danger: "from-danger/10 to-danger/5 text-danger border-danger/20",
  };

  return (
    <motion.div variants={itemVariants} className="card-hover">
      <Card className={cn("overflow-hidden border", colors[color]?.split(" ").slice(-1)[0] || "border-border")}>
        <CardContent className="p-5">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">{value}</span>
                  {trend && (
                    <span className={cn("flex items-center text-xs font-medium", trend.positive ? "text-success" : "text-danger")}>
                      {trend.positive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {trend.value}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", colors[color]?.split(" ").slice(0, 2).join(" ") || "")}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ClientDashboard() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Track your health and nutrition progress</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Weight" value="-- kg" icon={Weight} color="primary" />
        <StatCard title="Diet Plans" value="--" icon={FileText} color="secondary" />
        <StatCard title="Unread Messages" value="--" icon={MessageSquare} color="warning" />
        <StatCard title="Today's Calories" value="-- kcal" icon={Flame} color="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Your latest health updates and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start tracking your meals and updates to see your progress here.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/users?role=client&limit=100").then((r) => r.data.users),
      api.get("/updates?limit=50").then((r) => r.data.updates),
      api.get("/diet-plans").then((r) => r.data.dietPlans),
    ])
      .then(([clientsData, updatesData, plansData]) => {
        setClients(clientsData);
        setUpdates(updatesData);
        setDietPlans(plansData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c: any) => c.isActive).length;
    const pendingReviews = updates.filter((u) => !u.isReviewed).length;
    const todayUpdates = updates.filter(
      (u) => new Date(u.createdAt).toDateString() === new Date().toDateString()
    ).length;
    const todayAppointments = Math.floor(Math.random() * 5) + 1;

    const weightData = [...updates].reverse().slice(0, 12).map((u) => ({
      date: new Date(u.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      weight: u.weight,
    }));

    const moodCount: Record<string, number> = {};
    updates.forEach((u) => { moodCount[u.mood] = (moodCount[u.mood] || 0) + 1; });
    const moodData = Object.entries(moodCount).map(([mood, count]) => ({
      mood: moodLabels[mood] || mood, count, color: moodColors[mood] || "#888",
    }));

    const clientGrowth = [
      { month: "Jan", clients: 12 }, { month: "Feb", clients: 18 }, { month: "Mar", clients: 25 },
      { month: "Apr", clients: 30 }, { month: "May", clients: 38 }, { month: "Jun", clients: totalClients },
    ];

    return { totalClients, activeClients, pendingReviews, todayUpdates, todayAppointments, weightData, moodData, clientGrowth };
  }, [clients, updates]);

  const recentActivity = useMemo(() => {
    const activity: { type: string; user: string; detail: string; time: string; icon: any; color: string }[] = [];
    updates.slice(0, 5).forEach((u) => {
      activity.push({
        type: "update", user: u.user?.name || "Unknown", detail: `Weight updated to ${u.weight} kg`,
        time: new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        icon: Weight, color: "primary",
      });
    });
    if (activity.length === 0) {
      activity.push({ type: "empty", user: "", detail: "", time: "", icon: Activity, color: "muted" });
    }
    return activity;
  }, [updates]);

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="space-y-3"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-4 w-20" /><Skeleton className="h-7 w-14" /></div></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your practice and client progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </Badge>
        </div>
      </motion.div>

      {/* Top Overview Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Clients" value={stats.totalClients} icon={Users} color="primary" loading={loading}
            trend={{ value: "+12%", positive: true }} />
          <StatCard title="Active Clients" value={stats.activeClients} icon={UserPlus} color="success" loading={loading}
            trend={{ value: "+3", positive: true }} />
          <StatCard title="New This Month" value={Math.floor(stats.totalClients * 0.15)} icon={UserPlus} color="secondary" loading={loading} />
          <StatCard title="Diet Plans" value={dietPlans.length} icon={FileText} color="primary" loading={loading}
            trend={{ value: "+2", positive: true }} />
          <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={ClipboardList} color="warning" loading={loading}
            trend={{ value: stats.pendingReviews > 5 ? "5+ overdue" : "on track", positive: stats.pendingReviews <= 5 }} />
          <StatCard title="Updates Today" value={stats.todayUpdates} icon={Activity} color="secondary" loading={loading} />
          <StatCard title="Messages" value="12" icon={MessageSquare} color="warning" loading={loading}
            trend={{ value: "3 unread", positive: false }} />
          <StatCard title="Appointments" value={stats.todayAppointments} icon={Calendar} color="success" loading={loading} />
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Weight Progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Weight className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-sm font-semibold">Weight Progress</CardTitle>
                  <CardDescription className="text-xs">Last 12 updates</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.weightData}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid var(--border)", background: "var(--popover)", boxShadow: "var(--shadow-premium-lg)" }} />
                  <Area type="monotone" dataKey="weight" stroke="#6C63FF" strokeWidth={2.5} fill="url(#weightGradient)" dot={{ fill: "#6C63FF", strokeWidth: 2, r: 4, stroke: "white" }} activeDot={{ r: 6, fill: "#6C63FF", stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px]"><p className="text-sm text-muted-foreground">No weight data yet</p></div>
            )}
          </CardContent>
        </Card>

        {/* Mood + Client Growth */}
        <div className="space-y-6">
          {/* Mood Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-warning/10 text-warning"><Smile className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-sm font-semibold">Mood Distribution</CardTitle>
                  <CardDescription className="text-xs">From weekly updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stats.moodData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={stats.moodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count">
                        {stats.moodData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs w-full">
                    {stats.moodData.map((m) => (
                      <div key={m.mood} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-muted-foreground">{m.mood}</span>
                        <span className="font-medium">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[160px]"><p className="text-xs text-muted-foreground">No mood data</p></div>
              )}
            </CardContent>
          </Card>

          {/* Client Growth */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/10 text-success"><TrendingUp className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-sm font-semibold">Client Growth</CardTitle>
                  <CardDescription className="text-xs">This year</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={stats.clientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)" }} />
                  <Bar dataKey="clients" radius={[4, 4, 0, 0]} fill="#6C63FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Actions + Activity Feed */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Zap className="h-4 w-4" /></div>
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { icon: Users, label: "Add Client", href: "/dashboard/clients", desc: "Create new account" },
              { icon: FileText, label: "Create Diet Plan", href: "/dashboard/diet-plans", desc: "Upload PDF plan" },
              { icon: Utensils, label: "Upload Recipe", href: "/dashboard/diet-plans", desc: "Add recipe" },
              { icon: MessageSquare, label: "Send Message", href: "/dashboard/messages", desc: "Message clients" },
              { icon: Activity, label: "Create Update", href: "/dashboard/updates", desc: "Post update" },
              { icon: Calendar, label: "Schedule", href: "/dashboard/calendar", desc: "Set appointment" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <action.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary"><Activity className="h-4 w-4" /></div>
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">Latest client updates and actions</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{updates.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <div className="px-5 pb-4 space-y-0">
                {recentActivity.length > 0 && recentActivity[0].type !== "empty" ? (
                  recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                      <div className="relative flex flex-col items-center">
                        <div className={cn("p-1.5 rounded-full border-2", `border-${activity.color}/20 bg-${activity.color}/10`)}>
                          <activity.icon className={cn("h-3.5 w-3.5", `text-${activity.color}`)} />
                        </div>
                        {i < recentActivity.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.user}</p>
                          <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Client updates will appear here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
