import { useEffect, useState, useCallback } from "react";;

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Calendar } from "lucide-react";

interface HistoryData {
  date: string;
  mood: number;
  stress: number;
  energy: number;
  sleep: number;
  wellbeing_score: number;
}

export const WellbeingHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch health check-ins for the last 30 days
      const { data: checkins, error } = await supabase
        .from("health_checkins")
        .select("*")
        .eq("user_id", user.id)
        .gte("checkin_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("checkin_date", { ascending: true });

      if (error) throw error;

      // Fetch wellbeing logs
      const { data: logs } = await supabase
        .from("crew_wellbeing_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(30);

      // Transform data for chart
      const chartData: HistoryData[] = (checkins || []).map((checkin) => {
        // Find corresponding wellbeing log
        const log = logs?.find((l) =>
          new Date(l.created_at).toDateString() === new Date(checkin.checkin_date).toDateString()
        );

        return {
          date: new Date(checkin.checkin_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          mood: checkin.mood_rating || 0,
          stress: 6 - (checkin.stress_level || 3), // Invert stress so higher is better
          energy: checkin.energy_level || 0,
          sleep: Math.min((checkin.sleep_hours || 0) / 2, 5), // Normalize to 0-5 scale
          wellbeing_score: log?.wellbeing_score || 0,
        };
      };

      setHistoryData(chartData);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error",
        description: "Failed to load wellbeing history",
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (historyData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No History Available</h3>
          <p className="text-muted-foreground">
            Complete your weekly assessments to track your wellbeing over time
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Wellbeing Trends (Last 30 Days)
          </CardTitle>
          <CardDescription>
            Track your wellbeing metrics over time to identify patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="wellbeing_score"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Overall Score"
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#10b981"
                strokeWidth={2}
                name="Mood"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#ef4444"
                strokeWidth={2}
                name="Stress (inverted)"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Energy"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
          <CardDescription>Your last 10 wellbeing assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historyData.slice(-10).reverse().map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{entry.date}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      Mood: {entry.mood}/5
                    </Badge>
                    <Badge variant="outline">
                      Energy: {entry.energy}/5
                    </Badge>
                    <Badge variant="outline">
                      Stress: {(6 - entry.stress)}/5
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {entry.wellbeing_score.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                historyData.reduce((acc, curr) => acc + curr.mood, 0) /
                historyData.length
              ).toFixed(1)}
              /5
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                historyData.reduce((acc, curr) => acc + curr.energy, 0) /
                historyData.length
              ).toFixed(1)}
              /5
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Wellbeing Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                historyData.reduce((acc, curr) => acc + curr.wellbeing_score, 0) /
                historyData.length
              ).toFixed(1)}
              /10
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
