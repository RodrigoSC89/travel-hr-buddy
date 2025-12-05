/**
 * Health Check Dashboard - PATCH 850
 * Visual dashboard for system health monitoring
 */

import { useEffect, useState } from "react";
import { performHealthCheck, HealthStatus } from "@/lib/module-health";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Activity, Shield } from "lucide-react";
import { ProductionHealthDashboard, SystemDiagnosticsPanel, PerformanceMonitor, ProductionChecklist } from "@/components/production";

export default function HealthCheckPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = () => {
    setLoading(true);
    setTimeout(() => {
      const result = performHealthCheck();
      setHealth(result);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "healthy" || status === "pass" 
      ? "default" 
      : status === "degraded" 
      ? "secondary" 
      : "destructive";

    return (
      <Badge variant={variant} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!health) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Produção
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="mt-6 space-y-6">
          <ProductionChecklist />
          <div className="grid gap-6 md:grid-cols-2">
            <ProductionHealthDashboard autoRun={true} />
            <PerformanceMonitor />
          </div>
          <SystemDiagnosticsPanel />
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            System Health Check
            {getStatusIcon(health.status)}
            {getStatusBadge(health.status)}
          </h1>
          <p className="text-muted-foreground mt-1">
            Last checked: {new Date(health.timestamp).toLocaleString()}
          </p>
        </div>
        <Button onClick={runCheck} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Errors */}
      {health.errors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {health.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {health.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {health.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Health Checks */}
      <div className="grid gap-6 md:grid-cols-3 space-y-6">
        {/* Modules Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Modules</span>
              {getStatusIcon(health.checks.modules.status)}
            </CardTitle>
            <CardDescription>Module registry health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{health.checks.modules.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">{health.checks.modules.active}</p>
              </div>
            </div>
            {health.checks.modules.issues.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Issues:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {health.checks.modules.issues.slice(0, 3).map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                  {health.checks.modules.issues.length > 3 && (
                    <li>• ... and {health.checks.modules.issues.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Routes Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Routes</span>
              {getStatusIcon(health.checks.routes.status)}
            </CardTitle>
            <CardDescription>Route configuration health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Routes</p>
                <p className="text-2xl font-bold">{health.checks.routes.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duplicates</p>
                <p className={`text-2xl font-bold ${health.checks.routes.duplicates.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {health.checks.routes.duplicates.length}
                </p>
              </div>
            </div>
            {health.checks.routes.duplicates.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Duplicate Routes:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {health.checks.routes.duplicates.map((dup, i) => (
                    <li key={i}>• {dup}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dependencies Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dependencies</span>
              {getStatusIcon(health.checks.dependencies.status)}
            </CardTitle>
            <CardDescription>Module dependencies health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Missing</p>
                <p className={`text-2xl font-bold ${health.checks.dependencies.missing.length > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {health.checks.dependencies.missing.length}
                </p>
              </div>
            </div>
            {health.checks.dependencies.missing.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Missing Dependencies:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {health.checks.dependencies.missing.slice(0, 3).map((dep, i) => (
                    <li key={i}>
                      • {dep.module} → {dep.dependency}
                    </li>
                  ))}
                  {health.checks.dependencies.missing.length > 3 && (
                    <li>• ... and {health.checks.dependencies.missing.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </TabsContent>
      </Tabs>
    </div>
  );
}
