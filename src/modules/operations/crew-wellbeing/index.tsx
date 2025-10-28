import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Users, TrendingUp, Brain, AlertCircle, MessageCircle, Calendar, Plus } from "lucide-react";
import { HealthCheckIn } from "./components/HealthCheckIn";
import { AIInsights } from "./components/AIInsights";
import { MoodDashboard } from "./components/MoodDashboard";
import { HealthCheckin } from "./components/HealthCheckin";
import { HealthCheckInForm } from "./components/HealthCheckInForm";
import { HealthMetricsDashboard } from "./components/HealthMetricsDashboard";

const CrewWellbeing = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for new features
  const recentAlerts = [
    {
      id: 1,
      user: "John Doe",
      severity: "warning",
      message: "High stress levels detected",
      date: "2 hours ago"
    },
    {
      id: 2,
      user: "Jane Smith",
      severity: "critical",
      message: "Critical wellbeing risk - low sleep",
      date: "5 hours ago"
    }
  ];

  const supportRequests = [
    {
      id: 1,
      urgency: "high",
      category: "Mental Health",
      status: "pending",
      date: "1 hour ago"
    },
    {
      id: 2,
      urgency: "medium",
      category: "Work-Life Balance",
      status: "in_progress",
      date: "3 hours ago"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Crew Wellbeing</h1>
            <p className="text-sm text-muted-foreground">Health & Psychological Support System</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Request Support
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checkin">Health Check-in</TabsTrigger>
          <TabsTrigger value="dashboard">My Health Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <HealthMetricsDashboard />
        </TabsContent>

        <TabsContent value="checkin" className="space-y-6">
          <HealthCheckInForm onSuccess={() => setActiveTab("dashboard")} />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <HealthMetricsDashboard />
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Wellbeing Alerts</CardTitle>
              <CardDescription>Team members requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`h-5 w-5 ${
                        alert.severity === "critical" ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div>
                        <div className="font-medium">{alert.user}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">{alert.date}</div>
                      </div>
                    </div>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "default"}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Psychological Support Requests</CardTitle>
              <CardDescription>Active support cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">{request.category}</div>
                        <div className="text-sm text-muted-foreground">{request.date}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={request.urgency === "high" ? "destructive" : "default"}>
                        {request.urgency}
                      </Badge>
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewWellbeing;
