/**
 * Scaling Dashboard Component - PROMPT 18
 * Dashboard de monitoramento de escalabilidade
 */

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Globe, 
  Gauge, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  scalingService, 
  AVAILABLE_REGIONS,
  type ScalingMetrics 
} from '@/lib/scaling/scaling-strategy';
import { cn } from '@/lib/utils';

export function ScalingDashboard() {
  const [metrics, setMetrics] = useState<ScalingMetrics | null>(null);
  const [healthCheck, setHealthCheck] = useState<{
    healthy: boolean;
    checks: Record<string, { status: 'ok' | 'warning' | 'critical'; message: string }>;
  } | null>(null);
  const [capacityReport, setCapacityReport] = useState<{
    current_capacity: number;
    max_capacity: number;
    utilization_percent: number;
    recommendations: string[];
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    // Simular métricas (em produção viriam de monitoring real)
    const mockMetrics: ScalingMetrics = {
      current_users: Math.floor(Math.random() * 5000) + 1000,
      peak_users: 8500,
      requests_per_second: Math.floor(Math.random() * 500) + 100,
      database_connections: Math.floor(Math.random() * 50) + 20,
      cache_hit_rate: 85 + Math.random() * 10,
      average_response_time_ms: Math.floor(Math.random() * 200) + 100,
      error_rate_percent: Math.random() * 2,
      memory_usage_percent: 40 + Math.random() * 30,
      cpu_usage_percent: 30 + Math.random() * 40
    };

    scalingService.updateMetrics(mockMetrics);
    setMetrics(mockMetrics);

    const health = await scalingService.performHealthCheck();
    setHealthCheck(health);

    const capacity = scalingService.generateCapacityReport();
    setCapacityReport(capacity);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'critical') => {
    switch (status) {
      case 'ok': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scaling Dashboard</h2>
          <p className="text-muted-foreground">System performance and capacity monitoring</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.current_users.toLocaleString() || '-'}</div>
            <p className="text-xs text-muted-foreground">
              Peak: {metrics?.peak_users.toLocaleString() || '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Requests/sec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.requests_per_second || '-'}</div>
            <p className="text-xs text-muted-foreground">
              Avg Response: {metrics?.average_response_time_ms}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cache Hit Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cache_hit_rate.toFixed(1)}%</div>
            <Progress value={metrics?.cache_hit_rate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              (metrics?.error_rate_percent || 0) > 1 ? 'text-red-500' : 'text-green-500'
            )}>
              {metrics?.error_rate_percent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Target: &lt; 1%</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Status & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {healthCheck?.healthy 
                ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                : <AlertTriangle className="h-5 w-5 text-yellow-500" />
              }
              System Health
            </CardTitle>
            <CardDescription>
              {healthCheck?.healthy ? 'All systems operational' : 'Some issues detected'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthCheck?.checks && Object.entries(healthCheck.checks).map(([key, check]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <span className="capitalize">{key}</span>
                  </div>
                  <span className={cn("text-sm", getStatusColor(check.status))}>
                    {check.message}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity Utilization</CardTitle>
            <CardDescription>
              {capacityReport?.utilization_percent.toFixed(1)}% of maximum capacity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={capacityReport?.utilization_percent || 0} 
              className="h-4 mb-4"
            />
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-lg font-semibold">
                  {capacityReport?.current_capacity.toLocaleString()} users
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="text-lg font-semibold">
                  {capacityReport?.max_capacity.toLocaleString()} users
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-sm font-medium mb-2">Recommendations</p>
              <ul className="space-y-1">
                {capacityReport?.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Available Regions
          </CardTitle>
          <CardDescription>Multi-region deployment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_REGIONS.map(region => (
              <div 
                key={region.id}
                className={cn(
                  "p-4 rounded-lg border",
                  region.status === 'active' && 'bg-green-500/10 border-green-500/20',
                  region.status === 'standby' && 'bg-yellow-500/10 border-yellow-500/20',
                  region.status === 'maintenance' && 'bg-red-500/10 border-red-500/20'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{region.name}</span>
                  <Badge variant={
                    region.status === 'active' ? 'default' : 
                    region.status === 'standby' ? 'secondary' : 'destructive'
                  }>
                    {region.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{region.location}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Target latency: {region.latency_target_ms}ms
                </p>
                {region.primary && (
                  <Badge variant="outline" className="mt-2">Primary</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.cpu_usage_percent.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={metrics?.cpu_usage_percent || 0}
                className={cn(
                  (metrics?.cpu_usage_percent || 0) > 80 && "[&>div]:bg-red-500"
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.memory_usage_percent.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={metrics?.memory_usage_percent || 0}
                className={cn(
                  (metrics?.memory_usage_percent || 0) > 80 && "[&>div]:bg-red-500"
                )}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">DB Connections</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.database_connections} / 100
                </span>
              </div>
              <Progress 
                value={metrics?.database_connections || 0}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScalingDashboard;
