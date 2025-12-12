/**
 * Web Vitals Dashboard Component
 * Displays Core Web Vitals metrics in real-time
 */

import { useWebVitals, PERFORMANCE_BUDGETS } from "@/lib/monitoring/web-vitals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Activity, Gauge, Timer, Move, Zap } from "lucide-react";

const metricConfig: Record<string, {
  label: string;
  unit: string;
  icon: typeof Activity;
  format: (value: number) => string;
}> = {
  LCP: {
    label: "Largest Contentful Paint",
    unit: "ms",
    icon: Timer,
    format: (v) => `${v.toFixed(0)}ms`,
  },
  CLS: {
    label: "Cumulative Layout Shift",
    unit: "",
    icon: Move,
    format: (v) => v.toFixed(3),
  },
  INP: {
    label: "Interaction to Next Paint",
    unit: "ms",
    icon: Zap,
    format: (v) => `${v.toFixed(0)}ms`,
  },
  FCP: {
    label: "First Contentful Paint",
    unit: "ms",
    icon: Activity,
    format: (v) => `${v.toFixed(0)}ms`,
  },
  TTFB: {
    label: "Time to First Byte",
    unit: "ms",
    icon: Gauge,
    format: (v) => `${v.toFixed(0)}ms`,
  },
};

const ratingColors = {
  good: "text-green-600 dark:text-green-400",
  "needs-improvement": "text-yellow-600 dark:text-yellow-400",
  poor: "text-red-600 dark:text-red-400",
};

const ratingBgColors = {
  good: "bg-green-500",
  "needs-improvement": "bg-yellow-500",
  poor: "bg-red-500",
};

export function WebVitalsDashboard({ className }: { className?: string }) {
  const { metrics, score } = useWebVitals();

  const getProgressValue = (name: string, value: number): number => {
    const budget = PERFORMANCE_BUDGETS[name as keyof typeof PERFORMANCE_BUDGETS];
    if (!budget) return 50;
    
    // Normalize to 0-100 where 100 is best
    if (value <= budget.good) return 100;
    if (value >= budget.poor) return 0;
    
    // Linear interpolation between good and poor
    return Math.round(100 * (budget.poor - value) / (budget.poor - budget.good));
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Core Web Vitals</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Score:</span>
            <span className={cn(
              "text-2xl font-bold",
              score >= 90 ? "text-green-600" :
                score >= 50 ? "text-yellow-600" : "text-red-600"
            )}>
              {score}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Coletando métricas...
          </p>
        ) : (
          metrics.map((metric) => {
            const config = metricConfig[metric.name];
            if (!config) return null;
            
            const Icon = config.icon;
            const progressValue = getProgressValue(metric.name, metric.value);

            return (
              <div key={metric.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-mono", ratingColors[metric.rating])}>
                      {config.format(metric.value)}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full text-white",
                      ratingBgColors[metric.rating]
                    )}>
                      {metric.rating === "good" ? "Bom" :
                        metric.rating === "needs-improvement" ? "Regular" : "Ruim"}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={progressValue} 
                  className="h-1.5"
                />
              </div>
            );
          })
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Navegação: {metrics[0]?.navigationType || "N/A"}</span>
            <span>URL: {window.location.pathname}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact Web Vitals indicator
 */
export function WebVitalsIndicator({ className }: { className?: string }) {
  const { score } = useWebVitals();

  const getColor = () => {
    if (score >= 90) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("h-2 w-2 rounded-full", getColor())} />
      <span className="text-xs font-medium">{score}</span>
    </div>
  );
}
