"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import {
  ArrowLeft, Weight, Smile, Activity, FileText, Utensils, MessageSquare,
  Image, BarChart3, Dumbbell, Calendar, Clock, TrendingUp, AlertCircle,
} from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      api.get(`/users/${params.id}`).then((r) => r.data),
      api.get(`/updates?userId=${params.id}&limit=30`).then((r) => r.data.updates),
    ])
      .then(([clientData, updatesData]) => {
        setClient(clientData.user || clientData);
        setUpdates(updatesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const weightData = [...updates].reverse().map((u) => ({
    date: new Date(u.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    weight: u.weight,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!client) return <div className="py-12 text-center text-muted-foreground">Client not found</div>;

  const initials = client.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{client.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{client.email}</span>
              <span>·</span>
              <Badge variant={client.isActive ? "default" : "secondary"}
                className={client.isActive ? "bg-success/15 text-success border-success/20" : ""}>
                {client.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Weight className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Current Weight</p>
                <p className="text-lg font-bold">{updates[0]?.weight || "--"} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">BMI</p>
                <p className="text-lg font-bold">{updates[0]?.weight ? (updates[0].weight / (1.7 * 1.7)).toFixed(1) : "--"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning"><Activity className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Updates</p>
                <p className="text-lg font-bold">{updates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary"><Calendar className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Last Active</p>
                <p className="text-lg font-bold">
                  {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="diet">Diet Plan</TabsTrigger>
          <TabsTrigger value="meals">Meal Logs</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weight Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", background: "var(--popover)" }} />
                    <Area type="monotone" dataKey="weight" stroke="#6C63FF" strokeWidth={2} fill="url(#wGrad)" dot={{ fill: "#6C63FF", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No weight data yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Detailed progress charts with BMI trend, meal compliance, and more.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Assigned diet plans with progress tracking.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Utensils className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Daily meal logs and nutrition breakdown.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Message history and communication timeline.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Complete activity timeline for this client.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
