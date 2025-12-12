/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Performance Monitor Component
 * PATCH 833: Real-time performance metrics display
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Gauge, 
  Timer, 
  Zap, 
  TrendingUp,
  RefreshCw,
  X
} from "lucide-react";
import { useWebVitals } from "@/lib/performance/web-vitals-monitor";
import { motion, AnimatePresence } from "framer-motion";

interface PerformanceMonitorProps {
  visible?: boolean;
  onClose?: () => void;
  position?: "top-right" | "bottom-right" | "bottom-left";
}

export const PerformanceMonitor = memo(function({ 
  visible = true, 
  onClose,
  position = "bottom-right" 
}: PerformanceMonitorProps) {
  const { metrics, score } = useWebVitals();
  const [expanded, setExpanded] = useState(false);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  });

  const getRatingBadge = (rating: string) => {
    const variants = {
      good: "bg-green-500/10 text-green-500 border-green-500/20",
      "needs-improvement": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      poor: "bg-red-500/10 text-red-500 border-red-500/20",
    });
    return variants[rating as keyof typeof variants] || variants.poor;
  };

  const formatValue = (name: string, value: number) => {
    if (name === "CLS") return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const metricIcons: Record<string, React.ReactNode> = {
    LCP: <Timer className="h-4 w-4" />,
    CLS: <Activity className="h-4 w-4" />,
    INP: <Zap className="h-4 w-4" />,
    FCP: <TrendingUp className="h-4 w-4" />,
    TTFB: <Gauge className="h-4 w-4" />,
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed ${positionClasses[position]} z-50`}
      >
        <Card className="w-72 shadow-lg border-border/50 bg-background/95 backdrop-blur">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Performance
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleSetExpanded}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Score Geral</span>
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
            <Progress value={score} className="h-2" />

            {/* Individual Metrics */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 pt-2 border-t"
                >
                  {metrics.map((metric) => (
                    <div
                      key={metric.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {metricIcons[metric.name]}
                        <span>{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {formatValue(metric.name, metric.value)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0 ${getRatingBadge(metric.rating)}`}
                        >
                          {metric.rating === "good" ? "✓" : metric.rating === "needs-improvement" ? "!" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={handleSetExpanded}
            >
              {expanded ? "Mostrar menos" : "Ver métricas detalhadas"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
});
// Dev-only performance overlayy
export const DevPerformanceOverlay = memo(function() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setShow(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  if (!import.meta.env.DEV) return null;

  return <PerformanceMonitor visible={show} onClose={() => setShow(false)} />;
});
