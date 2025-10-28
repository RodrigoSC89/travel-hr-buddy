/**
 * Task Automation Module - PATCH 387 Complete
 * Visual workflow builder with execution logging and webhook integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, CheckCircle, Clock, TrendingUp, Plus, History } from "lucide-react";
import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { WorkflowExecutionLogs } from "./components/WorkflowExecutionLogs";

const TaskAutomation = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Task Automation</h1>
            <p className="text-muted-foreground">
              Visual workflow builder with triggers, actions, and execution logging
            </p>
          </div>
        </div>
        <Button onClick={() => setActiveTab("builder")}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="logs">
            <History className="mr-2 h-4 w-4" />
            Execution Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">34</div>
                <p className="text-xs text-muted-foreground">Running now</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tasks Automated</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,487</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247h</div>
                <p className="text-xs text-muted-foreground">This quarter</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+42%</div>
                <p className="text-xs text-muted-foreground">Productivity boost</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Module Features - PATCH 387 Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Drag-and-drop workflow builder interface</li>
                <li>✅ Support for triggers (schedule, events, webhooks, manual)</li>
                <li>✅ Multiple action types (email, notifications, tasks, AI agents)</li>
                <li>✅ Zapier/Make integration via webhooks</li>
                <li>✅ Comprehensive execution logging and history</li>
                <li>✅ Visual workflow creation and editing</li>
                <li>✅ Export/import workflow definitions</li>
                <li>✅ Real-time execution status monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <WorkflowExecutionLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskAutomation;
