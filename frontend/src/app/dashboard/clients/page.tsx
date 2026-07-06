"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, Search, Loader2, MoreHorizontal, UserCheck, UserX, Mail,
  Download, Trash2, Eye, ChevronDown, Filter, ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchClients = () => {
    setLoading(true);
    const params = new URLSearchParams({ role: "client", limit: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    api.get(`/users?${params}`)
      .then(({ data }) => setClients(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [debouncedSearch]);

  const filteredClients = useMemo(() => {
    if (statusFilter === "all") return clients;
    return clients.filter((c: any) => statusFilter === "active" ? c.isActive : !c.isActive);
  }, [clients, statusFilter]);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await api.post("/auth/register", { name, email, password, role: "client" });
      toast.success("Client created successfully");
      setOpen(false); setName(""); setEmail(""); setPassword("");
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to create client");
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (client: any) => {
    try {
      await api.put(`/users/${client._id}`, { isActive: !client.isActive });
      toast.success(`Client ${client.isActive ? "deactivated" : "activated"}`);
      fetchClients();
    } catch { toast.error("Failed to update client"); }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Client deleted");
      fetchClients();
    } catch { toast.error("Failed to delete client"); }
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <Avatar className="size-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {row.original.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}
          className={row.original.isActive ? "bg-success/15 text-success border-success/20" : ""}>
          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", row.original.isActive ? "bg-success" : "bg-muted-foreground")} />
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 hover:text-foreground">
          Last Login <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleDateString("en-IN") : "Never"}
        </span>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      cell: () => (
        <div className="w-24">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }} />
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center size-8 rounded-lg hover:bg-accent transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(`/dashboard/clients/${row.original._id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(row.original)}>
              {row.original.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
              {row.original.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { router.push("/dashboard/messages"); }}>
              <Mail className="mr-2 h-4 w-4" /> Send Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => deleteClient(row.original._id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [router]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all your clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" />Add Client</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Client</DialogTitle>
                <DialogDescription>Add a new client to your practice.</DialogDescription>
              </DialogHeader>
              <form onSubmit={createClient} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="cname">Full Name</Label>
                  <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cemail">Email</Label>
                  <Input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpass">Password</Label>
                  <Input id="cpass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Client
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-muted/30">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                statusFilter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-3">
        {[
          { label: "Total Clients", value: clients.length, color: "primary" },
          { label: "Active", value: clients.filter((c: any) => c.isActive).length, color: "success" },
          { label: "Inactive", value: clients.filter((c: any) => !c.isActive).length, color: "muted" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredClients}
        loading={loading}
        pageSize={10}
        onRowClick={(row) => router.push(`/dashboard/clients/${row._id}`)}
      />
    </motion.div>
  );
}
