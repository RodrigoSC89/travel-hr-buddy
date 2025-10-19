import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { VesselPerformanceMetrics } from "@/types/external-audit";

export function PerformanceDashboard() {
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [vessels, setVessels] = useState<Array<{ id: string; name: string }>>([]);
  const [metrics, setMetrics] = useState<VesselPerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVessels = async () => {
      const { data, error } = await supabase.from("vessels").select("id, name").order("name");
      if (!error && data) {
        setVessels(data);
      }
    };
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      fetchMetrics();
    }
  }, [selectedVessel]);

  const fetchMetrics = async () => {
    if (!selectedVessel) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vessel_performance_metrics")
        .select("*")
        .eq("vessel_id", selectedVessel)
        .order("metric_date", { ascending: false })
        .limit(30);

      if (!error && data) {
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (metrics.length === 0) return;

    const headers = [
      "Date",
      "Compliance %",
      "Failures",
      "MTTR (hours)",
      "AI Actions",
      "Human Actions",
      "Training Completions",
    ];

    const rows = metrics.map((m) => [
      m.metric_date,
      m.compliance_percentage,
      m.failure_count,
      m.mttr_hours || "N/A",
      m.ai_actions_count,
      m.human_actions_count,
      m.training_completions,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vessel-performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate overall metrics
  const latestMetric = metrics[0];
  const avgCompliance =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.compliance_percentage, 0) / metrics.length
      : 0;
  const totalFailures = metrics.reduce((sum, m) => sum + m.failure_count, 0);
  const avgMTTR =
    metrics.filter((m) => m.mttr_hours).length > 0
      ? metrics
        .filter((m) => m.mttr_hours)
        .reduce((sum, m) => sum + (m.mttr_hours || 0), 0) /
        metrics.filter((m) => m.mttr_hours).length
      : 0;

  // Prepare radar chart data
  const radarData = latestMetric
    ? [
      {
        metric: "Compliance",
        value: latestMetric.compliance_percentage,
        fullMark: 100,
      },
      {
        metric: "Reliability",
        value: Math.max(0, 100 - latestMetric.failure_count * 10),
        fullMark: 100,
      },
      {
        metric: "Training",
        value: Math.min(100, latestMetric.training_completions * 10),
        fullMark: 100,
      },
      {
        metric: "AI Automation",
        value: Math.min(
          100,
          (latestMetric.ai_actions_count /
              (latestMetric.ai_actions_count + latestMetric.human_actions_count || 1)) *
              100
        ),
        fullMark: 100,
      },
    ]
    : [];

  // Prepare bar chart data for failures by system
  const failuresBySystem = latestMetric
    ? Object.entries(latestMetric.failures_by_system || {}).map(([system, count]) => ({
      system: system.charAt(0).toUpperCase() + system.slice(1),
      failures: count,
    }))
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Dashboard</CardTitle>
          <CardDescription>Real-time vessel performance metrics and analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Vessel</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose vessel..." />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportToCSV} disabled={metrics.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedVessel && !isLoading && metrics.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{avgCompliance.toFixed(1)}%</div>
                  {avgCompliance >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Failures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{totalFailures}</div>
                  <Activity className="h-4 w-4 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg MTTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {avgMTTR > 0 ? `${avgMTTR.toFixed(1)}h` : "N/A"}
                  </div>
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Training Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {latestMetric?.training_completions || 0}
                  </div>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
              <CardDescription>Multi-dimensional performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Failures by System */}
          {failuresBySystem.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Failures by System</CardTitle>
                <CardDescription>System-level failure analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failuresBySystem}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="system" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="failures" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedVessel && !isLoading && metrics.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No performance data available for this vessel</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
