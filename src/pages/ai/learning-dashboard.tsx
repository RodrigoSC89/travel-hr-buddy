/**
 * PATCH 874: AI Learning Dashboard
 * Full type-safety using ai_behavior_snapshots table as fallback
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Download,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type BehaviorSnapshotRow = Database["public"]["Tables"]["ai_behavior_snapshots"]["Row"];

interface LearningInsight {
  module_name: string;
  avg_accuracy: number;
  avg_precision: number;
  avg_recall: number;
  avg_f1: number;
  total_snapshots: number;
  trend: "improving" | "stable" | "degrading";
}

interface LearningProgress {
  date: string;
  avg_score: number;
  count: number;
}

// Map DB row to insight
function aggregateInsights(rows: BehaviorSnapshotRow[]): LearningInsight[] {
  const byModule = new Map<string, BehaviorSnapshotRow[]>();
  
  rows.forEach(row => {
    const module = row.module_name;
    if (!byModule.has(module)) byModule.set(module, []);
    byModule.get(module)!.push(row);
  });

  return Array.from(byModule.entries()).map(([module_name, snapshots]) => {
    const avg = (key: keyof BehaviorSnapshotRow) => {
      const values = snapshots.map(s => Number(s[key]) || 0);
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };
    
    // Determine trend based on recent vs older snapshots
    const sorted = [...snapshots].sort((a, b) => 
      new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime()
    );
    
    let trend: "improving" | "stable" | "degrading" = "stable";
    if (sorted.length >= 2) {
      const recent = Number(sorted[0].accuracy_score) || 0;
      const older = Number(sorted[sorted.length - 1].accuracy_score) || 0;
      if (recent > older * 1.05) trend = "improving";
      else if (recent < older * 0.95) trend = "degrading";
    }

    return {
      module_name,
      avg_accuracy: avg("accuracy_score"),
      avg_precision: avg("precision_score"),
      avg_recall: avg("recall_score"),
      avg_f1: avg("f1_score"),
      total_snapshots: snapshots.length,
      trend,
    };
  });
}

// Aggregate progress by date
function aggregateProgress(rows: BehaviorSnapshotRow[]): LearningProgress[] {
  const byDate = new Map<string, number[]>();
  
  rows.forEach(row => {
    const date = row.snapshot_date.split("T")[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(Number(row.accuracy_score) || 0);
  });

  return Array.from(byDate.entries())
    .map(([date, scores]) => ({
      date,
      avg_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days
}

export default function AILearningDashboard() {
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      const daysBack = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Load from ai_behavior_snapshots table
      const { data, error } = await supabase
        .from("ai_behavior_snapshots")
        .select("*")
        .gte("snapshot_date", startDate.toISOString())
        .order("snapshot_date", { ascending: false })
        .limit(500);

      if (error) {
        logger.error("Error loading AI snapshots:", error);
        throw error;
      }

      const rows = data || [];
      setInsights(aggregateInsights(rows));
      setProgress(aggregateProgress(rows));
      
    } catch (error) {
      logger.error("Error loading AI learning data:", error);
      toast({
        title: "Error",
        description: "Failed to load learning data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTrendIcon = (trend: LearningInsight["trend"]) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "degrading":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (trend: LearningInsight["trend"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (trend) {
      case "improving": return "default";
      case "degrading": return "destructive";
      default: return "secondary";
    }
  };

  // Calculate overall stats
  const overallAccuracy = insights.length > 0 
    ? insights.reduce((sum, i) => sum + i.avg_accuracy, 0) / insights.length 
    : 0;
  const improvingCount = insights.filter(i => i.trend === "improving").length;
  const totalSnapshots = insights.reduce((sum, i) => sum + i.total_snapshots, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Brain className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Learning Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor AI behavior and learning metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{(overallAccuracy * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Overall Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{improvingCount}</p>
                <p className="text-xs text-muted-foreground">Improving Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{insights.length}</p>
                <p className="text-xs text-muted-foreground">AI Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalSnapshots}</p>
                <p className="text-xs text-muted-foreground">Total Snapshots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights">
        <TabsList>
          <TabsTrigger value="insights">Module Insights</TabsTrigger>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Module Performance</CardTitle>
              <CardDescription>Performance metrics by AI module</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No AI behavior data found for the selected period
                </p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.module_name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary" />
                          <span className="font-medium">{insight.module_name}</span>
                          <Badge variant={getTrendBadge(insight.trend)}>
                            {getTrendIcon(insight.trend)}
                            <span className="ml-1 capitalize">{insight.trend}</span>
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {insight.total_snapshots} snapshots
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                          <Progress value={insight.avg_accuracy * 100} className="h-2 mt-1" />
                          <p className="text-sm font-medium mt-1">{(insight.avg_accuracy * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Precision</p>
                          <Progress value={insight.avg_precision * 100} className="h-2 mt-1" />
                          <p className="text-sm font-medium mt-1">{(insight.avg_precision * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Recall</p>
                          <Progress value={insight.avg_recall * 100} className="h-2 mt-1" />
                          <p className="text-sm font-medium mt-1">{(insight.avg_recall * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">F1 Score</p>
                          <Progress value={insight.avg_f1 * 100} className="h-2 mt-1" />
                          <p className="text-sm font-medium mt-1">{(insight.avg_f1 * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress Over Time</CardTitle>
              <CardDescription>AI accuracy trends</CardDescription>
            </CardHeader>
            <CardContent>
              {progress.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No progress data available
                </p>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.split("-").slice(1).join("/")}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Accuracy"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="avg_score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        name="Avg Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
