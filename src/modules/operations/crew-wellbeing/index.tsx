import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Users, TrendingUp, Brain, AlertCircle, MessageCircle, Calendar, Plus, Loader2 } from "lucide-react";
import { HealthMetricsDashboard } from "./components/HealthMetricsDashboard";
import { supabase } from "@/integrations/supabase/client";

interface WellbeingAlert {
  id: string;
  user_name: string;
  severity: "warning" | "critical" | "info";
  message: string;
  created_at: string;
}

interface SupportRequest {
  id: string;
  urgency: "high" | "medium" | "low";
  category: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
}

const CrewWellbeing = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [recentAlerts, setRecentAlerts] = useState<WellbeingAlert[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWellbeingData();
  }, []);

  const loadWellbeingData = async () => {
    try {
      setLoading(true);
      // Fetch real data from Supabase - alerts from notifications table
      const { data: alertsData } = await supabase
        .from("notifications")
        .select("id, title, message, type, created_at")
        .eq("type", "wellbeing_alert")
        .order("created_at", { ascending: false })
        .limit(10);

      if (alertsData) {
        setRecentAlerts(alertsData.map(a => ({
          id: a.id,
          user_name: a.title || "Crew Member",
          severity: (a.type === "error" ? "critical" : "warning") as "warning" | "critical",
          message: a.message || "",
          created_at: a.created_at
        })));
      }

      // Fetch support requests from action_items
      const { data: requestsData } = await supabase
        .from("action_items")
        .select("id, title, priority, status, created_at")
        .eq("source_module", "crew-wellbeing")
        .order("created_at", { ascending: false })
        .limit(10);

      if (requestsData) {
        setSupportRequests(requestsData.map(r => ({
          id: r.id,
          urgency: (r.priority === "high" || r.priority === "critical" ? "high" : r.priority === "medium" ? "medium" : "low") as "high" | "medium" | "low",
          category: r.title || "Support Request",
          status: (r.status === "completed" ? "resolved" : r.status === "in_progress" ? "in_progress" : "pending") as "pending" | "in_progress" | "resolved",
          created_at: r.created_at || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error("Error loading wellbeing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

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
          <TabsTrigger value="dashboard">My Health Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <HealthMetricsDashboard />
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum alerta de bem-estar no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className={`h-5 w-5 ${
                          alert.severity === "critical" ? "text-destructive" : "text-warning"
                        }`} />
                        <div>
                          <div className="font-medium">{alert.user_name}</div>
                          <div className="text-sm text-muted-foreground">{alert.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.created_at)}</div>
                        </div>
                      </div>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "default"}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : supportRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum pedido de suporte ativo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supportRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-secondary" />
                        <div>
                          <div className="font-medium">{request.category}</div>
                          <div className="text-sm text-muted-foreground">{formatTimeAgo(request.created_at)}</div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrewWellbeing;
