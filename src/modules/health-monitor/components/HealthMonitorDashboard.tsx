// PATCH 623: Health Monitor Dashboard
import { useHealthCheck } from '../hooks/useHealthCheck';
import { ServiceStatusCard } from './ServiceStatusCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export function HealthMonitorDashboard() {
  const { 
    systemHealth, 
    services, 
    isChecking, 
    runHealthCheck 
  } = useHealthCheck({ 
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    showToasts: true
  });

  const overallStatusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      label: 'All Systems Operational'
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      label: 'Performance Degraded'
    },
    down: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      label: 'System Issues Detected'
    }
  };

  const config = systemHealth 
    ? overallStatusConfig[systemHealth.overall]
    : overallStatusConfig.healthy;
  
  const OverallIcon = config.icon;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of all system services
          </p>
        </div>
        <Button
          onClick={() => runHealthCheck()}
          disabled={isChecking}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status Card */}
      <Card className={`${config.bgColor} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OverallIcon className={`h-8 w-8 ${config.color}`} />
              <div>
                <CardTitle className="text-2xl">{config.label}</CardTitle>
                <CardDescription>
                  {systemHealth && (
                    <>
                      Last checked: {format(systemHealth.lastCheck, 'PPpp')}
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={systemHealth?.overall === 'healthy' ? 'default' : 'secondary'}
              className="text-lg px-4 py-2"
            >
              {systemHealth?.overall.toUpperCase() || 'CHECKING...'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Auto-refresh: Every 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Services Monitored:</span>
              <span className="font-semibold">{services.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Service Status</h2>
        {isChecking && services.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Running health checks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceStatusCard key={service.service} result={service} />
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Health Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The health monitor automatically checks all critical services every 5 minutes.
          </p>
          <p>
            <strong>Status Indicators:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong className="text-green-600 dark:text-green-400">Healthy</strong>: Service is operating normally with fast response times</li>
            <li><strong className="text-yellow-600 dark:text-yellow-400">Degraded</strong>: Service is slow or partially impaired</li>
            <li><strong className="text-red-600 dark:text-red-400">Down</strong>: Service is unavailable or experiencing errors</li>
          </ul>
          <p className="mt-4">
            You will receive toast notifications when service status changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
