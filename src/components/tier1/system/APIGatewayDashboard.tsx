/**
 * API Gateway Dashboard - Tier-1
 * Benchmark: Kong Gateway + AWS API Gateway
 * Features:
 * - Real-time API metrics & monitoring
 * - Rate limiting visualization
 * - Endpoint health status
 * - Request/Response analytics
 * - Error tracking & debugging
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, Zap, Shield, Clock, Globe, AlertTriangle,
  CheckCircle, TrendingUp, Server, Lock, RefreshCw,
  BarChart3, Eye, Settings, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface APIEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: "healthy" | "degraded" | "down";
  latency: number;
  requests24h: number;
  errors24h: number;
}

export default function APIGatewayDashboard() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Sample API endpoints data
  const endpoints: APIEndpoint[] = [
    { path: "/api/vessels", method: "GET", status: "healthy", latency: 45, requests24h: 12500, errors24h: 3 },
    { path: "/api/crew", method: "GET", status: "healthy", latency: 52, requests24h: 8900, errors24h: 1 },
    { path: "/api/maintenance", method: "GET", status: "healthy", latency: 48, requests24h: 5600, errors24h: 0 },
    { path: "/api/compliance", method: "GET", status: "healthy", latency: 55, requests24h: 4200, errors24h: 2 },
    { path: "/api/ai-chat", method: "POST", status: "healthy", latency: 1250, requests24h: 890, errors24h: 5 },
    { path: "/api/documents", method: "POST", status: "degraded", latency: 320, requests24h: 2100, errors24h: 45 },
    { path: "/api/weather", method: "GET", status: "healthy", latency: 180, requests24h: 15600, errors24h: 12 },
    { path: "/api/ais-tracking", method: "GET", status: "healthy", latency: 95, requests24h: 28000, errors24h: 8 },
  ];

  // KPIs
  const kpis = {
    totalRequests: endpoints.reduce((sum, e) => sum + e.requests24h, 0),
    avgLatency: Math.round(endpoints.reduce((sum, e) => sum + e.latency, 0) / endpoints.length),
    uptime: 99.97,
    errorRate: 0.08,
    healthyEndpoints: endpoints.filter(e => e.status === "healthy").length,
    totalEndpoints: endpoints.length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy": return <Badge className="bg-success text-white gap-1"><CheckCircle className="h-3 w-3" />Healthy</Badge>;
      case "degraded": return <Badge className="bg-warning text-white gap-1"><AlertTriangle className="h-3 w-3" />Degraded</Badge>;
      case "down": return <Badge className="bg-destructive text-white gap-1"><AlertTriangle className="h-3 w-3" />Down</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-success/20 text-success",
      POST: "bg-primary/20 text-primary",
      PUT: "bg-warning/20 text-warning",
      DELETE: "bg-destructive/20 text-destructive"
    };
    return <Badge variant="outline" className={colors[method]}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            API Gateway
          </h2>
          <p className="text-muted-foreground">Real-time API monitoring & management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            {kpis.uptime}% Uptime
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">API Performance Insight</h3>
              <p className="text-sm text-muted-foreground">
                /api/documents showing 2.1% error rate - possible disk I/O bottleneck. Consider scaling storage tier.
              </p>
            </div>
            <Button variant="outline" size="sm">Investigate</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{(kpis.totalRequests / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Requests (24h)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.avgLatency}ms</p>
            <p className="text-xs text-muted-foreground">Avg Latency</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.uptime}%</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.errorRate}%</p>
            <p className="text-xs text-muted-foreground">Error Rate</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="p-4 text-center">
            <Server className="h-5 w-5 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{kpis.healthyEndpoints}/{kpis.totalEndpoints}</p>
            <p className="text-xs text-muted-foreground">Healthy Endpoints</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">Active</p>
            <p className="text-xs text-muted-foreground">Rate Limiting</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                API Endpoints
              </CardTitle>
              <CardDescription>Monitor health and performance of all API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                      selectedEndpoint === endpoint.path ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedEndpoint(endpoint.path)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMethodBadge(endpoint.method)}
                        <span className="font-mono text-sm font-medium">{endpoint.path}</span>
                      </div>
                      {getStatusBadge(endpoint.status)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Latency</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {endpoint.latency}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Requests (24h)</p>
                        <p className="text-sm font-medium">{endpoint.requests24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Errors (24h)</p>
                        <p className={`text-sm font-medium ${endpoint.errors24h > 10 ? "text-destructive" : ""}`}>
                          {endpoint.errors24h}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Error Rate</p>
                        <p className="text-sm font-medium">
                          {((endpoint.errors24h / endpoint.requests24h) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "< 100ms", value: 65, color: "bg-success" },
                    { label: "100-500ms", value: 25, color: "bg-warning" },
                    { label: "500ms-1s", value: 8, color: "bg-warning" },
                    { label: "> 1s", value: 2, color: "bg-destructive" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
                      <Progress value={item.value} className={`flex-1 h-3 [&>div]:${item.color}`} />
                      <span className="w-12 text-right text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpoints
                    .sort((a, b) => b.requests24h - a.requests24h)
                    .slice(0, 5)
                    .map((endpoint, idx) => (
                      <div key={endpoint.path} className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 justify-center">{idx + 1}</Badge>
                        <span className="flex-1 font-mono text-sm truncate">{endpoint.path}</span>
                        <span className="text-sm font-medium">{(endpoint.requests24h / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Rate Limiting Configuration
              </CardTitle>
              <CardDescription>Protect APIs from abuse with configurable rate limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Standard Tier</h4>
                    <p className="text-2xl font-bold">100 req/min</p>
                    <p className="text-sm text-muted-foreground mt-2">General API access</p>
                    <Progress value={45} className="mt-3 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">45% utilization avg</p>
                  </CardContent>
                </Card>

                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">AI/ML Tier</h4>
                    <p className="text-2xl font-bold">10 req/min</p>
                    <p className="text-sm text-muted-foreground mt-2">AI chat & analysis endpoints</p>
                    <Progress value={62} className="mt-3 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">62% utilization avg</p>
                  </CardContent>
                </Card>

                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Premium Tier</h4>
                    <p className="text-2xl font-bold">500 req/min</p>
                    <p className="text-sm text-muted-foreground mt-2">Enterprise customers</p>
                    <Progress value={28} className="mt-3 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">28% utilization avg</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Recent Request Logs
              </CardTitle>
              <CardDescription>Real-time API request monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm max-h-[400px] overflow-y-auto">
                {[
                  { time: "12:45:32", method: "GET", path: "/api/vessels", status: 200, latency: 45 },
                  { time: "12:45:31", method: "POST", path: "/api/ai-chat", status: 200, latency: 1250 },
                  { time: "12:45:30", method: "GET", path: "/api/weather", status: 200, latency: 180 },
                  { time: "12:45:29", method: "GET", path: "/api/ais-tracking", status: 200, latency: 95 },
                  { time: "12:45:28", method: "POST", path: "/api/documents", status: 500, latency: 320 },
                  { time: "12:45:27", method: "GET", path: "/api/crew", status: 200, latency: 52 },
                ].map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded flex items-center gap-4 ${
                      log.status >= 400 ? "bg-destructive/10" : "bg-muted/30"
                    }`}
                  >
                    <span className="text-muted-foreground">{log.time}</span>
                    <Badge variant="outline" className={log.method === "POST" ? "bg-primary/20" : "bg-success/20"}>
                      {log.method}
                    </Badge>
                    <span className="flex-1">{log.path}</span>
                    <Badge className={log.status >= 400 ? "bg-destructive" : "bg-success"}>
                      {log.status}
                    </Badge>
                    <span className="text-muted-foreground">{log.latency}ms</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
