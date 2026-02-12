/**
 * Task Automation Module
 * Automated task management with AI-powered workflows
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskAutomationData } from "@/hooks/useTaskAutomationData";
import { logger } from '@/lib/logger';
import {
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Workflow,
  Bot,
  Calendar,
  Loader2
} from "lucide-react";

const TaskAutomation = () => {
  const [activeTab, setActiveTab] = useState("automations");
  const { tasks, stats, isLoading, toggleTaskStatus } = useTaskAutomationData();

  const getStatusBadge = (status: "active" | "paused" | "error" | "completed") => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case "paused":
        return <Badge className="bg-warning/10 text-warning">Paused</Badge>;
      case "error":
        return <Badge className="bg-destructive/10 text-destructive">Error</Badge>;
      case "completed":
        return <Badge className="bg-info/10 text-info">Completed</Badge>;
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await toggleTaskStatus.mutateAsync({ id, isActive: currentStatus !== "active" });
    } catch (error) {
      logger.error("Failed to toggle task status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando automações...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Task Automation</h1>
            <p className="text-muted-foreground">Automated task management with AI-powered workflows</p>
          </div>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Automation</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Play className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Running smoothly</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paused}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average success</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Configured Automations</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg"><Workflow className="h-5 w-5 text-primary" /></div>
                        <div>
                          <h3 className="font-medium">{task.name}</h3>
                          <p className="text-sm text-muted-foreground">{task.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm">Last: {task.lastRun ? new Date(task.lastRun).toLocaleString("pt-BR") : "Never"}</p>
                          <p className="text-xs text-muted-foreground">Next: {task.nextRun ? new Date(task.nextRun).toLocaleString("pt-BR") : "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{task.successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success</p>
                        </div>
                        {getStatusBadge(task.status)}
                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(task.id, task.status)}>
                          {task.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma automação configurada</p>
                      <Button className="mt-4" size="sm"><Plus className="h-4 w-4 mr-2" />Criar Automação</Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Document Expiry Alert", icon: Calendar, desc: "Alert before document expiration" },
              { name: "Crew Rotation", icon: Bot, desc: "Automated crew rotation notifications" },
              { name: "Compliance Check", icon: CheckCircle, desc: "Daily compliance verification" },
              { name: "Safety Report", icon: AlertCircle, desc: "Weekly safety report generation" },
              { name: "Maintenance Sync", icon: Workflow, desc: "Sync maintenance with vessel position" },
              { name: "Custom Workflow", icon: Zap, desc: "Create custom automation workflow" },
            ].map((template) => (
              <Card key={template.name} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><template.icon className="h-5 w-5 text-primary" /></div>
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card><CardHeader><CardTitle>Execution History</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">View detailed execution history and logs for all automated tasks.</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card><CardHeader><CardTitle>Automation Settings</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Configure global automation settings, notifications, and retry policies.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskAutomation;
