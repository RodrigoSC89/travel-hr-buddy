import { useEffect, useState, useCallback, useMemo } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Heart, Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WellbeingScore {
  overall: number;
  physical: number;
  mental: number;
  trend: "up" | "down" | "stable";
}

export const WellbeingDashboard: React.FC = () => {
  const [score, setScore] = useState<WellbeingScore>({
    overall: 0,
    physical: 0,
    mental: 0,
    trend: "stable",
  };
  const [loading, setLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchWellbeingData();
  }, []);

  const fetchWellbeingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch calculated wellbeing score
      const { data: scoreData, error: scoreError } = await supabase
        .rpc("calculate_wellbeing_score", { p_user_id: user.id, p_days: 7 });

      if (scoreError) throw scoreError;

      // Fetch recent health check-ins
      const { data: checkins } = await supabase
        .from("health_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("checkin_date", { ascending: false })
        .limit(7);

      // Fetch active alerts
      const { data: alerts } = await supabase
        .from("wellbeing_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      // Calculate scores
      const overallScore = scoreData || 7.0;
      const physicalScore = checkins?.length > 0
        ? checkins.reduce((acc, c) => acc + (c.energy_level || 3), 0) / checkins.length * 2
        : 7.0;
      const mentalScore = checkins?.length > 0
        ? checkins.reduce((acc, c) => acc + (c.mood_rating || 3), 0) / checkins.length * 2
        : 7.0;

      setScore({
        overall: overallScore,
        physical: physicalScore,
        mental: mentalScore,
        trend: overallScore >= 7 ? "up" : overallScore >= 5 ? "stable" : "down",
      });
      setRecentAlerts(alerts || []);
    } catch (error) {
      console.error("Error fetching wellbeing data:", error);
      toast({
        title: "Error",
        description: "Failed to load wellbeing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Wellbeing Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overall Wellbeing</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall.toFixed(1)}/10
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getScoreLabel(score.overall)}
          </p>
          <Progress value={score.overall * 10} className="mt-2" />
        </CardContent>
      </Card>

      {/* Physical Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Physical Health</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(score.physical)}`}>
            {score.physical.toFixed(1)}/10
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getScoreLabel(score.physical)}
          </p>
          <Progress value={score.physical * 10} className="mt-2" />
        </CardContent>
      </Card>

      {/* Mental Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Mental Health</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getScoreColor(score.mental)}`}>
            {score.mental.toFixed(1)}/10
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getScoreLabel(score.mental)}
          </p>
          <Progress value={score.mental * 10} className="mt-2" />
        </CardContent>
      </Card>

      {/* Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">7-Day Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge
              variant={score.trend === "up" ? "default" : score.trend === "stable" ? "secondary" : "destructive"}
            >
              {score.trend === "up" && "↑ Improving"}
              {score.trend === "stable" && "→ Stable"}
              {score.trend === "down" && "↓ Declining"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on recent check-ins
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {recentAlerts.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Active Wellbeing Alerts
            </CardTitle>
            <CardDescription>
              Review and address these alerts to improve your wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={alert.severity === "critical" ? "destructive" : "secondary"}
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
