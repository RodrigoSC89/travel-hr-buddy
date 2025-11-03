/**
 * PATCH 597 - Smart Scheduler Dashboard
 * Main UI component for task scheduling and management
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useScheduler } from "../hooks/useScheduler";
import { CalendarView } from "./CalendarView";
import { AIGeneratedTaskPanel } from "./AIGeneratedTaskPanel";
import type { ScheduledTask } from "../types";

export function SmartSchedulerDashboard() {
  const { tasks, loading, updateStatus, checkOverdue } = useScheduler();
  const [selectedTab, setSelectedTab] = useState("overview");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "default";
    case "overdue":
      return "destructive";
    case "cancelled":
      return "secondary";
    default:
      return "outline";
    }
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const overdueTasks = tasks.filter(t => t.status === "overdue");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Scheduler</h1>
          <p className="text-muted-foreground">
            AI-powered intelligent task scheduling and management
          </p>
        </div>
        <Button onClick={checkOverdue} variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Check Overdue
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {completedTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {tasks.filter(t => t.aiGenerated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligent recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>
                {tasks.length} total tasks across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 mb-2" />
                    <p>No tasks scheduled yet</p>
                  </div>
                ) : (
                  tasks
                    .filter(t => t.status !== "completed" && t.status !== "cancelled")
                    .map((task: ScheduledTask) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{task.title}</h4>
                              {task.aiGenerated && (
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>📦 {task.module}</span>
                              <span>📅 Due: {task.dueDate.toLocaleDateString()}</span>
                              {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={getPriorityColor(task.priority) as any}>
                              {task.priority}
                            </Badge>
                            <Badge variant={getStatusColor(task.status) as any}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {task.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(task.id, "in_progress")}
                              >
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(task.id, "completed")}
                              >
                                Complete
                              </Button>
                            </>
                          )}
                          {task.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(task.id, "completed")}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView tasks={tasks} />
        </TabsContent>

        <TabsContent value="ai-generate">
          <AIGeneratedTaskPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
