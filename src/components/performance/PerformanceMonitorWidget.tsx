/**
 * Performance Monitor Widget
 * Compact widget showing real-time performance metrics
 */

import { useState, useEffect } from 'react';
import { Activity, Gauge, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { webVitalsMonitor, type VitalMetric } from '@/lib/web-vitals-monitor';

interface PerformanceMonitorWidgetProps {
  className?: string;
  compact?: boolean;
}

const METRIC_CONFIG: Record<string, { 
  icon: typeof Activity; 
  label: string; 
  unit: string;
  format: (v: number) => string;
}> = {
  LCP: { 
    icon: Gauge, 
    label: 'LCP', 
    unit: 's',
    format: (v) => (v / 1000).toFixed(2)
  },
  FCP: { 
    icon: Zap, 
    label: 'FCP', 
    unit: 's',
    format: (v) => (v / 1000).toFixed(2)
  },
  CLS: { 
    icon: Activity, 
    label: 'CLS', 
    unit: '',
    format: (v) => v.toFixed(3)
  },
  TTFB: { 
    icon: Activity, 
    label: 'TTFB', 
    unit: 'ms',
    format: (v) => v.toFixed(0)
  },
  INP: { 
    icon: Activity, 
    label: 'INP', 
    unit: 'ms',
    format: (v) => v.toFixed(0)
  },
};

const getRatingColor = (rating: VitalMetric['rating']): string => {
  switch (rating) {
    case 'good':
      return 'text-success bg-success/10';
    case 'needs-improvement':
      return 'text-warning bg-warning/10';
    case 'poor':
      return 'text-destructive bg-destructive/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export function PerformanceMonitorWidget({ 
  className,
  compact = false 
}: PerformanceMonitorWidgetProps) {
  const [metrics, setMetrics] = useState<Record<string, VitalMetric>>({});
  const [score, setScore] = useState<{ score: number; rating: string }>({ score: 0, rating: 'unknown' });

  useEffect(() => {
    // Get initial metrics
    setMetrics(webVitalsMonitor.getMetrics());
    const scoreData = webVitalsMonitor.getScore();
    setScore({ score: scoreData.score, rating: scoreData.rating });

    // Subscribe to updates
    const unsubscribe = webVitalsMonitor.onMetric(() => {
      setMetrics(webVitalsMonitor.getMetrics());
      const newScore = webVitalsMonitor.getScore();
      setScore({ score: newScore.score, rating: newScore.rating });
    });

    return unsubscribe;
  }, []);

  const metricEntries = Object.entries(metrics);
  const hasIssues = metricEntries.some(([_, m]) => m.rating === 'poor');

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        hasIssues ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success',
        className
      )}>
        {hasIssues ? (
          <AlertTriangle className="h-3 w-3" />
        ) : (
          <Gauge className="h-3 w-3" />
        )}
        <span>Perf: {score.score}%</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg border bg-card p-4 space-y-4',
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Performance
        </h3>
        <div className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          score.rating === 'good' ? 'bg-success/10 text-success' :
          score.rating === 'needs-improvement' ? 'bg-warning/10 text-warning' :
          'bg-destructive/10 text-destructive'
        )}>
          Score: {score.score}%
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {metricEntries.map(([name, metric]) => {
          const config = METRIC_CONFIG[name];
          if (!config) return null;
          
          const Icon = config.icon;
          
          return (
            <div 
              key={name}
              className={cn(
                'p-2 rounded-md flex items-center gap-2',
                getRatingColor(metric.rating)
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <div>
                <div className="text-[10px] opacity-70">{config.label}</div>
                <div className="text-xs font-medium">
                  {config.format(metric.value)}{config.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasIssues && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-warning" />
          Some metrics need improvement
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitorWidget;
