import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Clock, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

interface IncidentMetrics {
  id: string;
  metric_date: string;
  total_incidents: number;
  critical_incidents: number;
  high_incidents: number;
  medium_incidents: number;
  low_incidents: number;
  avg_response_time_hours: number;
  avg_resolution_time_hours: number;
  incidents_by_category: Record<string, number> | null;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

export const IncidentMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<IncidentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Use analytics_metrics as fallback if incident_metrics doesn't exist
      const { data, error } = await supabase
        .from("analytics_metrics")
        .select("*")
        .eq("metric_name", "incidents")
        .gte("period_start", thirtyDaysAgo.toISOString())
        .order("period_start", { ascending: true });

      if (error) {
        logger.warn("Could not load incident metrics", { error: error.message });
        setMetrics([]);
        return;
      }

      // Transform analytics_metrics to IncidentMetrics format
      const transformed: IncidentMetrics[] = (data || []).map((m) => {
        const dimensions = m.dimensions as Record<string, unknown> | null;
        return {
          id: m.id,
          metric_date: m.period_start,
          total_incidents: m.metric_value || 0,
          critical_incidents: (dimensions?.critical as number) || 0,
          high_incidents: (dimensions?.high as number) || 0,
          medium_incidents: (dimensions?.medium as number) || 0,
          low_incidents: (dimensions?.low as number) || 0,
          avg_response_time_hours: (dimensions?.avg_response_hours as number) || 0,
          avg_resolution_time_hours: (dimensions?.avg_resolution_hours as number) || 0,
          incidents_by_category: (dimensions?.by_category as Record<string, number>) || null,
        };
      });

      setMetrics(transformed);
    } catch (error) {
      logger.error("Error fetching metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load incident metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const latestMetrics = metrics[metrics.length - 1];
  const avgResponseTime =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.avg_response_time_hours || 0), 0) / metrics.length
      : 0;
  const avgResolutionTime =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.avg_resolution_time_hours || 0), 0) / metrics.length
      : 0;

  // Prepare data for severity distribution pie chart
  const severityData = latestMetrics
    ? [
        { name: "Critical", value: latestMetrics.critical_incidents },
        { name: "High", value: latestMetrics.high_incidents },
        { name: "Medium", value: latestMetrics.medium_incidents },
        { name: "Low", value: latestMetrics.low_incidents },
      ].filter((d) => d.value > 0)
    : [];

  // Prepare data for category distribution
  const categoryData = latestMetrics?.incidents_by_category
    ? Object.entries(latestMetrics.incidents_by_category).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={`incident-skeleton-${i}`} className="h-64 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetrics?.total_incidents || 0}</div>
            <p className="text-xs text-muted-foreground">Latest period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {latestMetrics?.critical_incidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Trend (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="metric_date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value as string).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="critical_incidents" name="Critical" fill="#ef4444" stackId="a" />
                <Bar dataKey="high_incidents" name="High" fill="#f97316" stackId="a" />
                <Bar dataKey="medium_incidents" name="Medium" fill="#eab308" stackId="a" />
                <Bar dataKey="low_incidents" name="Low" fill="#22c55e" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
