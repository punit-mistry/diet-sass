"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { MealRecall, Meal } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";
import {
  Plus, Loader2, Trash2, MessageSquare, Utensils, Clock,
  Apple, Coffee, Sun, Moon, Flame, Droplets,
} from "lucide-react";
import { toast } from "sonner";

const mealIcons: Record<string, any> = {
  breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Apple,
};

export default function MealRecallsPage() {
  const [recalls, setRecalls] = useState<MealRecall[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([{ time: "", description: "" }]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [selectedRecall, setSelectedRecall] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchRecalls = () => {
    setLoading(true);
    api.get("/meal-recalls")
      .then(({ data }) => setRecalls(data.mealRecalls))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecalls(); }, []);

  const addMeal = () => setMeals([...meals, { time: "", description: "" }]);
  const removeMeal = (i: number) => setMeals(meals.filter((_, idx) => idx !== i));
  const updateMeal = (i: number, field: keyof Meal, value: string) => {
    const updated = [...meals];
    updated[i] = { ...updated[i], [field]: value };
    setMeals(updated);
  };

  const submitRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (meals.some((m) => !m.time || !m.description)) {
      setError("All meals must have a time and description"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/meal-recalls", { meals, notes });
      toast.success("Meals logged successfully!");
      setOpen(false); setMeals([{ time: "", description: "" }]); setNotes("");
      fetchRecalls();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save");
    } finally { setSubmitting(false); }
  };

  const submitFeedback = async (id: string) => {
    try {
      await api.put(`/meal-recalls/${id}/feedback`, { adminFeedback: feedback });
      toast.success("Feedback added");
      setFeedbackOpen(null); setFeedback("");
      fetchRecalls();
    } catch { toast.error("Failed to add feedback"); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-56" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const getMealIcon = (time: string) => {
    const t = time.toLowerCase();
    if (t.includes("breakfast") || t.includes("morning")) return Coffee;
    if (t.includes("lunch") || t.includes("noon")) return Sun;
    if (t.includes("dinner") || t.includes("evening") || t.includes("night")) return Moon;
    return Apple;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Meal Tracking</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Review client meal logs" : "Log your daily meals"}</p>
        </div>
        {!isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Log Meals</Button>} />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Log Today&apos;s Meals</DialogTitle>
                <DialogDescription>Record what you ate today with details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitRecall} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {meals.map((meal, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Apple className="h-4 w-4" />
                        </div>
                        <Input placeholder="Time (e.g., Breakfast, 8:00 AM)" value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)} required className="flex-1" />
                      </div>
                      <Textarea placeholder="What did you eat? Include portions if possible." value={meal.description} onChange={(e) => updateMeal(i, "description", e.target.value)} required />
                    </div>
                    {meals.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMeal(i)} className="mt-1 shrink-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMeal}>+ Add Meal</Button>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Meals
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Daily Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Flame, label: "Est. Calories", value: "-- kcal", color: "text-warning", bg: "bg-warning/10" },
          { icon: Droplets, label: "Water Intake", value: "-- L", color: "text-primary", bg: "bg-primary/10" },
          { icon: Utensils, label: "Meals Logged", value: `${recalls.length} days`, color: "text-success", bg: "bg-success/10" },
          { icon: Apple, label: "Avg. Completion", value: "--%", color: "text-secondary", bg: "bg-secondary/10" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recalls.map((recall, i) => {
          const isSelected = selectedRecall === recall._id;
          const MealIcon = getMealIcon(recall.meals[0]?.time || "");
          return (
            <motion.div
              key={recall._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-hover"
            >
              <Card
                className={cn("cursor-pointer transition-all", isSelected && "ring-2 ring-primary")}
                onClick={() => setSelectedRecall(isSelected ? null : recall._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <MealIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {isAdmin ? recall.user?.name || "Unknown" : new Date(recall.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {isAdmin ? new Date(recall.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : `${recall.meals.length} meals logged`}
                        </CardDescription>
                      </div>
                    </div>
                    {recall.isReviewed && (
                      <Badge variant="outline" className="text-[10px] text-success border-success/30">Reviewed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 mb-2">
                    {recall.meals.slice(0, 3).map((meal, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs font-medium text-muted-foreground min-w-[80px]">{meal.time}</span>
                        <span className="text-xs text-foreground line-clamp-1">{meal.description}</span>
                      </div>
                    ))}
                    {recall.meals.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-5">+{recall.meals.length - 3} more items</p>
                    )}
                  </div>
                  {recall.notes && (
                    <p className="text-xs text-muted-foreground italic mt-1">💬 {recall.notes}</p>
                  )}
                  {recall.adminFeedback && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 mt-2">
                      <p className="text-xs text-muted-foreground"><span className="font-medium text-primary">Feedback: </span>{recall.adminFeedback}</p>
                    </div>
                  )}
                  {isAdmin && !recall.isReviewed && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <Dialog open={feedbackOpen === recall._id} onOpenChange={(o) => { setFeedbackOpen(o ? recall._id : null); setFeedback(""); }}>
                        <DialogTrigger render={<Button size="xs" variant="outline" className="w-full"><MessageSquare className="mr-1.5 h-3 w-3" />Add Feedback</Button>} />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Feedback</DialogTitle>
                            <DialogDescription>Review {recall.user?.name || "client"}&apos;s meal log.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {recall.meals.map((m, j) => (
                              <div key={j} className="flex gap-2 text-sm">
                                <span className="font-medium text-muted-foreground min-w-[80px]">{m.time}</span>
                                <span>{m.description}</span>
                              </div>
                            ))}
                          </div>
                          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your feedback..." className="min-h-[100px]" />
                          <DialogFooter>
                            <Button onClick={() => submitFeedback(recall._id)} disabled={!feedback.trim()}>Submit Feedback</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {recalls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Utensils className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No meal logs yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {isAdmin ? "Client meal logs will appear here" : "Log your first meal to start tracking your nutrition"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

