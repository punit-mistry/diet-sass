"use client";

import { useState, useEffect } from "react";
import api, { BACKEND_URL } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { DietPlan } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  FileText, Download, Loader2, Search, Grid3X3, List, Plus,
  MoreHorizontal, Copy, Eye, Clock, Users, Upload, X, Trash2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function DietPlansPage() {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPlan, setAssignPlan] = useState<DietPlan | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    Promise.all([
      api.get("/diet-plans").then((r) => r.data.dietPlans),
      isAdmin ? api.get("/users?role=client&limit=200").then((r) => r.data.users) : Promise.resolve([]),
    ]).then(([plansData, clientsData]) => {
      setPlans(plansData);
      setClients(clientsData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isAdmin]);

  const filteredPlans = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !file) { setError("Title and PDF file are required"); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    formData.append("file", file);
    try {
      await api.post("/diet-plans", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Diet plan created");
      setOpen(false); setTitle(""); setDescription(""); setTags(""); setFile(null);
      const { data } = await api.get("/diet-plans");
      setPlans(data.dietPlans);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create plan");
    } finally { setSubmitting(false); }
  };

  const duplicatePlan = async (plan: DietPlan) => {
    try {
      const resp = await fetch(`${BACKEND_URL}${plan.fileUrl}`);
      const blob = await resp.blob();
      const dupFile = new File([blob], `copy-of-${plan.fileName}`, { type: blob.type });
      const formData = new FormData();
      formData.append("title", `${plan.title} (Copy)`);
      formData.append("description", plan.description);
      if (plan.tags?.length) formData.append("tags", plan.tags.join(", "));
      formData.append("file", dupFile);
      await api.post("/diet-plans", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Diet plan duplicated");
      const { data } = await api.get("/diet-plans");
      setPlans(data.dietPlans);
    } catch {
      toast.error("Failed to duplicate plan");
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this diet plan? This cannot be undone.")) return;
    try {
      await api.delete(`/diet-plans/${id}`);
      toast.success("Diet plan deleted");
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Failed to delete plan");
    }
  };

  const toggleClientAssign = (clientId: string) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const assignPlanToClients = async () => {
    if (!assignPlan) return;
    try {
      const currentAssigned = assignPlan.assignedUsers?.map((u) => (typeof u === "string" ? u : u._id)) || [];
      const merged = [...new Set([...currentAssigned, ...selectedClients])];
      await api.put(`/diet-plans/${assignPlan._id}`, { assignedUsers: merged });
      toast.success(`Plan assigned to ${selectedClients.length} client(s)`);
      setAssignOpen(false);
      setAssignPlan(null);
      setSelectedClients([]);
      const { data } = await api.get("/diet-plans");
      setPlans(data.dietPlans);
    } catch {
      toast.error("Failed to assign plan");
    }
  };

  const openAssignDialog = (plan: DietPlan) => {
    setAssignPlan(plan);
    setSelectedClients(plan.assignedUsers?.map((u) => (typeof u === "string" ? u : u._id)) || []);
    setAssignOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Diet Plans</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "Create and manage diet plans" : "Your assigned diet plans"}</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />New Plan</Button>} />
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Diet Plan</DialogTitle>
                <DialogDescription>Upload a new diet plan as a PDF and assign it to clients.</DialogDescription>
              </DialogHeader>
              <form onSubmit={createPlan} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="e.g. Keto Diet Plan" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" placeholder="Brief description of the diet plan..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="e.g. Keto, Low Carb, High Protein" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">PDF File *</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      className="flex-1"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file && (
                      <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {file && <p className="text-xs text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitting ? "Uploading..." : "Create Plan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search plans..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
          <button onClick={() => setView("grid")}
            className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("table")}
            className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <List className="h-4 w-4" />
          </button>
        </div>
        <Badge variant="outline" className="text-xs">{plans.length} plans</Badge>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{plan.title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5 line-clamp-2">{plan.description}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="shrink-0 flex items-center justify-center size-7 rounded-lg hover:bg-accent transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => window.open(`${BACKEND_URL}${plan.fileUrl}`, '_blank')}>
                          <Eye className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a href={`${BACKEND_URL}${plan.fileUrl}`} download className="flex items-center gap-2">
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => openAssignDialog(plan)}>
                            <Users className="mr-2 h-4 w-4" /> Assign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => duplicatePlan(plan)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deletePlan(plan._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {plan.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {plan.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.assignedUsers?.length || 0} assigned
                    </div>
                    <span>{(plan.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                  <a href={`${BACKEND_URL}${plan.fileUrl}`} download={plan.fileName}>
                    <Button className="w-full" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredPlans.length === 0 && plans.length === 0 && !isAdmin && (
            <>
              {/* Sample plan for clients when no plans are assigned yet */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 lg:col-span-3"
              >
                <div className="flex items-center gap-2 px-1 mb-3">
                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">Example</Badge>
                  <span className="text-xs text-muted-foreground">Your nutritionist will assign a personalized plan soon. Here&apos;s a sample:</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-hover"
              >
                <Card className="h-full flex flex-col border-dashed border-primary/30 bg-primary/[0.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-semibold">Balanced Nutrition Plan</CardTitle>
                          <CardDescription className="text-xs mt-0.5">A well-balanced diet with optimal macronutrient distribution for sustained energy and health.</CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["Balanced", "High Protein", "Low Carb"].map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5">{tag}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <span>~45 KB</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Example</Badge>
                    </div>
                    <Button className="w-full" size="sm" variant="outline" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Awaiting Assignment
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
          {filteredPlans.length === 0 && plans.length === 0 && isAdmin && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No diet plans found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Create your first diet plan to get started</p>
            </div>
          )}
          {filteredPlans.length === 0 && plans.length > 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No plans match your search</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Tags</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Clients</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Created</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{plan.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {plan.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                      {(plan.tags?.length || 0) > 2 && <span className="text-xs text-muted-foreground">+{plan.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{(plan.fileSize / 1024).toFixed(0)} KB</td>
                  <td className="px-4 py-3 text-sm">{plan.assignedUsers?.length || 0}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center size-7 rounded-lg hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => window.open(`${BACKEND_URL}${plan.fileUrl}`, '_blank')}>
                          <Eye className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <a href={`${BACKEND_URL}${plan.fileUrl}`} download={plan.fileName} className="flex items-center gap-2">
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => openAssignDialog(plan)}>
                            <Users className="mr-2 h-4 w-4" /> Assign
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => duplicatePlan(plan)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deletePlan(plan._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={(v) => { setAssignOpen(v); if (!v) { setAssignPlan(null); setSelectedClients([]); }}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Diet Plan</DialogTitle>
            <DialogDescription>
              Assign "{assignPlan?.title}" to clients. Already-assigned clients are pre-selected.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No clients found</p>
            ) : (
              clients.map((c) => {
                const checked = selectedClients.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleClientAssign(c._id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      checked ? "bg-primary/10 text-primary" : "hover:bg-accent"
                    )}
                  >
                    <div className={cn(
                      "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-primary border-primary text-primary-foreground" : "border-border"
                    )}>
                      {checked && <span className="text-[10px]">&#10003;</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssignOpen(false); setAssignPlan(null); setSelectedClients([]); }}>
              Cancel
            </Button>
            <Button onClick={assignPlanToClients} disabled={selectedClients.length === 0}>
              Assign to {selectedClients.length} client{selectedClients.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
