// PATCH 623: Service Status Card Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { HealthCheckResult, ServiceStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ServiceStatusCardProps {
  result: HealthCheckResult;
}

export function ServiceStatusCard({ result }: ServiceStatusCardProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      badge: 'default' as const
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      badge: 'secondary' as const
    },
    down: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      badge: 'destructive' as const
    }
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <span className="capitalize">{result.service}</span>
          </CardTitle>
          <Badge variant={config.badge} className="capitalize">
            {result.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Response Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Response Time
            </span>
            <span className="font-medium">{result.responseTime}ms</span>
          </div>

          {/* Last Checked */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last Checked
            </span>
            <span className="font-medium">
              {formatDistanceToNow(result.timestamp, { addSuffix: true })}
            </span>
          </div>

          {/* Error Message if any */}
          {result.error && (
            <div className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs">
              <strong>Error:</strong> {result.error}
            </div>
          )}

          {/* Metadata if any */}
          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
