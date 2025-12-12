/**
import { useEffect, useState } from "react";;
 * PATCH 93.0 - System Watchdog UI Component
 * Real-time system monitoring dashboard with AI diagnostics
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Zap,
  Database,
  Brain,
  Route as RouteIcon,
  Shield
} from "lucide-react";
import { watchdogService, HealthCheckResult, WatchdogEvent } from "./watchdog-service";
import { logger } from "@/lib/logger";

export default function SystemWatchdog() {
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [recentEvents, setRecentEvents] = useState<WatchdogEvent[]>([]);
  const [isRunningDiagnosis, setIsRunningDiagnosis] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string>("");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    // Start watchdog service
    watchdogService.start();

    // Initial load
    loadHealthStatus();
    loadRecentEvents();

    // Auto-refresh
    let interval: NodeJS.Timeout | null = null;
    if (isAutoRefresh) {
      interval = setInterval(() => {
        loadHealthStatus();
        loadRecentEvents();
      }, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  const loadHealthStatus = async () => {
    try {
      const results = await watchdogService.runFullHealthCheck();
      setHealthResults(results);
    } catch (err) {
      logger.error("[SystemWatchdog] Failed to load health status:", err);
    }
  };

  const loadRecentEvents = () => {
    const events = watchdogService.getRecentEvents(5);
    setRecentEvents(events);
  };

  const handleRunDiagnosis = async () => {
    setIsRunningDiagnosis(true);
    try {
      const result = await watchdogService.runDiagnosis();
      setDiagnosisResult(result);
    } catch (err) {
      setDiagnosisResult("Failed to run diagnosis");
      logger.error("[SystemWatchdog] Diagnosis error:", err);
    } finally {
      setIsRunningDiagnosis(false);
      loadRecentEvents();
    }
  };

  const handleClearCache = async () => {
    await watchdogService.clearCache();
    loadRecentEvents();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "offline":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
    case "supabase":
      return <Database className="h-5 w-5" />;
    case "ai-service":
      return <Brain className="h-5 w-5" />;
    case "routing":
      return <RouteIcon className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
    }
  };

  const getEventBadgeVariant = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
    case "error":
      return "destructive";
    case "warning":
      return "outline";
    case "success":
      return "default";
    default:
      return "secondary";
    }
  };

  const overallStatus = healthResults.every(r => r.status === "online") 
    ? "online" 
    : healthResults.some(r => r.status === "offline") 
      ? "offline" 
      : "degraded";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Watchdog
          </h1>
          <p className="text-muted-foreground mt-1">
            Autonomous monitoring with AI-based diagnostics and auto-healing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefresh ? "animate-spin" : ""}`} />
            {isAutoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHealthStatus}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            System Status
          </CardTitle>
          <CardDescription>
            Overall health of monitored services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {overallStatus === "online" && "All Systems Operational"}
                {overallStatus === "degraded" && "Some Services Degraded"}
                {overallStatus === "offline" && "Critical Services Offline"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Last checked: {healthResults[0]?.timestamp.toLocaleTimeString() || "Never"}
              </p>
            </div>
            <Badge 
              variant={overallStatus === "online" ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {overallStatus.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Status by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Checks</CardTitle>
          <CardDescription>
            Real-time status of core system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthResults.map((result) => (
              <div 
                key={result.service}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getServiceIcon(result.service)}
                  <div>
                    <p className="font-medium capitalize">{result.service.replace("-", " ")}</p>
                    {result.message && (
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {result.latency && (
                    <span className="text-sm text-muted-foreground">
                      {result.latency}ms
                    </span>
                  )}
                  {getStatusIcon(result.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI System Diagnosis
          </CardTitle>
          <CardDescription>
            Run AI-powered analysis of system logs and errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleRunDiagnosis}
              disabled={isRunningDiagnosis}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isRunningDiagnosis ? "Running Diagnosis..." : "Run Diagnostic Now"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </div>
          
          {diagnosisResult && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Analysis:</strong> {diagnosisResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>
            Last 5 system events and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent events
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <Badge variant={getEventBadgeVariant(event.type)}>
                    {event.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.service}</p>
                    <p className="text-sm text-muted-foreground">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Healing Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Healing Actions
          </CardTitle>
          <CardDescription>
            Available automatic recovery operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Module Restart</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically restart failed modules
              </p>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Cache Clearing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clear module cache to resolve issues
              </p>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Route Rebuild</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Rebuild broken routes automatically
              </p>
              <Badge variant="outline">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
