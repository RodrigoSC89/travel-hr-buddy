import { useEffect, useState, useCallback, useMemo } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

interface MaintenanceTask {
  id: string;
  task_name: string;
  scheduled_date: string;
  status: string;
  priority: string;
}

export const MaintenanceCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
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
        .from("maintenance_tasks")
        .select("*")
        .gte("scheduled_date", format(start, "yyyy-MM-dd"))
        .lte("scheduled_date", format(end, "yyyy-MM-dd"))
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.scheduled_date), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "text-green-600";
    case "in_progress": return "text-blue-600";
    case "overdue": return "text-red-600";
    case "pending": return "text-yellow-600";
    default: return "text-gray-600";
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
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
                    <h4 className="font-medium text-sm">{task.task_name}</h4>
                    <Badge 
                      className={`${getPriorityColor(task.priority)} text-xs`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
