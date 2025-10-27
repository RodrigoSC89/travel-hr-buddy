// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Clock, Gauge, Download, Settings, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceMetrics {
  id?: string;
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  renderTime: number;
  score: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

interface AlertThreshold {
  metric: string;
  threshold: number;
  enabled: boolean;
}

export const PerformanceMonitor: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    renderTime: 0,
    score: 0,
    timestamp: new Date().toISOString(),
    status: 'normal'
  });
  const [historicalMetrics, setHistoricalMetrics] = useState<PerformanceMetrics[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    { metric: 'loadTime', threshold: 3000, enabled: true },
    { metric: 'memoryUsage', threshold: 80, enabled: true },
    { metric: 'networkLatency', threshold: 1000, enabled: true },
    { metric: 'score', threshold: 70, enabled: true }
  ]);
  const [alerts, setAlerts] = useState<string[]>([]);

  // Measure browser performance
  const measurePerformance = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const memory = (performance as any).memory;
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;
      const renderTime = navigation.loadEventEnd - navigation.domContentLoadedEventStart;
      const networkLatency = navigation.responseEnd - navigation.requestStart;
      const score = Math.max(0, Math.min(100, 100 - (loadTime / 50)));

      // Determine status based on thresholds
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      const newAlerts: string[] = [];

      if (loadTime > thresholds[0].threshold && thresholds[0].enabled) {
        status = 'warning';
        newAlerts.push(`Load time (${Math.round(loadTime)}ms) exceeds threshold`);
      }
      if (memoryUsage > thresholds[1].threshold && thresholds[1].enabled) {
        status = memoryUsage > 90 ? 'critical' : 'warning';
        newAlerts.push(`Memory usage (${Math.round(memoryUsage)}%) exceeds threshold`);
      }
      if (networkLatency > thresholds[2].threshold && thresholds[2].enabled) {
        status = 'warning';
        newAlerts.push(`Network latency (${Math.round(networkLatency)}ms) exceeds threshold`);
      }
      if (score < thresholds[3].threshold && thresholds[3].enabled) {
        status = score < 50 ? 'critical' : 'warning';
        newAlerts.push(`Performance score (${Math.round(score)}) below threshold`);
      }

      const metrics: PerformanceMetrics = {
        loadTime: Math.round(loadTime),
        memoryUsage: Math.round(memoryUsage),
        networkLatency: Math.round(networkLatency),
        renderTime: Math.round(renderTime),
        score: Math.round(score),
        timestamp: new Date().toISOString(),
        status
      };

      setCurrentMetrics(metrics);
      setAlerts(newAlerts);

      // Save to database
      saveMetricsToDatabase(metrics);
    } catch (error) {
      console.error('Error measuring performance:', error);
    }
  }, [thresholds]);

  // Save metrics to Supabase
  const saveMetricsToDatabase = async (metrics: PerformanceMetrics) => {
    try {
      const metricsToSave = [
        {
          category: 'performance',
          metric_name: 'load_time',
          metric_value: metrics.loadTime,
          metric_unit: 'ms',
          status: metrics.status,
          target_value: thresholds[0].threshold,
          recorded_at: metrics.timestamp
        },
        {
          category: 'performance',
          metric_name: 'memory_usage',
          metric_value: metrics.memoryUsage,
          metric_unit: '%',
          status: metrics.status,
          target_value: thresholds[1].threshold,
          recorded_at: metrics.timestamp
        },
        {
          category: 'performance',
          metric_name: 'network_latency',
          metric_value: metrics.networkLatency,
          metric_unit: 'ms',
          status: metrics.status,
          target_value: thresholds[2].threshold,
          recorded_at: metrics.timestamp
        },
        {
          category: 'performance',
          metric_name: 'performance_score',
          metric_value: metrics.score,
          metric_unit: 'score',
          status: metrics.status,
          target_value: thresholds[3].threshold,
          recorded_at: metrics.timestamp
        }
      ];

      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToSave);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving performance metrics:', error);
    }
  };

  // Load historical metrics from database
  const loadHistoricalMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('category', 'performance')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Group metrics by timestamp
      const groupedMetrics: { [key: string]: Partial<PerformanceMetrics> } = {};
      
      (data || []).forEach((metric: any) => {
        const timestamp = metric.recorded_at;
        if (!groupedMetrics[timestamp]) {
          groupedMetrics[timestamp] = { timestamp, status: metric.status };
        }

        switch (metric.metric_name) {
          case 'load_time':
            groupedMetrics[timestamp].loadTime = metric.metric_value;
            break;
          case 'memory_usage':
            groupedMetrics[timestamp].memoryUsage = metric.metric_value;
            break;
          case 'network_latency':
            groupedMetrics[timestamp].networkLatency = metric.metric_value;
            break;
          case 'performance_score':
            groupedMetrics[timestamp].score = metric.metric_value;
            break;
        }
      });

      const metrics = Object.values(groupedMetrics)
        .filter(m => m.loadTime !== undefined)
        .reverse() as PerformanceMetrics[];

      setHistoricalMetrics(metrics);
    } catch (error) {
      console.error('Error loading historical metrics:', error);
    }
  }, []);

  useEffect(() => {
    // Initial measurement
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
    }

    // Load historical data
    loadHistoricalMetrics();

    // Periodic measurements
    const interval = setInterval(measurePerformance, 30000); // Every 30 seconds

    // Setup realtime subscription
    const channel = supabase
      .channel('performance_metrics_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'performance_metrics' },
        () => {
          loadHistoricalMetrics();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("load", measurePerformance);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [measurePerformance, loadHistoricalMetrics]);

  // Export to CSV
  const exportToCSV = () => {
    try {
      const csvData = [
        ['Timestamp', 'Load Time (ms)', 'Memory Usage (%)', 'Network Latency (ms)', 'Score', 'Status'],
        ...historicalMetrics.map(m => [
          new Date(m.timestamp).toLocaleString(),
          m.loadTime,
          m.memoryUsage,
          m.networkLatency,
          m.score,
          m.status
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Performance Metrics Report', 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.setFontSize(10);
      let yPos = 45;
      
      doc.text(`Current Performance Score: ${currentMetrics.score}`, 14, yPos);
      yPos += 7;
      doc.text(`Load Time: ${currentMetrics.loadTime}ms`, 14, yPos);
      yPos += 7;
      doc.text(`Memory Usage: ${currentMetrics.memoryUsage}%`, 14, yPos);
      yPos += 7;
      doc.text(`Network Latency: ${currentMetrics.networkLatency}ms`, 14, yPos);
      yPos += 7;
      doc.text(`Status: ${currentMetrics.status}`, 14, yPos);
      
      yPos += 15;
      doc.setFontSize(14);
      doc.text('Historical Data', 14, yPos);
      
      yPos += 10;
      doc.setFontSize(8);
      historicalMetrics.slice(0, 20).forEach(m => {
        doc.text(
          `${new Date(m.timestamp).toLocaleTimeString()} | Score: ${m.score} | Load: ${m.loadTime}ms | Mem: ${m.memoryUsage}%`,
          14,
          yPos
        );
        yPos += 5;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      doc.save(`performance-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Prepare chart data
  const chartData = {
    labels: historicalMetrics.slice(-20).map(m => 
      new Date(m.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: 'Performance Score',
        data: historicalMetrics.slice(-20).map(m => m.score),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Memory Usage %',
        data: historicalMetrics.slice(-20).map(m => m.memoryUsage),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Performance Monitoring</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Real-time performance metrics with historical trends
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportToCSV} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={exportToPDF} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Thresholds
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Performance Alerts</p>
                <ul className="text-xs mt-1 space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx}>• {alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Score de Performance</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${getScoreColor(currentMetrics.score)}`}>
              {currentMetrics.score}
            </div>
            <Badge variant={getScoreBadge(currentMetrics.score).variant} className="mt-1 text-xs">
              {getScoreBadge(currentMetrics.score).text}
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tempo de Carregamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{currentMetrics.loadTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Inicial da página
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Uso de Memória</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{currentMetrics.memoryUsage}%</div>
            <p className="text-xs text-muted-foreground">
              Heap JavaScript
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Latência de Rede</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{currentMetrics.networkLatency}ms</div>
            <p className="text-xs text-muted-foreground">
              Resposta do servidor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Chart */}
      {historicalMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Histórico de Performance</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Tendências dos últimos 20 registros
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {historicalMetrics.length > 5 && historicalMetrics[0].score > historicalMetrics[historicalMetrics.length - 1].score ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
              <div>
                <p className="text-muted-foreground">Avg Score</p>
                <p className="font-bold">
                  {Math.round(historicalMetrics.reduce((sum, m) => sum + m.score, 0) / historicalMetrics.length)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Load Time</p>
                <p className="font-bold">
                  {Math.round(historicalMetrics.reduce((sum, m) => sum + m.loadTime, 0) / historicalMetrics.length)}ms
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Memory</p>
                <p className="font-bold">
                  {Math.round(historicalMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / historicalMetrics.length)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={`font-bold ${getStatusColor(currentMetrics.status)}`}>
                  {currentMetrics.status.toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">System Status</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Current performance thresholds and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {thresholds.map((threshold, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {threshold.metric.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Threshold: {threshold.threshold}{threshold.metric === 'memoryUsage' || threshold.metric === 'score' ? '%' : 'ms'}
                  </p>
                </div>
                <Badge variant={threshold.enabled ? 'default' : 'outline'}>
                  {threshold.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};