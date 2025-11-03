/**
 * PATCH 603 - Calendar View Component (Enhanced)
 * Visual calendar display for scheduled tasks with intelligent slot suggestions
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { ScheduledTask, CalendarEvent } from "../types";

interface CalendarViewProps {
  tasks: ScheduledTask[];
  showIntelligentSlots?: boolean;
}

export function CalendarView({ tasks, showIntelligentSlots = true }: CalendarViewProps) {
  // Convert tasks to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      end: task.dueDate,
      priority: task.priority,
      status: task.status,
      task
    }));
  }, [tasks]);

  // Calculate intelligent time slots based on workload distribution
  const intelligentSlots = useMemo(() => {
    if (!showIntelligentSlots) return new Map<string, number>();
    
    const workloadByDate = new Map<string, number>();
    
    events.forEach(event => {
      const dateKey = event.start.toISOString().split("T")[0];
      const currentLoad = workloadByDate.get(dateKey) || 0;
      
      // Weight by priority
      const weight = event.priority === "critical" ? 4 : 
                     event.priority === "high" ? 3 :
                     event.priority === "medium" ? 2 : 1;
      
      workloadByDate.set(dateKey, currentLoad + weight);
    });
    
    return workloadByDate;
  }, [events, showIntelligentSlots]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      const dateKey = event.start.toISOString().split("T")[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(event);
    });

    return grouped;
  }, [events]);

  // Get next 30 days
  const next30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
    }
  };

  // Helper to get slot recommendation
  const getSlotRecommendation = (dateKey: string, workload: number): { color: string; label: string } | null => {
    if (!showIntelligentSlots) return null;
    
    if (workload === 0) {
      return { color: "text-green-600", label: "Optimal slot" };
    } else if (workload <= 3) {
      return { color: "text-blue-600", label: "Good slot" };
    } else if (workload <= 6) {
      return { color: "text-yellow-600", label: "Busy" };
    } else {
      return { color: "text-red-600", label: "Overloaded" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task Calendar - Next 30 Days</CardTitle>
          {showIntelligentSlots && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered Slots
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {next30Days.map(date => {
            const dateKey = date.toISOString().split("T")[0];
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isToday = dateKey === new Date().toISOString().split("T")[0];
            const workload = intelligentSlots.get(dateKey) || 0;
            const slotRecommendation = getSlotRecommendation(dateKey, workload);

            return (
              <div
                key={dateKey}
                className={`border rounded-lg p-4 ${isToday ? "bg-blue-50 dark:bg-blue-950 border-blue-500" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {date.toLocaleDateString("en-US", { 
                        weekday: "short", 
                        month: "short", 
                        day: "numeric" 
                      })}
                    </h4>
                    {isToday && (
                      <Badge variant="default" className="text-xs">
                        Today
                      </Badge>
                    )}
                    {slotRecommendation && (
                      <span className={`text-xs ${slotRecommendation.color} flex items-center gap-1`}>
                        <Sparkles className="w-3 h-3" />
                        {slotRecommendation.label}
                      </span>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <Badge variant="outline">
                      {dayEvents.length} task{dayEvents.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>

                {dayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 p-2 bg-background rounded border"
                      >
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.task.module}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
