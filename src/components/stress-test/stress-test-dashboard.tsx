/**
 * Stress Test Dashboard Component
 * PATCH 156.0 - Load Simulation Dashboard
 * 
 * Displays real-time and historical stress test results
 * Shows latency, failure rates, and resource consumption
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, TrendingUp, Zap, Database, Brain, LayoutDashboard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StressTestMetrics {
  name: string;
  icon: React.ElementType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  timestamp: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export function StressTestDashboard() {
  const [metrics, setMetrics] = useState<StressTestMetrics[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize with default metrics
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Try to load metrics from reports directory
      const response = await fetch('/reports/stress-test-summary.json');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      // Use default metrics if file doesn't exist
      setMetrics(getDefaultMetrics());
    }
  };

  const getDefaultMetrics = (): StressTestMetrics[] => [
    {
      name: 'Supabase Load Test',
      icon: Database,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      timestamp: new Date().toISOString(),
      status: 'idle',
    },
    {
      name: 'AI API Stress Test',
      icon: Brain,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      timestamp: new Date().toISOString(),
      status: 'idle',
    },
    {
      name: 'Dashboard Load Test',
      icon: LayoutDashboard,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      timestamp: new Date().toISOString(),
      status: 'idle',
    },
  ];

  const runStressTest = async (testName: string) => {
    setIsRunning(true);

    // Update status to running
    setMetrics(prev =>
      prev.map(m =>
        m.name === testName ? { ...m, status: 'running' as const } : m
      )
    );

    // Simulate test execution (in real scenario, this would call the actual test scripts)
    setTimeout(() => {
      // Update with simulated results
      setMetrics(prev =>
        prev.map(m =>
          m.name === testName
            ? {
                ...m,
                totalRequests: Math.floor(Math.random() * 500) + 100,
                successfulRequests: Math.floor(Math.random() * 450) + 50,
                failedRequests: Math.floor(Math.random() * 50),
                avgLatency: Math.floor(Math.random() * 1000) + 200,
                p95Latency: Math.floor(Math.random() * 2000) + 500,
                p99Latency: Math.floor(Math.random() * 3000) + 1000,
                timestamp: new Date().toISOString(),
                status: 'completed' as const,
              }
            : m
        )
      );
      setIsRunning(false);
    }, 5000);
  };

  const getStatusBadge = (status: StressTestMetrics['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const getSuccessRate = (metric: StressTestMetrics) => {
    if (metric.totalRequests === 0) return "0";
    return ((metric.successfulRequests / metric.totalRequests) * 100).toFixed(2);
  };

  const latencyChartData = metrics.map(m => ({
    name: m.name.split(' ')[0],
    'Avg Latency': m.avgLatency,
    'P95 Latency': m.p95Latency,
    'P99 Latency': m.p99Latency,
  }));

  const requestsChartData = metrics.map(m => ({
    name: m.name.split(' ')[0],
    Successful: m.successfulRequests,
    Failed: m.failedRequests,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Stress Test Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor system performance under load - PATCH 156.0
          </p>
        </div>
        <Button
          onClick={() => metrics.forEach(m => runStressTest(m.name))}
          disabled={isRunning}
        >
          <Zap className="mr-2 h-4 w-4" />
          Run All Tests
        </Button>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const successRate = parseFloat(getSuccessRate(metric));

          return (
            <Card key={metric.name} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {getStatusBadge(metric.status)}
                </div>
                <CardTitle className="mt-2">{metric.name}</CardTitle>
                <CardDescription>
                  {new Date(metric.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success Rate */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>

                {/* Request Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{metric.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">
                      {metric.failedRequests}
                    </p>
                  </div>
                </div>

                {/* Latency Stats */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Latency</span>
                    <span className="font-medium">{metric.avgLatency}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">P95 Latency</span>
                    <span className="font-medium">{metric.p95Latency}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">P99 Latency</span>
                    <span className="font-medium">{metric.p99Latency}ms</span>
                  </div>
                </div>

                <Button
                  onClick={() => runStressTest(metric.name)}
                  disabled={isRunning}
                  className="w-full"
                  variant="outline"
                >
                  {metric.status === 'running' ? 'Running...' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Latency Comparison</CardTitle>
            <CardDescription>Response times across test suites</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={latencyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Latency" fill="#3b82f6" />
                <Bar dataKey="P95 Latency" fill="#8b5cf6" />
                <Bar dataKey="P99 Latency" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Distribution</CardTitle>
            <CardDescription>Success vs failure rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Successful" fill="#10b981" stackId="a" />
                <Bar dataKey="Failed" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Thresholds
          </CardTitle>
          <CardDescription>Target metrics for system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P95 Latency</span>
                  <span className="font-medium">{'< 2000ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failure Rate</span>
                  <span className="font-medium">{'< 10%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Throughput</span>
                  <span className="font-medium">{"> 50 req/s"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI API
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Latency</span>
                  <span className="font-medium">{'< 3000ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P95 Latency</span>
                  <span className="font-medium">{'< 5000ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failure Rate</span>
                  <span className="font-medium">{'< 5%'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboards
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page Load</span>
                  <span className="font-medium">{'< 3000ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FCP</span>
                  <span className="font-medium">{'< 1500ms'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memory</span>
                  <span className="font-medium">{'< 100MB'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Info */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Stress Testing Best Practices
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Run stress tests during off-peak hours. Ensure proper API keys are configured.
                Monitor resource consumption and set up alerts for threshold breaches.
                Gradually increase load to identify bottlenecks before reaching system limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
