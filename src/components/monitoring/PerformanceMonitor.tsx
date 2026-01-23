/**
 * Performance Monitor Component
 * Real-time display of Core Web Vitals and system health
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Zap, Clock, Layout, Wifi, Server, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalMetric {
  name: string;
  value: number;
  unit: string;
  rating: "good" | "needs-improvement" | "poor";
  threshold: { good: number; needsImprovement: number };
}

interface PerformanceData {
  lcp: VitalMetric | null;
  fid: VitalMetric | null;
  cls: VitalMetric | null;
  ttfb: VitalMetric | null;
  memoryUsage: number | null;
  connectionType: string;
}

function getRating(value: number, good: number, needsImprovement: number): "good" | "needs-improvement" | "poor" {
  if (value <= good) return "good";
  if (value <= needsImprovement) return "needs-improvement";
  return "poor";
}

const ratingColors = {
  good: "bg-green-500/10 text-green-700 dark:text-green-400",
  "needs-improvement": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  poor: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const ratingLabels = {
  good: "Good",
  "needs-improvement": "Needs Improvement",
  poor: "Poor",
};

export function PerformanceMonitor() {
  const [data, setData] = useState<PerformanceData>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    memoryUsage: null,
    connectionType: "unknown",
  });
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    // Get connection info
    const connection = (navigator as unknown as { connection?: { effectiveType: string } }).connection;
    if (connection) {
      setData(prev => ({ ...prev, connectionType: connection.effectiveType }));
    }

    // Get memory info if available
    const performance = window.performance as Performance & {
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    };
    
    if (performance.memory) {
      const usagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      setData(prev => ({ ...prev, memoryUsage: usagePercent }));
    }

    // Observe Core Web Vitals
    if ("PerformanceObserver" in window) {
      // LCP
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            const value = lastEntry.startTime;
            setData(prev => ({
              ...prev,
              lcp: {
                name: "Largest Contentful Paint",
                value: Math.round(value),
                unit: "ms",
                rating: getRating(value, 2500, 4000),
                threshold: { good: 2500, needsImprovement: 4000 },
              },
            }));
          }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // LCP not supported
      }

      // CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as unknown as { hadRecentInput: boolean; value: number };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          setData(prev => ({
            ...prev,
            cls: {
              name: "Cumulative Layout Shift",
              value: Math.round(clsValue * 1000) / 1000,
              unit: "",
              rating: getRating(clsValue, 0.1, 0.25),
              threshold: { good: 0.1, needsImprovement: 0.25 },
            },
          }));
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });
      } catch {
        // CLS not supported
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0];
          if (firstInput) {
            const value = (firstInput as unknown as { processingStart: number }).processingStart - firstInput.startTime;
            setData(prev => ({
              ...prev,
              fid: {
                name: "First Input Delay",
                value: Math.round(value),
                unit: "ms",
                rating: getRating(value, 100, 300),
                threshold: { good: 100, needsImprovement: 300 },
              },
            }));
          }
        });
        fidObserver.observe({ type: "first-input", buffered: true });
      } catch {
        // FID not supported
      }
    }

    // TTFB from navigation timing
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      setData(prev => ({
        ...prev,
        ttfb: {
          name: "Time to First Byte",
          value: Math.round(ttfb),
          unit: "ms",
          rating: getRating(ttfb, 800, 1800),
          threshold: { good: 800, needsImprovement: 1800 },
        },
      }));
    }
  }, []);

  const metrics = [
    { ...data.lcp, icon: Gauge, abbrev: "LCP" },
    { ...data.fid, icon: Zap, abbrev: "FID" },
    { ...data.cls, icon: Layout, abbrev: "CLS" },
    { ...data.ttfb, icon: Clock, abbrev: "TTFB" },
  ].filter(m => m.name);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 bg-background border shadow-lg rounded-full p-3 hover:bg-muted transition-colors"
        aria-label="Show performance metrics"
      >
        <Gauge className="h-5 w-5 text-primary" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Collapse performance monitor"
          >
            ×
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Core Web Vitals */}
        {metrics.map((metric, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                {metric.icon && <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="font-medium">{metric.abbrev}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  {metric.value}{metric.unit}
                </span>
                {metric.rating && (
                  <Badge variant="secondary" className={cn("text-xs", ratingColors[metric.rating])}>
                    {ratingLabels[metric.rating]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* System Info */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
              Connection
            </span>
            <Badge variant="outline" className="text-xs">
              {data.connectionType.toUpperCase()}
            </Badge>
          </div>

          {data.memoryUsage !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                  Memory
                </span>
                <span className="font-mono text-xs">{Math.round(data.memoryUsage)}%</span>
              </div>
              <Progress 
                value={data.memoryUsage} 
                className="h-1"
                aria-label={`Memory usage: ${Math.round(data.memoryUsage)}%`}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMonitor;
