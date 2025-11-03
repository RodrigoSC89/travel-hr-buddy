/**
 * PATCH 597 - Calendar View Component
 * Visual calendar display for scheduled tasks
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScheduledTask, CalendarEvent } from "../types";

interface CalendarViewProps {
  tasks: ScheduledTask[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Calendar - Next 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {next30Days.map(date => {
            const dateKey = date.toISOString().split("T")[0];
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isToday = dateKey === new Date().toISOString().split("T")[0];

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
