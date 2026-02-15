/**
 * Performance Metrics Dashboard
 * Real-time Web Vitals monitoring for Lighthouse 100
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Zap, Clock, LayoutDashboard, ArrowDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface WebVital {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  target: number;
  unit: string;
  icon: React.ReactNode;
}

export const PerformanceMetrics: React.FC = () => {
  const [vitals, setVitals] = useState<WebVital[]>([]);
  const [score, setScore] = useState(0);

  const measureVitals = useCallback(() => {
    const measured: WebVital[] = [];

    // FCP
    const paintEntries = performance.getEntriesByType("paint");
    const fcp = paintEntries.find(e => e.name === "first-contentful-paint");
    if (fcp) {
      const val = Math.round(fcp.startTime);
      measured.push({
        name: "FCP",
        value: val,
        rating: val < 1800 ? "good" : val < 3000 ? "needs-improvement" : "poor",
        target: 1500,
        unit: "ms",
        icon: <Clock className="h-4 w-4" />,
      });
    }

    // DOM Content Loaded
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (nav) {
      const dcl = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      measured.push({
        name: "DCL",
        value: dcl,
        rating: dcl < 2000 ? "good" : dcl < 4000 ? "needs-improvement" : "poor",
        target: 2000,
        unit: "ms",
        icon: <LayoutDashboard className="h-4 w-4" />,
      });

      const ttfb = Math.round(nav.responseStart - nav.requestStart);
      measured.push({
        name: "TTFB",
        value: ttfb,
        rating: ttfb < 200 ? "good" : ttfb < 500 ? "needs-improvement" : "poor",
        target: 200,
        unit: "ms",
        icon: <Zap className="h-4 w-4" />,
      });

      const transferSize = Math.round((nav.transferSize || 0) / 1024);
      measured.push({
        name: "Transfer",
        value: transferSize,
        rating: transferSize < 500 ? "good" : transferSize < 1000 ? "needs-improvement" : "poor",
        target: 500,
        unit: "KB",
        icon: <ArrowDown className="h-4 w-4" />,
      });
    }

    // DOM Size
    const domSize = document.querySelectorAll("*").length;
    measured.push({
      name: "DOM Nodes",
      value: domSize,
      rating: domSize < 1500 ? "good" : domSize < 3000 ? "needs-improvement" : "poor",
      target: 1500,
      unit: "",
      icon: <LayoutDashboard className="h-4 w-4" />,
    });

    setVitals(measured);

    // Calculate score
    const goodCount = measured.filter(v => v.rating === "good").length;
    setScore(Math.round((goodCount / Math.max(measured.length, 1)) * 100));
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureVitals, 2000);
    return () => clearTimeout(timer);
  }, [measureVitals]);

  const ratingColor = (r: WebVital["rating"]) => {
    switch (r) {
      case "good": return "text-green-500";
      case "needs-improvement": return "text-yellow-500";
      case "poor": return "text-red-500";
    }
  };

  const ratingBg = (r: WebVital["rating"]) => {
    switch (r) {
      case "good": return "bg-green-500/10 border-green-500/20";
      case "needs-improvement": return "bg-yellow-500/10 border-yellow-500/20";
      case "poor": return "bg-red-500/10 border-red-500/20";
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Web Vitals Monitor</CardTitle>
          </div>
          <Badge variant={score >= 90 ? "secondary" : score >= 70 ? "outline" : "destructive"}>
            Score: {score}/100
          </Badge>
        </div>
        <Progress value={score} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {vitals.map((vital, i) => (
            <motion.div
              key={vital.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-lg border ${ratingBg(vital.rating)} text-center`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {vital.icon}
                <span className="text-xs font-medium text-muted-foreground">{vital.name}</span>
              </div>
              <p className={`text-lg font-bold ${ratingColor(vital.rating)}`}>
                {vital.value}
                <span className="text-xs font-normal ml-0.5">{vital.unit}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Target: {vital.target}{vital.unit}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
