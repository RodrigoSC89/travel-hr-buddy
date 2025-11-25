/**
 * PATCH 568 - AI Evolution Dashboard Component
 * Visualizes AI learning progress and performance metrics
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { autoTuningEngine, ModelSnapshot } from "@/ai/auto-tuning-engine";
import { logger } from "@/lib/logger";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AIEvolutionDashboard: React.FC = () => {
  const [snapshots, setSnapshots] = useState<ModelSnapshot[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const snaps = autoTuningEngine.getSnapshots();
      const metrics = await autoTuningEngine.getCurrentMetrics();
      
      setSnapshots(snaps);
      setCurrentMetrics(metrics);
      setLoading(false);
    } catch (error) {
      logger.error("[AIEvolution] Error loading data:", error);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "Accuracy", "Confidence", "Response Time", "Performance Score"];
    const rows = snapshots.map(snap => [
      snap.timestamp.toISOString(),
      snap.metrics.accuracy_rate.toFixed(3),
      snap.metrics.avg_confidence.toFixed(3),
      snap.metrics.avg_response_time.toFixed(0),
      snap.performance_score.toFixed(3),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-evolution-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info("[AIEvolution] Exported", snapshots.length, "snapshots to CSV");
  };

  // Prepare chart data
  const confidenceData = {
    labels: snapshots.slice(-10).map(s => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Confidence Score",
        data: snapshots.slice(-10).map(s => s.metrics.avg_confidence),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const accuracyData = {
    labels: snapshots.slice(-10).map(s => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Accuracy Rate",
        data: snapshots.slice(-10).map(s => s.metrics.accuracy_rate),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const responseTimeData = {
    labels: snapshots.slice(-10).map(s => new Date(s.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Response Time (ms)",
        data: snapshots.slice(-10).map(s => s.metrics.avg_response_time),
        backgroundColor: "rgba(234, 179, 8, 0.6)",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const latestSnapshot = snapshots[snapshots.length - 1];
  const previousSnapshot = snapshots[snapshots.length - 2];

  const confidenceTrend = latestSnapshot && previousSnapshot
    ? latestSnapshot.metrics.avg_confidence - previousSnapshot.metrics.avg_confidence
    : 0;

  const accuracyTrend = latestSnapshot && previousSnapshot
    ? latestSnapshot.metrics.accuracy_rate - previousSnapshot.metrics.accuracy_rate
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Evolution Dashboard</h1>
          <p className="text-muted-foreground">Real-time AI learning and performance metrics</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            {confidenceTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot ? (latestSnapshot.metrics.avg_confidence * 100).toFixed(1) : "N/A"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {confidenceTrend > 0 ? "+" : ""}
              {(confidenceTrend * 100).toFixed(2)}% from last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            {accuracyTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot ? (latestSnapshot.metrics.accuracy_rate * 100).toFixed(1) : "N/A"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {accuracyTrend > 0 ? "+" : ""}
              {(accuracyTrend * 100).toFixed(2)}% from last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot ? latestSnapshot.metrics.avg_response_time.toFixed(0) : "N/A"}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics ? currentMetrics.total_decisions : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 6 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="confidence" className="space-y-4">
        <TabsList>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="response">Response Time</TabsTrigger>
          <TabsTrigger value="logs">Tuning Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Score Evolution</CardTitle>
              <CardDescription>How confident the AI is in its decisions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                {snapshots.length > 0 ? (
                  <Line data={confidenceData} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted-foreground py-20">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Rate Trend</CardTitle>
              <CardDescription>Percentage of correct AI decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                {snapshots.length > 0 ? (
                  <Line data={accuracyData} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted-foreground py-20">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>AI processing time in milliseconds</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: "300px" }}>
                {snapshots.length > 0 ? (
                  <Bar data={responseTimeData} options={barChartOptions} />
                ) : (
                  <p className="text-center text-muted-foreground py-20">No data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Tuning Logs</CardTitle>
              <CardDescription>Recent parameter adjustments and snapshots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {snapshots.slice(-10).reverse().map((snap, idx) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{snap.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(snap.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Score: {snap.performance_score.toFixed(3)}
                      </Badge>
                      <Badge variant="outline">
                        Accuracy: {(snap.metrics.accuracy_rate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
                {snapshots.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No tuning logs available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
