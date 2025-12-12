/**
import { useEffect, useState, useCallback } from "react";;
 * Real-Time Monitoring Dashboard - PATCH 67.5
 * Live metrics visualization with performance, errors, and analytics
 */

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, TrendingUp, Users, Zap } from "lucide-react";
import { performanceMonitor, WebVitalMetric, PerformanceSnapshot } from "@/lib/monitoring/performance-monitor";
import { errorTracker, TrackedError } from "@/lib/monitoring/error-tracker";
import { userAnalytics } from "@/lib/monitoring/user-analytics";

export default function RealTimeMonitoringDashboard() {
  const [perfSnapshot, setPerfSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [recentErrors, setRecentErrors] = useState<TrackedError[]>([]);
  const [analytics, setAnalytics] = useState<unknown>(null);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, WebVitalMetric>>({});

  useEffect(() => {
    // Initialize monitoring
    performanceMonitor.initialize();
    errorTracker.initialize();
    userAnalytics.initialize();

    // Subscribe to live metrics
    const unsubscribe = performanceMonitor.subscribe((metric) => {
      setLiveMetrics(prev => ({
        ...prev,
        [metric.name]: metric,
      }));
  });

    // Subscribe to errors
    const unsubscribeErrors = errorTracker.subscribe((error) => {
      setRecentErrors(prev => [error, ...prev].slice(0, 10));
  });

    // Update snapshot every 5 seconds
    const interval = setInterval(() => {
      setPerfSnapshot(performanceMonitor.getSnapshot());
      setAnalytics(userAnalytics.getSummary());
    }, 5000);

    // Initial load
    setPerfSnapshot(performanceMonitor.getSnapshot());
    setRecentErrors(errorTracker.getErrors().slice(0, 10));
    setAnalytics(userAnalytics.getSummary());

    return () => {
      unsubscribe();
      unsubscribeErrors();
      clearInterval(interval);
    };
  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
    case "good": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "needs-improvement": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "poor": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const formatValue = (metric: WebVitalMetric) => {
    if (metric.name === "CLS") {
      return metric.value.toFixed(3);
    }
    return `${Math.round(metric.value)}ms`;
  });

  const errorStats = errorTracker.getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Monitoring</h2>
          <p className="text-muted-foreground">
            Live performance, errors, and user analytics
          </p>
        </div>
        <Activity className="h-6 w-6 text-primary animate-pulse" />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Errors ({errorStats.total})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Users className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Web Vitals */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(liveMetrics).map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {metric.name}
                    <Badge className={getRatingColor(metric.rating)}>
                      {metric.rating}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatValue(metric)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {new Date(metric.timestamp).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resource Performance */}
          {perfSnapshot && perfSnapshot.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resource Loading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {perfSnapshot.resources
                    .filter(r => r.duration > 500)
                    .slice(0, 5)
                    .map((resource, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <div className="flex-1 truncate">
                          <span className="text-xs font-mono">{resource.name.split("/").pop()}</span>
                          <span className="text-xs text-muted-foreground ml-2">({resource.type})</span>
                        </div>
                        <Badge variant="outline">{Math.round(resource.duration)}ms</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memory Usage */}
          {perfSnapshot?.memory && (
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Used Heap</span>
                    <span className="font-medium">
                      {(perfSnapshot.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Heap</span>
                    <span className="font-medium">
                      {(perfSnapshot.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${(perfSnapshot.memory.usedJSHeapSize / perfSnapshot.memory.totalJSHeapSize) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-4">
          {/* Error Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Unique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorStats.unique}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{errorStats.errorRate}/hr</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(errorStats.byCategory).map(([cat, count]) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentErrors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No errors recorded 🎉</p>
                ) : (
                  recentErrors.map((error) => (
                    <div key={error.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <Badge variant="outline">{error.category}</Badge>
                            {error.count > 1 && (
                              <Badge variant="secondary">×{error.count}</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{error.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {error.context && Object.keys(error.context).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <code className="bg-muted px-2 py-1 rounded">
                            {JSON.stringify(error.context, null, 2)}
                          </code>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Session Info */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.engagement.sessionDuration / 1000)}s
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.pageViews.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Events Tracked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.events.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Avg Page Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(analytics.engagement.avgPageDuration / 1000)}s
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.events.recent.map((event: unknown, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <div>
                          <span className="text-sm font-medium">{event.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {event.category}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
