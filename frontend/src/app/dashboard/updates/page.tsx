"use client";

import { useState, useEffect } from "react";
import api, { BACKEND_URL } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { WeeklyUpdate } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Plus, Loader2, MessageSquare, ThumbsUp, Weight, Smile,
  Camera, Calendar, MoreHorizontal, Heart, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

const moodData: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  excellent: { label: "Excellent", color: "text-success", bg: "bg-success/15 border-success/20", emoji: "😄" },
  good: { label: "Good", color: "text-primary", bg: "bg-primary/10 border-primary/20", emoji: "🙂" },
  okay: { label: "Okay", color: "text-warning", bg: "bg-warning/15 border-warning/20", emoji: "😐" },
  poor: { label: "Poor", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/20", emoji: "😔" },
  terrible: { label: "Terrible", color: "text-danger", bg: "bg-danger/15 border-danger/20", emoji: "😢" },
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchUpdates = () => {
    setLoading(true);
    api.get("/updates")
      .then(({ data }) => setUpdates(data.updates))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUpdates(); }, []);

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!weight || !mood) { setError("Weight and mood are required"); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("weight", weight);
    formData.append("mood", mood);
    if (notes) formData.append("notes", notes);
    if (photo) formData.append("photo", photo);
    try {
      await api.post("/updates", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Weekly update submitted!");
      setOpen(false); setWeight(""); setMood(""); setNotes(""); setPhoto(null);
      fetchUpdates();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit update");
    } finally { setSubmitting(false); }
  };

  const submitFeedback = async (id: string) => {
    try {
      await api.put(`/updates/${id}/feedback`, { feedback });
      toast.success("Feedback added");
      setFeedbackOpen(null); setFeedback("");
      fetchUpdates();
    } catch { toast.error("Failed to add feedback"); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-56" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Weekly Updates</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Review client progress updates" : "Track your weekly progress"}</p>
        </div>
        {!isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />New Update</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Weekly Update</DialogTitle>
                <DialogDescription>Record your progress for this week.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitUpdate} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.1" placeholder="75.5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select value={mood} onValueChange={(v) => setMood(v ?? "")} required>
                    <SelectTrigger><SelectValue placeholder="Select mood" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodData).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="How was your week?" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo">Progress Photo</Label>
                  <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Update
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {updates.map((update, i) => {
          const moodInfo = moodData[update.mood] || moodData.okay;
          return (
            <motion.div
              key={update._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-hover"
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                          {update.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {isAdmin ? update.user?.name || "Unknown" : "Week " + new Date(update.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(update.weekStartDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium", moodInfo.bg, moodInfo.color)}>
                      <span>{moodInfo.emoji}</span>
                      <span>{moodInfo.label}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{update.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.weekStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    {update.isReviewed && (
                      <Badge variant="outline" className="text-[10px] text-success border-success/30">Reviewed</Badge>
                    )}
                  </div>

                  {update.notes && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{update.notes}</p>
                  )}

                  {update.adminFeedback && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">Feedback</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{update.adminFeedback}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {update.photoUrl && (
                        <a href={`${BACKEND_URL}${update.photoUrl}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="xs">
                            <Camera className="mr-1.5 h-3 w-3" /> Photo
                          </Button>
                        </a>
                      )}
                      {/* Like button */}
                      <button
                        onClick={() => {
                          setLiked((prev) => {
                            const next = new Set(prev);
                            if (next.has(update._id)) next.delete(update._id);
                            else next.add(update._id);
                            return next;
                          });
                        }}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors",
                          liked.has(update._id) ? "text-danger bg-danger/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <Heart className={cn("h-3.5 w-3.5", liked.has(update._id) && "fill-current")} />
                        {liked.has(update._id) ? "1" : "0"}
                      </button>
                    </div>

                    {isAdmin && !update.isReviewed && (
                      <Dialog open={feedbackOpen === update._id} onOpenChange={(o) => { setFeedbackOpen(o ? update._id : null); setFeedback(""); }}>
                        <DialogTrigger render={<Button size="xs" variant="outline"><MessageSquare className="mr-1.5 h-3 w-3" />Review</Button>} />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Update</DialogTitle>
                            <DialogDescription>Provide feedback for {update.user?.name || "client"}&apos;s update.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Weight: <strong>{update.weight} kg</strong></span>
                              <span className="text-muted-foreground">Mood: <strong>{moodInfo.emoji} {moodInfo.label}</strong></span>
                            </div>
                            {update.notes && <p className="text-sm text-muted-foreground">{update.notes}</p>}
                            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Write your feedback..." className="min-h-[100px]" />
                          </div>
                          <DialogFooter>
                            <Button onClick={() => submitFeedback(update._id)} disabled={!feedback.trim()}>Submit Review</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {isAdmin && update.isReviewed && (
                      <Badge variant="outline" className="text-[10px] text-success border-success/30 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Reviewed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {updates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No updates yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {isAdmin ? "Client updates will appear here" : "Submit your first weekly update to start tracking"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function Activity(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
}

function CheckCircle(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
