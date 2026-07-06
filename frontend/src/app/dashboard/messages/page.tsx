"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Note } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Send, Search, Paperclip, Smile, CheckCheck,
  Circle, Clock, User,
} from "lucide-react";
import { toast } from "sonner";

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-0",
  medium: "bg-warning/15 text-warning border-warning/20",
  high: "bg-danger/15 text-danger border-danger/20",
};

export default function MessagesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const fetchNotes = () => {
    setLoading(true);
    api.get("/notes")
      .then(({ data }) => setNotes(data.notes))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
    if (isAdmin) {
      api.get("/users?limit=100").then(({ data }) => setUsers(data.users)).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notes/${id}/read`);
      fetchNotes();
    } catch { toast.error("Failed to mark as read"); }
  };

  const sendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) { toast.error("Select a recipient"); return; }
    setSubmitting(true);
    try {
      await api.post("/notes", { userId: selectedUser, message, priority });
      toast.success("Message sent");
      setMessage("");
      setPriority("medium");
      fetchNotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally { setSubmitting(false); }
  };

  const conversations: { id: string; name: string; email: string; lastMessage: Note | undefined; unread: number; online: boolean }[] = isAdmin
    ? (users as any[])
        .filter((u: any) => u._id !== (user as any)?.id)
        .map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          lastMessage: notes.filter((n) => n.user._id === u._id).slice(-1)[0],
          unread: notes.filter((n) => n.user._id === u._id && !n.isRead && n.createdBy._id !== (user as any)?.id).length,
          online: Math.random() > 0.5,
        }))
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const selectedConversation = conversations.find((c) => c.id === selectedUser);
  const conversationNotes = notes.filter((n) => n.user._id === selectedUser || !isAdmin);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-56" />
        <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
          <Skeleton className="h-full" />
          <Skeleton className="h-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">{isAdmin ? "Chat with your clients" : "Messages from your nutritionist"}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-14rem)] min-h-[500px]">
        {/* Conversation List */}
        {isAdmin && (
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <User className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No conversations</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedUser(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      selectedUser === conv.id ? "bg-primary/10" : "hover:bg-accent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {conv.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
                        conv.online ? "bg-success" : "bg-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">{conv.name}</span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(conv.lastMessage.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {conv.lastMessage?.message || "No messages yet"}
                        </p>
                        {conv.unread > 0 && (
                          <span className="shrink-0 size-4 flex items-center justify-center rounded-full bg-primary text-[8px] font-medium text-primary-foreground">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Area */}
        <Card className={cn("flex flex-col overflow-hidden", isAdmin ? "lg:col-span-2" : "lg:col-span-3")}>
          {isAdmin && !selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a client to start chatting</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              {isAdmin && selectedConversation && (
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {selectedConversation.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background",
                        selectedConversation.online ? "bg-success" : "bg-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedConversation.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedConversation.online ? "Online" : "Offline"}</p>
                    </div>
                  </div>
                </CardHeader>
              )}

              {!isAdmin && (
                <CardHeader className="pb-3 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">N</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Nutritionist</p>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                </CardHeader>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(isAdmin ? conversationNotes : notes).length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No messages yet. Start a conversation!</p>
                    </div>
                  </div>
                ) : (
                  (isAdmin ? conversationNotes : notes).map((note, i) => {
                    const isMine = isAdmin
                      ? note.createdBy._id === (user as any)?._id
                      : note.createdBy._id !== (user as any)?._id;
                    return (
                      <motion.div
                        key={note._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn("flex", isMine ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}>
                          <p className="text-sm">{note.message}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            isMine ? "justify-end" : "justify-start"
                          )}>
                            <span className={cn(
                              "text-[10px]",
                              isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              {new Date(note.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMine && (
                              <CheckCheck className={cn("h-3 w-3", note.isRead ? "text-success" : "text-primary-foreground/50")} />
                            )}
                            {!isMine && !note.isRead && (
                              <button onClick={() => markAsRead(note._id)}>
                                <Circle className="h-2 w-2 text-primary fill-primary" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4 shrink-0">
                {isAdmin && selectedUser ? (
                  <form onSubmit={sendNote} className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Select value={priority} onValueChange={(v) => setPriority(v ?? "medium")}>
                          <SelectTrigger className="w-24 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="min-h-[40px] max-h-[120px] resize-none"
                          required
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendNote(e as any);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <Button type="submit" size="icon" disabled={submitting || !message.trim()}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                ) : !isAdmin ? (
                  <div className="text-center text-xs text-muted-foreground">
                    Messages from your nutritionist will appear here
                  </div>
                ) : (
                  <div className="text-center text-xs text-muted-foreground">
                    Select a client to send a message
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

function MessageSquare(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}
