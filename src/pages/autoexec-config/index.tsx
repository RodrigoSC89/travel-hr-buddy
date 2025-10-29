/**
 * PATCH 514 - Auto-Executors Configuration Panel
 * Configure intelligent auto-execution of missions via triggers
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Play, Pause, AlertTriangle, CheckCircle, Settings, RefreshCw } from "lucide-react";
import { autoExecEngine, AutoExecRule, EventTrigger, ExecutionLog } from "@/modules/autoexec/AutoExecEngine";
import { toast } from "sonner";

export default function AutoExecConfig() {
  const [rules, setRules] = useState<AutoExecRule[]>([]);
  const [triggers, setTriggers] = useState<EventTrigger[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const rulesData = autoExecEngine.getRules();
      const triggersData = autoExecEngine.getTriggers();
      const logsData = autoExecEngine.getExecutionLogs(50);
      const activeData = autoExecEngine.getActiveExecutions();

      setRules(rulesData);
      setTriggers(triggersData);
      setExecutionLogs(logsData);
      setActiveExecutions(activeData);
    } catch (error) {
      console.error("Error loading auto-exec data:", error);
      toast.error("Failed to load auto-executor data");
    } finally {
      setLoading(false);
    }
  };

  const testTrigger = async () => {
    try {
      const testEvent = {
        status: "failed",
        error: "Test error",
        anomalyScore: 0.9,
        deadline: new Date(Date.now() + 1800000).toISOString(),
      };

      const matchedTriggers = await autoExecEngine.checkTriggers(testEvent);
      const executions = await autoExecEngine.executeTriggeredRules(matchedTriggers, testEvent);

      toast.success(`Triggered ${matchedTriggers.length} rules, executed ${executions.length} actions`);
      loadData();
    } catch (error) {
      toast.error("Failed to test trigger");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: "default",
      running: "warning",
      failed: "destructive",
      rolled_back: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Auto-Executors
          </h1>
          <p className="text-muted-foreground">Intelligent auto-execution configuration</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={testTrigger} variant="outline" size="sm">
            Test Trigger
          </Button>
          <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.filter((r) => r.enabled).length}</div>
            <p className="text-xs text-muted-foreground">of {rules.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Event Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{triggers.filter((t) => t.enabled).length}</div>
            <p className="text-xs text-muted-foreground">enabled triggers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionLogs.length}</div>
            <p className="text-xs text-muted-foreground">lifetime executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              Running Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExecutions.length}</div>
            <p className="text-xs text-muted-foreground">active executions</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Event Triggers</CardTitle>
          <CardDescription>Configure what events trigger automatic actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch checked={trigger.enabled} />
                <div className="flex-1">
                  <div className="font-medium">{trigger.name}</div>
                  <div className="text-sm text-muted-foreground">{trigger.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Type: <Badge variant="outline">{trigger.type}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Rules</CardTitle>
          <CardDescription>Actions to execute when triggers are activated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch checked={rule.enabled} />
                <div className="flex-1">
                  <div className="font-medium">Priority {rule.priority}: {rule.actionType}</div>
                  <div className="text-sm text-muted-foreground">
                    Trigger ID: {rule.triggerId}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {rule.rollbackEnabled && <Badge variant="secondary">Rollback Enabled</Badge>}
                    {" "}Max Retries: {rule.maxRetries}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent auto-execution logs</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {executionLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No executions yet</div>
              ) : (
                executionLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {log.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {log.status === "failed" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {log.status === "running" && <Play className="h-4 w-4 text-blue-500" />}
                    <div className="flex-1">
                      <div className="font-medium">Rule: {log.ruleId}</div>
                      <div className="text-sm text-muted-foreground">
                        Started: {new Date(log.startTime).toLocaleString()}
                      </div>
                      {log.error && (
                        <div className="text-xs text-destructive mt-1">Error: {log.error}</div>
                      )}
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
