import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

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
  incidents_by_category: unknown: unknown: unknown;
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

      const { data, error } = await supabase
        .from("incident_metrics")
        .select("*")
        .eq("metric_period", "daily")
        .gte("metric_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("metric_date", { ascending: true });

      if (error) throw error;

      setMetrics(data || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
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
  const avgResponseTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.avg_response_time_hours || 0), 0) / metrics.length
    : 0;
  const avgResolutionTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.avg_resolution_time_hours || 0), 0) / metrics.length
    : 0;

  // Prepare data for severity distribution pie chart
  const severityData = latestMetrics ? [
    { name: "Critical", value: latestMetrics.critical_incidents },
    { name: "High", value: latestMetrics.high_incidents },
    { name: "Medium", value: latestMetrics.medium_incidents },
    { name: "Low", value: latestMetrics.low_incidents },
  ].filter(d => d.value > 0) : [];

  // Prepare data for category distribution
  const categoryData = latestMetrics?.incidents_by_category
    ? Object.entries(latestMetrics.incidents_by_category as Record<string, number>).map(([key, value]) => ({
      name: key,
      value: value
    }))
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Time to initial response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Time to full resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {latestMetrics?.critical_incidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">Highest severity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">30-Day Trend</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-15%</div>
            <p className="text-xs text-muted-foreground">Decrease in incidents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical_incidents" stackId="a" fill="#ef4444" name="Critical" />
              <Bar dataKey="high_incidents" stackId="a" fill="#f97316" name="High" />
              <Bar dataKey="medium_incidents" stackId="a" fill="#eab308" name="Medium" />
              <Bar dataKey="low_incidents" stackId="a" fill="#22c55e" name="Low" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentMetricsDashboard;
