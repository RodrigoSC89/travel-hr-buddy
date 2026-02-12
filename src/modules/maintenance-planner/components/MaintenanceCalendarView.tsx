/**
 * Maintenance Calendar View Component
 * PATCH 853 - Removed @ts-nocheck, using maintenance_schedules table
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { logger } from '@/lib/logger';

type MaintenanceSchedule = Database["public"]["Tables"]["maintenance_schedules"]["Row"];

export const MaintenanceCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      fetchTasksForMonth(selectedDate);
    }
  }, [selectedDate]);

  const fetchTasksForMonth = async (date: Date) => {
    try {
      setLoading(true);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select("*")
        .gte("scheduled_date", format(start, "yyyy-MM-dd"))
        .lte("scheduled_date", format(end, "yyyy-MM-dd"))
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      logger.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.scheduled_date && isSameDay(new Date(task.scheduled_date), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getTypeColor = (type: string | null) => {
    switch (type) {
    case "corrective": return "bg-destructive";
    case "preventive": return "bg-info";
    case "predictive": return "bg-accent";
    case "routine": return "bg-success";
    default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
    case "completed": return "text-success";
    case "in_progress": return "text-info";
    case "overdue": return "text-destructive";
    case "pending": return "text-warning";
    case "scheduled": return "text-accent-foreground";
    default: return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Maintenance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasTasks: (date) => getTasksForDate(date).length > 0
            }}
            modifiersStyles={{
              hasTasks: { 
                backgroundColor: "#3b82f6", 
                color: "white",
                fontWeight: "bold"
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded animate-pulse"></div>
              <div className="h-16 bg-muted rounded animate-pulse"></div>
            </div>
          ) : selectedDateTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No maintenance tasks scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{task.description || "Maintenance Task"}</h4>
                    <Badge 
                      className={`${getTypeColor(task.maintenance_type)} text-xs`}
                    >
                      {task.maintenance_type || "General"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                      {(task.status || "pending").replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  {task.vendor && (
                    <div className="text-xs text-muted-foreground">
                      Vendor: {task.vendor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
