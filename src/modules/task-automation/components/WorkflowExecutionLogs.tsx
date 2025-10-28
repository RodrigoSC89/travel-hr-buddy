/**
 * Workflow Execution Logs Component
 * PATCH 387 - Execution logging and history tracking
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Clock, Play, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  trigger_type: string;
  trigger_data?: any;
  execution_log?: any[];
  error_message?: string;
}

export const WorkflowExecutionLogs: React.FC<{ workflowId?: string }> = ({ workflowId }) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExecutions();

    // Set up real-time subscription
    const subscription = supabase
      .channel("workflow_executions")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "automation_executions"
      }, () => {
        fetchExecutions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [workflowId]);

  const fetchExecutions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgData } = await supabase
        .from("organization_users")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!orgData) return;

      let query = supabase
        .from("automation_executions")
        .select("*, automation_rules(rule_name)")
        .eq("organization_id", orgData.organization_id)
        .order("started_at", { ascending: false })
        .limit(50);

      if (workflowId) {
        query = query.eq("rule_id", workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedExecutions: WorkflowExecution[] = (data || []).map((exec: any) => ({
        id: exec.id,
        workflow_id: exec.rule_id,
        workflow_name: exec.automation_rules?.rule_name || "Unknown Workflow",
        status: exec.status,
        started_at: exec.started_at,
        completed_at: exec.completed_at,
        duration_ms: exec.duration_ms,
        trigger_type: exec.trigger_type,
        trigger_data: exec.trigger_data,
        execution_log: exec.execution_log,
        error_message: exec.error_message,
      }));

      setExecutions(formattedExecutions);
    } catch (error) {
      console.error("Error fetching executions:", error);
      toast({
        title: "Error loading execution logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "running":
      return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      completed: "default",
      failed: "destructive",
      running: "default",
      pending: "secondary",
      cancelled: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading execution logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Execution History</CardTitle>
          <Button size="sm" variant="outline" onClick={fetchExecutions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {executions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No executions found
              </p>
            ) : (
              <div className="space-y-3">
                {executions.map((execution) => (
                  <div
                    key={execution.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      selectedExecution?.id === execution.id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium text-sm">{execution.workflow_name}</span>
                      </div>
                      {getStatusBadge(execution.status)}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Started: {format(new Date(execution.started_at), "PPpp")}</p>
                      <p>Duration: {formatDuration(execution.duration_ms)}</p>
                      <p>Trigger: {execution.trigger_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedExecution ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Workflow Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{selectedExecution.workflow_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(selectedExecution.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(selectedExecution.duration_ms)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span>{format(new Date(selectedExecution.started_at), "PPpp")}</span>
                  </div>
                  {selectedExecution.completed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{format(new Date(selectedExecution.completed_at), "PPpp")}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedExecution.error_message && (
                <div>
                  <h4 className="font-semibold mb-2 text-destructive">Error Message</h4>
                  <p className="text-sm bg-destructive/10 p-3 rounded">
                    {selectedExecution.error_message}
                  </p>
                </div>
              )}

              {selectedExecution.execution_log && selectedExecution.execution_log.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Execution Log</h4>
                  <ScrollArea className="h-[200px] bg-muted p-3 rounded">
                    <div className="space-y-2 text-xs font-mono">
                      {selectedExecution.execution_log.map((log: any, index: number) => (
                        <div key={index} className="flex gap-2">
                          <span className="text-muted-foreground">[{log.timestamp}]</span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Select an execution to view details
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
