// @ts-nocheck
/**
 * PATCH 617 - Live Performance Profiler
 * Real-time monitoring of CPU, Memory, FPS and component performance
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Cpu, MemoryStick, Gauge, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface PerformanceMetric {
  timestamp: number;
  cpu: number;
  memory: number;
  fps: number;
}

interface PerformanceSnapshot {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  fps: number;
  slow_components: SlowComponent[];
  page_load_time?: number;
  network_latency?: number;
}

const TOAST_THROTTLE_INTERVAL = 10000; // Show toast max once per 10 seconds
const TOAST_THROTTLE_WINDOW = 3000; // Within a 3 second window

interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export default function PerformanceProfiler() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState({
    cpu: 0,
    memory: 0,
    fps: 0,
    heapSize: 0,
    heapLimit: 0,
  });
  const [slowComponents, setSlowComponents] = useState<SlowComponent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // FPS monitoring
    const measureFPS = () => {
      frameCountRef.current++;
      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };
    measureFPS();

    // Collect metrics every 3 seconds
    intervalRef.current = setInterval(() => {
      collectMetrics();
    }, 3000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const collectMetrics = async () => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    const fps = Math.round((frameCountRef.current / deltaTime) * 1000);
    
    // Reset frame counter
    frameCountRef.current = 0;
    lastTimeRef.current = now;

    // Collect memory info (if available)
    let memoryUsage = 0;
    let heapSize = 0;
    let heapLimit = 0;
    
    const perfWithMemory = performance as PerformanceWithMemory;
    if (perfWithMemory.memory) {
      const memory = perfWithMemory.memory;
      heapSize = Math.round(memory.usedJSHeapSize / 1048576); // MB
      heapLimit = Math.round(memory.jsHeapSizeLimit / 1048576); // MB
      memoryUsage = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    }

    // Estimate CPU usage (simplified - based on FPS and long tasks)
    const cpuUsage = fps < 30 ? 80 : fps < 45 ? 60 : fps < 55 ? 40 : 20;

    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      cpu: cpuUsage,
      memory: memoryUsage,
      fps: Math.min(fps, 60), // Cap at 60 FPS
    };

    // Update metrics array (keep last 20 points)
    metricsRef.current = [...metricsRef.current.slice(-19), metric];
    setMetrics(metricsRef.current);

    // Update current metrics
    setCurrentMetrics({
      cpu: cpuUsage,
      memory: memoryUsage,
      fps: Math.min(fps, 60),
      heapSize,
      heapLimit,
    });

    // Detect slow components using PerformanceObserver
    detectSlowComponents();

    // Identify bottlenecks
    identifyBottlenecks(metric);

    // Store to Supabase
    await storeMetrics(metric);
  };

  const detectSlowComponents = () => {
    try {
      const entries = performance.getEntriesByType("measure");
      const slowOnes: SlowComponent[] = [];

      entries.forEach((entry) => {
        if (entry.duration > 16) { // Slower than 60fps threshold
          slowOnes.push({
            name: entry.name,
            renderTime: Math.round(entry.duration),
            count: 1,
            lastSeen: Date.now(),
          });
        }
      });

      if (slowOnes.length > 0) {
        setSlowComponents((prev) => {
          const combined = [...prev, ...slowOnes];
          // Merge duplicates
          const merged = combined.reduce((acc, item) => {
            const existing = acc.find((x) => x.name === item.name);
            if (existing) {
              existing.count++;
              existing.renderTime = Math.max(existing.renderTime, item.renderTime);
              existing.lastSeen = item.lastSeen;
            } else {
              acc.push(item);
            }
          return acc;
        }, [] as SlowComponent[]);
        
        // Keep only recent ones (last 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return merged.filter((x) => x.lastSeen > fiveMinutesAgo);
      });
    }
  } catch (error) {
    logger.error("Error detecting slow components in performance profiler", { error });
  }
};

  const identifyBottlenecks = (metric: PerformanceMetric) => {
    const issues: string[] = [];

    if (metric.cpu > 70) {
      issues.push("High CPU usage detected");
    }
    if (metric.memory > 80) {
      issues.push("High memory usage detected");
    }
    if (metric.fps < 30) {
      issues.push("Low FPS - performance degradation");
    }
    if (currentMetrics.heapSize > currentMetrics.heapLimit * 0.9) {
      issues.push("Memory limit approaching");
    }

    setBottlenecks(issues);

    // Show toast for critical issues (throttled to avoid spam)
    if (issues.length > 0 && metric.timestamp % TOAST_THROTTLE_INTERVAL < TOAST_THROTTLE_WINDOW) {
      toast.warning(`Performance issues: ${issues.length} detected`);
    }
  };

  const storeMetrics = async (metric: PerformanceMetric) => {
    try {
      const snapshot: Omit<PerformanceSnapshot, "id"> = {
        timestamp: new Date(metric.timestamp).toISOString(),
        cpu_usage: metric.cpu,
        memory_usage: metric.memory,
        fps: metric.fps,
        slow_components: slowComponents,
      };

      await supabase.from("performance_metrics").insert(snapshot);
    } catch (error) {
      logger.error("Error storing performance metrics", { error, cpuUsage: metric.cpu, memoryUsage: metric.memory });
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "text-red-500";
    if (value >= thresholds.warning) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Performance Profiler</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system resources and component performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => (isMonitoring ? stopMonitoring() : startMonitoring())}
          >
            {isMonitoring ? "Stop" : "Start"} Monitoring
          </Button>
          <Button variant="outline" onClick={collectMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.cpu, { warning: 60, critical: 80 })}`}>
              {currentMetrics.cpu}%
            </div>
            <Progress value={currentMetrics.cpu} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.memory, { warning: 70, critical: 85 })}`}>
              {currentMetrics.memory}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMetrics.heapSize}MB / {currentMetrics.heapLimit}MB
            </p>
            <Progress value={currentMetrics.memory} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FPS</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(60 - currentMetrics.fps, { warning: 15, critical: 30 })}`}>
              {currentMetrics.fps}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Target: 60 FPS</p>
            <Progress value={(currentMetrics.fps / 60) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bottlenecks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {bottlenecks.length === 0 ? "None detected" : "Issues found"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Live Charts</TabsTrigger>
          <TabsTrigger value="components">Slow Components</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Over Time</CardTitle>
              <CardDescription>Live monitoring of CPU, Memory, and FPS</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(ts) => new Date(ts as number).toLocaleTimeString()}
                  />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="fps" stroke="#ffc658" name="FPS" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow Components</CardTitle>
              <CardDescription>
                Components taking longer than 16ms to render (60 FPS threshold)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slowComponents.length === 0 ? (
                <p className="text-muted-foreground">No slow components detected</p>
              ) : (
                <div className="space-y-2">
                  {slowComponents.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Seen {component.count} times
                        </p>
                      </div>
                      <Badge variant="destructive">{component.renderTime}ms</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Bottlenecks</CardTitle>
              <CardDescription>Performance issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {bottlenecks.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">No performance issues detected</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bottlenecks.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded bg-yellow-50 dark:bg-yellow-950">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <p className="font-medium">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
