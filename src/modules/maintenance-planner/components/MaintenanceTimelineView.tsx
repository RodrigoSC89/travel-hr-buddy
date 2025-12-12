import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface MaintenanceTask {
  id: string;
  task_name: string;
  scheduled_date: string;
  deadline_date: string;
  status: string;
  priority: string;
  assigned_to?: string;
}

export const MaintenanceTimelineView: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .limit(50);

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance timeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "overdue":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getDaysUntil = (date: string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground">No maintenance tasks scheduled</p>
            ) : (
              tasks.map((task, index) => (
                <div key={task.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gray-100">
                      {getTaskIcon(task.status)}
                    </div>
                  </div>
                  
                  {/* Task card */}
                  <div className="flex-1 mb-8">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{task.task_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(task.scheduled_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {getDaysUntil(task.scheduled_date)}
                          </span>
                          <span className="font-medium">
                            Status: {task.status.replace("_", " ")}
                          </span>
                        </div>
                        
                        {task.deadline_date && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Deadline: {format(new Date(task.deadline_date), "MMM dd, yyyy")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
