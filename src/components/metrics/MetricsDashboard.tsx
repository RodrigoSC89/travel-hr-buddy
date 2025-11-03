/**
 * PATCH-601: System Metrics Dashboard
 * Real-time system health and performance metrics visualization
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database,
  Wifi,
  Lock,
  HardDrive,
  Globe
} from "lucide-react";
import type { SystemHealthStatus, HealthCheckResult } from "@/lib/health-check";
import { performHealthCheck, healthMonitor } from "@/lib/health-check";
import { logger } from "@/lib/logger";

const getStatusIcon = (status: "healthy" | "degraded" | "unhealthy") => {
  switch (status) {
  case "healthy":
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  case "degraded":
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  case "unhealthy":
    return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const getStatusColor = (status: "healthy" | "degraded" | "unhealthy") => {
  switch (status) {
  case "healthy":
    return "bg-green-500/10 text-green-700 border-green-500/20";
  case "degraded":
    return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
  case "unhealthy":
    return "bg-red-500/10 text-red-700 border-red-500/20";
  }
};

const getServiceIcon = (service: string) => {
  switch (service) {
  case "supabase":
    return <Database className="h-4 w-4" />;
  case "api":
    return <Globe className="h-4 w-4" />;
  case "auth":
    return <Lock className="h-4 w-4" />;
  case "storage":
    return <HardDrive className="h-4 w-4" />;
  case "network":
    return <Wifi className="h-4 w-4" />;
  default:
    return <Activity className="h-4 w-4" />;
  }
};

interface ServiceCheckCardProps {
  check: HealthCheckResult;
}

const ServiceCheckCard: React.FC<ServiceCheckCardProps> = ({ check }) => {
  return (
    <Card className={`border ${getStatusColor(check.status)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getServiceIcon(check.service)}
            <CardTitle className="text-sm font-medium capitalize">
              {check.service}
            </CardTitle>
          </div>
          {getStatusIcon(check.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Response Time</span>
          <Badge variant="outline" className="font-mono">
            {check.responseTime}ms
          </Badge>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Status</span>
          <Badge className={getStatusColor(check.status)}>
            {check.status}
          </Badge>
        </div>
        {check.error && (
          <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
            {check.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MetricsDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performHealthCheck()
      .then((status) => {
        setHealthStatus(status);
        setLoading(false);
      })
      .catch((error) => {
        logger.error("Failed to perform health check", error);
        setLoading(false);
      });

    const unsubscribe = healthMonitor.subscribe((status) => {
      setHealthStatus(status);
    });

    healthMonitor.start(60000);

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading && !healthStatus) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className={`border-2 ${healthStatus ? getStatusColor(healthStatus.overall) : ""}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {healthStatus && getStatusIcon(healthStatus.overall)}
            <div>
              <CardTitle>System Health Status</CardTitle>
              <CardDescription>
                Last checked: {healthStatus?.lastChecked.toLocaleTimeString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold font-playfair mb-1">
                {healthStatus?.overall.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">Overall Status</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold font-playfair mb-1">
                {healthStatus?.checks.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Services Monitored</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold font-playfair mb-1">
                {healthStatus ? Math.round(healthStatus.uptime / 1000) : 0}s
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthStatus?.checks.map((check) => (
          <ServiceCheckCard key={check.service} check={check} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Summary</CardTitle>
          <CardDescription>Service health distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xl font-bold text-green-700">
                  {healthStatus?.checks.filter((c) => c.status === "healthy").length || 0}
                </span>
              </div>
              <div className="text-xs text-green-600">Healthy</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xl font-bold text-yellow-700">
                  {healthStatus?.checks.filter((c) => c.status === "degraded").length || 0}
                </span>
              </div>
              <div className="text-xs text-yellow-600">Degraded</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-xl font-bold text-red-700">
                  {healthStatus?.checks.filter((c) => c.status === "unhealthy").length || 0}
                </span>
              </div>
              <div className="text-xs text-red-600">Unhealthy</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;
