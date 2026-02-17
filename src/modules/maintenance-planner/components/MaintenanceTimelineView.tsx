/**
 * PATCH 858 - TypeScript fixed: maintenance_tasks table now exists
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { logger } from '@/lib/logger';

interface MaintenanceTask {
  id: string;
  title?: string | null;
  scheduled_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  priority?: string | null;
  assigned_to?: string | null;
  description?: string | null;
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
      logger.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance timeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (status?: string | null) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "overdue":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Clock className="h-5 w-5 text-info" />;
    }
  };

  const getDaysUntil = (date?: string | null) => {
    if (!date) return "Not scheduled";
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
    case "urgent": case "critical": return "bg-destructive";
    case "high": return "bg-warning";
    case "medium": return "bg-warning/70";
    case "low": return "bg-success";
    default: return "bg-muted-foreground";
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
              <div key={`maint-tl-skel-${i}`} className="h-24 bg-muted rounded animate-pulse"></div>
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
                            <h4 className="font-semibold">{task.title || "Untitled Task"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.scheduled_date ? format(new Date(task.scheduled_date), "MMM dd, yyyy") : "Not scheduled"}
                            </p>
                          </div>
                          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                            {task.priority || "medium"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {getDaysUntil(task.scheduled_date)}
                          </span>
                          <span className="font-medium">
                            Status: {(task.status || "pending").replace("_", " ")}
                          </span>
                        </div>
                        
                        {task.due_date && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Due: {format(new Date(task.due_date), "MMM dd, yyyy")}
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
};
