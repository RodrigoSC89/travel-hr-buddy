/**
 * PATCH 514: Auto-Executor Configuration
 * Event-driven execution engine configuration and monitoring
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { autoExecEngine, type AutoExecTrigger, type AutoExecRule, type ExecutionRecord } from "@/modules/autoexec/AutoExecEngine";
import {
  Play,
  Pause,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AutoExecConfigDashboard: React.FC = () => {
  const [triggers, setTriggers] = useState<AutoExecTrigger[]>([]);
  const [rules, setRules] = useState<AutoExecRule[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<ExecutionRecord[]>([]);

  useEffect(() => {
    loadData();
    
    // Add example rules
    autoExecEngine.addRule({
      enabled: true,
      triggerId: "trigger-failure",
      actionType: "restart_service",
      priority: 9,
      rollbackEnabled: true,
      maxRetries: 3,
      retryDelay: 1000,
      action: async (context) => {
        console.log("Restarting service:", context);
        return { success: true };
      },
      rollback: async (context) => {
        console.log("Rolling back:", context);
      },
    });

    autoExecEngine.addRule({
      enabled: true,
      triggerId: "trigger-threshold",
      actionType: "scale_resources",
      priority: 7,
      rollbackEnabled: true,
      maxRetries: 2,
      retryDelay: 2000,
      action: async (context) => {
        console.log("Scaling resources:", context);
        return { success: true };
      },
    });

    loadData();
  }, []);

  const loadData = () => {
    setTriggers(autoExecEngine.getTriggers());
    setRules(autoExecEngine.getRules());
    setExecutions(autoExecEngine.getExecutionHistory(20));
    setActiveExecutions(autoExecEngine.getActiveExecutions());
  };

  const toggleTrigger = (triggerId: string, enabled: boolean) => {
    autoExecEngine.setTriggerEnabled(triggerId, enabled);
    loadData();
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    autoExecEngine.setRuleEnabled(ruleId, enabled);
    loadData();
  };

  const testExecution = async () => {
    // Simulate an event
    const event = {
      type: "error",
      severity: "critical",
      service: "navigation",
      timestamp: new Date(),
    };

    const matchedTriggers = await autoExecEngine.checkTriggers(event);
    await autoExecEngine.executeTriggeredRules(matchedTriggers, event);
    
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      running: "default",
      success: "default",
      failed: "destructive",
      rolled_back: "secondary",
    };
    const colors: Record<string, string> = {
      success: "bg-green-600",
    };
    return (
      <Badge variant={variants[status] || "default"} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
    case "rolled_back": return <RotateCcw className="h-4 w-4 text-yellow-500" />;
    case "running": return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-500";
    if (priority >= 5) return "text-yellow-500";
    return "text-green-500";
  };

  const successRate = executions.length > 0
    ? (executions.filter(e => e.status === "success").length / executions.length) * 100
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Auto-Executor
          </h1>
          <p className="text-muted-foreground">
            Event-driven execution engine with automatic retry and rollback
          </p>
        </div>
        <Button onClick={testExecution}>
          <Play className="h-4 w-4 mr-2" />
          Test Execution
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {triggers.filter(t => t.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {triggers.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rules.filter(r => r.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {rules.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{successRate.toFixed(0)}%</div>
            <Progress value={successRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {executions.filter(e => e.status === "success").length} of {executions.length} executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeExecutions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Event Triggers</CardTitle>
          <CardDescription>
            Configure events that will trigger automatic execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{trigger.name}</h3>
                    <Badge variant="outline">{trigger.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID: {trigger.id}
                  </p>
                </div>
                <Switch
                  checked={trigger.enabled}
                  onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Rules</CardTitle>
          <CardDescription>
            Actions configured to execute when triggers are activated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rule.actionType}</h3>
                    <Badge variant="outline">
                      Trigger: {rule.triggerId}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(rule.priority)}>
                      Priority: {rule.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Max Retries: {rule.maxRetries}</span>
                    <span>Retry Delay: {rule.retryDelay}ms</span>
                    {rule.rollbackEnabled && (
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        Rollback Enabled
                      </span>
                    )}
                  </div>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            Recent automatic executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {executions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No executions yet. Click "Test Execution" to simulate.
              </div>
            ) : (
              executions.map((execution) => (
                <div key={execution.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          Rule: {execution.ruleId}
                        </span>
                        {getStatusBadge(execution.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trigger: {execution.triggerId} • Attempts: {execution.attempts}
                      </p>
                      {execution.error && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {execution.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {execution.startTime.toLocaleTimeString()}
                    </p>
                    {execution.endTime && (
                      <p className="text-xs text-muted-foreground">
                        {Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoExecConfigDashboard;
