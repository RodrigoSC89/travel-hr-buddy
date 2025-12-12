import { useEffect, useState, useCallback } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const HealthMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgMood: 0,
    avgSleep: 0,
    avgStress: 0,
    avgHeartRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load last 30 days of metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: metricsData, error: metricsError } = await supabase
        .from("crew_health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .gte("recorded_at", thirtyDaysAgo.toISOString())
        .order("recorded_at", { ascending: true });

      if (metricsError) throw metricsError;

      setMetrics(metricsData || []);

      // Calculate averages
      if (metricsData && metricsData.length > 0) {
        const avgMood = metricsData.reduce((sum, m) => sum + (m.mood_score || 0), 0) / metricsData.length;
        const avgSleep = metricsData.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / metricsData.length;
        const avgStress = metricsData.reduce((sum, m) => sum + (m.stress_level || 0), 0) / metricsData.length;
        const heartRates = metricsData.filter(m => m.heart_rate).map(m => m.heart_rate);
        const avgHeartRate = heartRates.length > 0
          ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
          : 0;

        setStats({
          avgMood: Math.round(avgMood * 10) / 10,
          avgSleep: Math.round(avgSleep * 10) / 10,
          avgStress: Math.round(avgStress * 10) / 10,
          avgHeartRate: Math.round(avgHeartRate),
        });
      }

      // Load recent anomalies
      const { data: anomaliesData, error: anomaliesError } = await supabase
        .from("health_anomalies")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (anomaliesError) throw anomaliesError;
      setAnomalies(anomaliesData || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading health data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = metrics.map(m => ({
    date: new Date(m.recorded_at).toLocaleDateString(),
    mood: m.mood_score,
    sleep: m.sleep_hours,
    stress: m.stress_level,
    heartRate: m.heart_rate || null,
  }));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "destructive";
    case "warning":
      return "default";
    default:
      return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading health metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>Health Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <Badge variant={getSeverityColor(anomaly.severity)} className="mb-1">
                      {anomaly.severity}
                    </Badge>
                    <p className="text-sm">{anomaly.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(anomaly.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMood}/10</div>
            <Badge variant={stats.avgMood >= 7 ? "default" : "secondary"}>
              {stats.avgMood >= 7 ? "Good" : "Needs Attention"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSleep}h</div>
            <Badge variant={stats.avgSleep >= 7 ? "default" : "secondary"}>
              {stats.avgSleep >= 7 ? "Healthy" : "Low"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgStress}/10</div>
            <Badge variant={stats.avgStress <= 5 ? "default" : "secondary"}>
              {stats.avgStress <= 5 ? "Normal" : "Elevated"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Heart Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHeartRate} bpm</div>
            <Badge variant="default">Normal Range</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mood & Stress Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} name="Mood" />
                  <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sleep & Heart Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep (hours)" />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" stroke="#f59e0b" strokeWidth={2} name="Heart Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {metrics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No health data yet</h3>
            <p className="text-muted-foreground">
              Start tracking your health by submitting your first check-in
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
