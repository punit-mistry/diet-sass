"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Clock, User, Video, MapPin, Bell, MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const events = [
  { id: "1", title: "Follow-up with John", client: "John Doe", time: "10:00 AM - 10:30 AM", type: "follow-up", date: 6 },
  { id: "2", title: "Diet Plan Review", client: "Sarah Wilson", time: "11:00 AM - 11:30 AM", type: "review", date: 6 },
  { id: "3", title: "New Client Onboarding", client: "Mike Chen", time: "2:00 PM - 3:00 PM", type: "onboarding", date: 6 },
  { id: "4", title: "Progress Check-in", client: "Emily Davis", time: "9:00 AM - 9:30 AM", type: "follow-up", date: 7 },
  { id: "5", title: "Meal Plan Discussion", client: "Jane Smith", time: "3:00 PM - 3:45 PM", type: "review", date: 8 },
  { id: "6", title: "Weekly Review", client: "Internal", time: "4:00 PM - 5:00 PM", type: "internal", date: 9 },
];

const typeStyles: Record<string, { label: string; color: string; bg: string }> = {
  "follow-up": { label: "Follow-up", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  "review": { label: "Review", color: "text-warning", bg: "bg-warning/10 border-warning/20" },
  "onboarding": { label: "Onboarding", color: "text-success", bg: "bg-success/10 border-success/20" },
  "internal": { label: "Internal", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now.getDate());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const todayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">Manage appointments and client follow-ups</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />New Event</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-base font-semibold">{monthName} {currentYear}</CardTitle>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const today = new Date();
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                setSelectedDate(today.getDate());
              }}>Today</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
                const isSelected = day === selectedDate;
                const dayEvents = events.filter((e) => e.date === day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square p-1.5 rounded-lg text-sm transition-all relative group",
                      isSelected && "bg-primary text-primary-foreground font-medium",
                      !isSelected && isToday && "border border-primary text-primary font-medium",
                      !isSelected && !isToday && "hover:bg-accent text-foreground"
                    )}
                  >
                    <span>{day}</span>
                    {dayEvents.length > 0 && !isSelected && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span key={e.id} className="size-1 rounded-full bg-primary" />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">{todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No events</p>
                <p className="text-xs text-muted-foreground/60 mt-1">This day is clear</p>
              </div>
            ) : (
              todayEvents.map((event) => {
                const style = typeStyles[event.type] || typeStyles["follow-up"];
                return (
                  <div key={event.id} className="p-3 rounded-xl border hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={cn("text-[10px] font-normal border", style.bg, style.color)}>
                        {style.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="shrink-0 flex items-center justify-center size-6 rounded-md hover:bg-accent">
                          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => toast.success("Event edited")}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Event cancelled")} className="text-destructive">Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm font-medium mb-2">{event.title}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {event.client}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
