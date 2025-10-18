// ETAPA 32.2: Technical Performance Dashboard Component
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { VesselPerformanceMetrics, PerformanceCalculation } from "@/types/external-audit";

interface PerformanceDashboardProps {
  vesselId: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ vesselId }) => {
  const [metrics, setMetrics] = useState<VesselPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [vesselId]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vessel_performance_metrics")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("calculation_date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setMetrics(data);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = async () => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.rpc("calculate_vessel_performance_metrics", {
        p_vessel_id: vesselId,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const calculatedData = data[0] as PerformanceCalculation;

        // Save calculated metrics
        const { error: insertError } = await supabase.from("vessel_performance_metrics").insert({
          vessel_id: vesselId,
          compliance_percentage: calculatedData.compliance_percentage,
          failure_frequency: calculatedData.failure_frequency,
          mttr_hours: calculatedData.mttr_hours,
          ai_vs_human_actions: calculatedData.ai_vs_human_actions,
          training_completion_rate: calculatedData.training_completion_rate,
          recent_audits_count: calculatedData.recent_audits_count,
          recent_incidents_count: calculatedData.recent_incidents_count,
        });

        if (insertError) throw insertError;

        toast.success("Performance metrics calculated successfully");
        loadMetrics();
      }
    } catch (error) {
      console.error("Error calculating metrics:", error);
      toast.error("Failed to calculate metrics");
    } finally {
      setIsCalculating(false);
    }
  };

  const exportToCSV = () => {
    if (!metrics) return;

    const csvData = [
      ["Metric", "Value"],
      ["Compliance Percentage", `${metrics.compliance_percentage}%`],
      ["MTTR (hours)", metrics.mttr_hours],
      ["Training Completion Rate", `${metrics.training_completion_rate}%`],
      ["Recent Audits Count", metrics.recent_audits_count],
      ["Recent Incidents Count", metrics.recent_incidents_count],
      ["AI Actions", metrics.ai_vs_human_actions.ai],
      ["Human Actions", metrics.ai_vs_human_actions.human],
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-metrics-${vesselId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const getRadarData = () => {
    if (!metrics) return [];
    return [
      { subject: "Compliance", score: metrics.compliance_percentage, fullMark: 100 },
      { subject: "Training", score: metrics.training_completion_rate, fullMark: 100 },
      { subject: "Reliability", score: Math.max(0, 100 - metrics.mttr_hours), fullMark: 100 },
      { subject: "Safety", score: Math.max(0, 100 - metrics.recent_incidents_count * 5), fullMark: 100 },
      { subject: "Audit Score", score: metrics.compliance_percentage, fullMark: 100 },
    ];
  };

  const getFailureData = () => {
    if (!metrics || !metrics.failure_frequency) return [];
    return Object.entries(metrics.failure_frequency).map(([system, failures]) => ({
      system,
      failures: failures as number,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vessel Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time performance metrics and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={calculateMetrics} disabled={isCalculating}>
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate Metrics"
            )}
          </Button>
          {metrics && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {!metrics ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No performance metrics available yet.</p>
              <Button onClick={calculateMetrics} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Now"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{metrics.compliance_percentage.toFixed(1)}%</div>
                  {metrics.compliance_percentage >= 85 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MTTR (hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{metrics.mttr_hours.toFixed(1)}</div>
                  {metrics.mttr_hours <= 24 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Training Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{metrics.training_completion_rate.toFixed(1)}%</div>
                  {metrics.training_completion_rate >= 90 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{metrics.recent_incidents_count}</div>
                  {metrics.recent_incidents_count <= 3 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Failures by System</CardTitle>
                <CardDescription>System reliability breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {getFailureData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getFailureData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="system" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="failures" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No failure data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI vs Human Actions */}
          <Card>
            <CardHeader>
              <CardTitle>AI vs Human Actions</CardTitle>
              <CardDescription>Action distribution analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{metrics.ai_vs_human_actions.ai}</div>
                  <div className="text-sm text-muted-foreground">AI Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">{metrics.ai_vs_human_actions.human}</div>
                  <div className="text-sm text-muted-foreground">Human Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Calculation Info */}
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                Last calculated: {new Date(metrics.calculation_date).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
