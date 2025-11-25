import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Zap, Clock, Gauge, Download, FileText, TrendingUp, Bell, Settings } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  score: number;
}

interface MetricThreshold {
  metric: "loadTime" | "memoryUsage" | "networkLatency" | "score";
  threshold: number;
  enabled: boolean;
  label: string;
  unit: string;
}

interface HistoricalMetric {
  timestamp: string;
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  score: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    score: 0
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalMetric[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState<MetricThreshold[]>([
    { metric: "loadTime", threshold: 3000, enabled: true, label: "Load Time", unit: "ms" },
    { metric: "memoryUsage", threshold: 80, enabled: true, label: "Memory Usage", unit: "%" },
    { metric: "networkLatency", threshold: 1000, enabled: true, label: "Network Latency", unit: "ms" },
    { metric: "score", threshold: 70, enabled: true, label: "Performance Score", unit: "" },
  ]);

  useEffect(() => {
    measurePerformance();
    loadHistoricalData();

    // Periodic measurements every 30 seconds
    const interval = setInterval(() => {
      measurePerformance();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const measurePerformance = useCallback(async () => {
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;
      const renderTime = navigation.loadEventEnd - navigation.domContentLoadedEventStart;
      const networkLatency = navigation.responseEnd - navigation.requestStart;
      const score = Math.max(0, Math.min(100, 100 - (loadTime / 50)));

      const newMetrics = {
        loadTime: Math.round(loadTime),
        memoryUsage: Math.round(memoryUsage),
        networkLatency: Math.round(networkLatency),
        renderTime: Math.round(renderTime),
        score: Math.round(score)
      };

      setMetrics(newMetrics);

      // Persist to database
      await persistMetrics(newMetrics);

      // Check thresholds and alert
      checkThresholds(newMetrics);
    } catch (error) {
      console.error("Error measuring performance:", error);
    }
  }, []);

  const persistMetrics = async (newMetrics: PerformanceMetrics) => {
    try {
      const { error } = await supabase
        .from("performance_metrics")
        .insert({
          load_time: newMetrics.loadTime,
          memory_usage: newMetrics.memoryUsage,
          network_latency: newMetrics.networkLatency,
          score: newMetrics.score,
          measured_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error persisting metrics:", error);
      }
    } catch (error) {
      console.error("Error in persistMetrics:", error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const { data, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        const formatted = data.reverse().map((d: any) => ({
          timestamp: new Date(d.measured_at).toLocaleTimeString(),
          loadTime: d.load_time,
          memoryUsage: d.memory_usage,
          networkLatency: d.network_latency,
          score: d.score
        }));
        setHistoricalData(formatted);
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
  };

  const checkThresholds = (newMetrics: PerformanceMetrics) => {
    thresholds.forEach(threshold => {
      if (!threshold.enabled) return;

      const value = newMetrics[threshold.metric];
      const exceeds = threshold.metric === "score" 
        ? value < threshold.threshold 
        : value > threshold.threshold;

      if (exceeds) {
        toast({
          title: `Performance Alert: ${threshold.label}`,
          description: `${threshold.label} is ${value}${threshold.unit}, exceeding threshold of ${threshold.threshold}${threshold.unit}`,
          variant: "destructive",
        });
      }
    });
  };

  const toggleThreshold = (metric: string) => {
    setThresholds(prev =>
      prev.map(t =>
        t.metric === metric ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  const exportToCSV = () => {
    if (historicalData.length === 0) {
      toast({
        title: "No data to export",
        description: "Historical data is not available yet",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Timestamp", "Load Time (ms)", "Memory Usage (%)", "Network Latency (ms)", "Score"];
    const rows = historicalData.map(d => [
      d.timestamp,
      d.loadTime,
      d.memoryUsage,
      d.networkLatency,
      d.score
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported",
      description: "Performance metrics have been downloaded",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Performance Monitoring Report", 14, 20);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

    // Current Metrics
    doc.setFontSize(14);
    doc.text("Current Performance Metrics", 14, 40);
    doc.setFontSize(10);
    doc.text(`Performance Score: ${metrics.score}`, 14, 48);
    doc.text(`Load Time: ${metrics.loadTime}ms`, 14, 54);
    doc.text(`Memory Usage: ${metrics.memoryUsage}%`, 14, 60);
    doc.text(`Network Latency: ${metrics.networkLatency}ms`, 14, 66);

    // Threshold Configuration
    doc.setFontSize(14);
    doc.text("Alert Thresholds", 14, 80);
    const thresholdData = thresholds.map(t => [
      t.label,
      `${t.threshold}${t.unit}`,
      t.enabled ? "Enabled" : "Disabled"
    ]);
    (doc as any).autoTable({
      startY: 85,
      head: [["Metric", "Threshold", "Status"]],
      body: thresholdData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Historical Data
    if (historicalData.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.text("Recent Historical Data", 14, finalY + 15);

      const histData = historicalData.slice(-10).map(d => [
        d.timestamp,
        `${d.loadTime}ms`,
        `${d.memoryUsage}%`,
        `${d.networkLatency}ms`,
        d.score.toString()
      ]);

      (doc as any).autoTable({
        startY: finalY + 20,
        head: [["Time", "Load Time", "Memory", "Latency", "Score"]],
        body: histData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    doc.save(`performance-report-${new Date().toISOString().split("T")[0]}.pdf`);

    toast({
      title: "PDF exported",
      description: "Performance report has been downloaded",
    });
  };

  const getChartData = () => {
    return {
      labels: historicalData.map(d => d.timestamp),
      datasets: [
        {
          label: "Load Time (ms)",
          data: historicalData.map(d => d.loadTime),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          yAxisID: "y",
        },
        {
          label: "Memory Usage (%)",
          data: historicalData.map(d => d.memoryUsage),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
          yAxisID: "y1",
        }
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, text: "Excelente" };
    if (score >= 70) return { variant: "secondary" as const, text: "Bom" };
    return { variant: "destructive" as const, text: "Precisa Melhorar" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Real-time application performance tracking with configurable alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Thresholds
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.score)}`}>
              {metrics.score}
            </div>
            <Badge variant={getScoreBadge(metrics.score).variant} className="mt-1">
              {getScoreBadge(metrics.score).text}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loadTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Initial page load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
            <p className="text-xs text-muted-foreground">
              JavaScript heap
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              Server response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Thresholds
            </CardTitle>
            <CardDescription>
              Configure performance thresholds for automatic alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thresholds.map((threshold) => (
                <div key={threshold.metric} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium">{threshold.label}</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when {threshold.metric === "score" ? "below" : "exceeds"} {threshold.threshold}{threshold.unit}
                    </p>
                  </div>
                  <Switch
                    checked={threshold.enabled}
                    onCheckedChange={() => toggleThreshold(threshold.metric)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Chart */}
      {historicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance History
            </CardTitle>
            <CardDescription>
              Last 20 measurements showing load time and memory usage trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Line
                data={getChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index" as const,
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: "top" as const,
                    },
                  },
                  scales: {
                    y: {
                      type: "linear" as const,
                      display: true,
                      position: "left" as const,
                      title: {
                        display: true,
                        text: "Load Time (ms)"
                      }
                    },
                    y1: {
                      type: "linear" as const,
                      display: true,
                      position: "right" as const,
                      title: {
                        display: true,
                        text: "Memory Usage (%)"
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};