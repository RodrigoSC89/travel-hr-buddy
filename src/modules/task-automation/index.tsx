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
  Calendar
} from "lucide-react";

interface AutomatedTask {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  nextRun: string;
  successRate: number;
}

const mockTasks: AutomatedTask[] = [
  {
    id: "1",
    name: "Daily Compliance Check",
    trigger: "Cron: 00:00 UTC",
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "In 22 hours",
    successRate: 98.5
  },
  {
    id: "2",
    name: "Document Expiry Alerts",
    trigger: "30 days before expiry",
    status: "active",
    lastRun: "1 hour ago",
    nextRun: "Continuous",
    successRate: 100
  },
  {
    id: "3",
    name: "Crew Rotation Reminder",
    trigger: "7 days before rotation",
    status: "active",
    lastRun: "Yesterday",
    nextRun: "Tomorrow 09:00",
    successRate: 95.2
  },
  {
    id: "4",
    name: "Maintenance Schedule Sync",
    trigger: "On vessel position update",
    status: "paused",
    lastRun: "3 days ago",
    nextRun: "Paused",
    successRate: 87.3
  },
  {
    id: "5",
    name: "Safety Report Generation",
    trigger: "Weekly on Sundays",
    status: "active",
    lastRun: "5 days ago",
    nextRun: "In 2 days",
    successRate: 99.1
  }
];

const TaskAutomation = () => {
  const [activeTab, setActiveTab] = useState("automations");
  const [tasks] = useState<AutomatedTask[]>(mockTasks);

  const getStatusBadge = (status: AutomatedTask["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Paused</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-500">Error</Badge>;
    }
  };

  const activeCount = tasks.filter(t => t.status === "active").length;
  const pausedCount = tasks.filter(t => t.status === "paused").length;
  const avgSuccessRate = tasks.reduce((sum, t) => sum + t.successRate, 0) / tasks.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Task Automation</h1>
            <p className="text-muted-foreground">
              Automated task management with AI-powered workflows
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Running smoothly</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average success</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
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
            <CardHeader>
              <CardTitle>Configured Automations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Workflow className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{task.name}</h3>
                          <p className="text-sm text-muted-foreground">{task.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm">Last: {task.lastRun}</p>
                          <p className="text-xs text-muted-foreground">Next: {task.nextRun}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{task.successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success</p>
                        </div>
                        {getStatusBadge(task.status)}
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
            ].map((template, i) => (
              <Card key={i} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <template.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">{template.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View detailed execution history and logs for all automated tasks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure global automation settings, notifications, and retry policies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskAutomation;
