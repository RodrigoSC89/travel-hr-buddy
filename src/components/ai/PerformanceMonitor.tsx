
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface PerformanceMetrics {
  module_name: string;
  avg_precision: number;
  avg_recall: number;
  avg_response_time: number;
  total_decisions: number;
  accepted_decisions: number;
  overridden_decisions: number;
}

interface SuggestionMetrics {
  module_name: string;
  total_suggestions: number;
  accepted_suggestions: number;
  acceptance_rate: number;
}

interface WatchdogAlert {
  id: string;
  created_at: string;
  alert_type: string;
  severity: string;
  module_name: string;
  behavior_mutation: string | null;
  tactical_deviation: string | null;
  resolved: boolean;
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [suggestionData, setSuggestionData] = useState<SuggestionMetrics[]>([]);
  const [watchdogAlerts, setWatchdogAlerts] = useState<WatchdogAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchPerformanceData();
    
    // Set up real-time subscriptions
    const performanceChannel = supabase
      .channel("ia_performance_updates")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "ia_performance_log" },
        () => fetchPerformanceData()
      )
      .subscribe();

    const alertsChannel = supabase
      .channel("watchdog_alerts_updates")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "watchdog_behavior_alerts" },
        () => fetchWatchdogAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(performanceChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  const fetchPerformanceData = async () => {
    try {
      // PATCH 609: Add pagination using range
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize - 1;
      
      // Fetch aggregated performance metrics
      const { data: perfData, error: perfError } = await supabase
        .from("ia_performance_log")
        .select("*")
        .order("created_at", { ascending: false })
        .range(startIndex, endIndex);

      if (perfError) throw perfError;

      // Aggregate by module
      const aggregated = aggregatePerformanceByModule(perfData || []);
      setPerformanceData(aggregated);

      // Fetch suggestion metrics
      const { data: suggData, error: suggError } = await supabase
        .from("ia_suggestions_log")
        .select("*")
        .order("created_at", { ascending: false })
        .range(startIndex, endIndex);

      if (suggError) throw suggError;

      const suggestionMetrics = aggregateSuggestionsByModule(suggData || []);
      setSuggestionData(suggestionMetrics);

      // Fetch watchdog alerts
      await fetchWatchdogAlerts();

    } catch (error) {
      logger.error("Error fetching performance data", error);
      toast.error("Failed to load performance metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchdogAlerts = async () => {
    const { data, error } = await supabase
      .from("watchdog_behavior_alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setWatchdogAlerts(data);
    }
  };

  const aggregatePerformanceByModule = (data: Array<Record<string, unknown>>): PerformanceMetrics[] => {
    const moduleMap = new Map<string, {
      module_name: string;
      precision_sum: number;
      recall_sum: number;
      response_time_sum: number;
      count: number;
      accepted: number;
      overridden: number;
    }>();

    data.forEach(record => {
      const moduleName = record.module_name as string;
      if (!moduleMap.has(moduleName)) {
        moduleMap.set(moduleName, {
          module_name: moduleName,
          precision_sum: 0,
          recall_sum: 0,
          response_time_sum: 0,
          count: 0,
          accepted: 0,
          overridden: 0,
        });
      }

      const stats = moduleMap.get(moduleName)!;
      stats.precision_sum += (record.precision_score as number) || 0;
      stats.recall_sum += (record.recall_score as number) || 0;
      stats.response_time_sum += (record.response_time_ms as number) || 0;
      stats.count += 1;
      if (record.decision_accepted) stats.accepted += 1;
      if (record.decision_overridden) stats.overridden += 1;
    });

    return Array.from(moduleMap.values()).map(stats => ({
      module_name: stats.module_name,
      avg_precision: stats.count > 0 ? stats.precision_sum / stats.count : 0,
      avg_recall: stats.count > 0 ? stats.recall_sum / stats.count : 0,
      avg_response_time: stats.count > 0 ? stats.response_time_sum / stats.count : 0,
      total_decisions: stats.count,
      accepted_decisions: stats.accepted,
      overridden_decisions: stats.overridden,
    }));
  };

  const aggregateSuggestionsByModule = (data: Array<Record<string, unknown>>): SuggestionMetrics[] => {
    const moduleMap = new Map<string, {
      module_name: string;
      total: number;
      accepted: number;
    }>();

    data.forEach(record => {
      const moduleName = record.module_name as string;
      if (!moduleMap.has(moduleName)) {
        moduleMap.set(moduleName, {
          module_name: moduleName,
          total: 0,
          accepted: 0,
        });
      }

      const stats = moduleMap.get(moduleName)!;
      stats.total += 1;
      if (record.accepted_by_crew) stats.accepted += 1;
    });

    return Array.from(moduleMap.values()).map(stats => ({
      module_name: stats.module_name,
      total_suggestions: stats.total,
      accepted_suggestions: stats.accepted,
      acceptance_rate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time tracking of AI module performance and behavioral evolution
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4 animate-pulse" />
          Live Monitoring
        </Badge>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="suggestions">Crew Suggestions</TabsTrigger>
          <TabsTrigger value="watchdog">
            System Watchdog
            {watchdogAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {watchdogAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceData.map((module) => (
              <Card key={module.module_name}>
                <CardHeader>
                  <CardTitle className="text-lg">{module.module_name}</CardTitle>
                  <CardDescription>
                    {module.total_decisions} total decisions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Precision</span>
                    <span className="font-semibold">
                      {(module.avg_precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Recall</span>
                    <span className="font-semibold">
                      {(module.avg_recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {Math.round(module.avg_response_time)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{module.accepted_decisions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">{module.overridden_decisions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestionData.map((module) => (
              <Card key={module.module_name}>
                <CardHeader>
                  <CardTitle className="text-lg">{module.module_name}</CardTitle>
                  <CardDescription>
                    {module.total_suggestions} suggestions made
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">
                        {module.acceptance_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {module.accepted_suggestions} accepted
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {module.total_suggestions - module.accepted_suggestions} rejected
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="watchdog" className="space-y-4">
          {watchdogAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                <p className="text-lg font-semibold">All Systems Normal</p>
                <p className="text-sm text-muted-foreground">
                  No behavioral mutations or tactical deviations detected
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {watchdogAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4" style={{
                  borderLeftColor: alert.severity === "critical" || alert.severity === "high" 
                    ? "rgb(239, 68, 68)" 
                    : alert.severity === "medium" 
                      ? "rgb(234, 179, 8)" 
                      : "rgb(59, 130, 246)"
                }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {alert.alert_type}
                        </CardTitle>
                        <CardDescription>
                          Module: {alert.module_name}
                        </CardDescription>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity) as "destructive" | "default" | "secondary"}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {alert.behavior_mutation && (
                      <div>
                        <span className="text-sm font-semibold">Behavior Mutation:</span>
                        <p className="text-sm text-muted-foreground">{alert.behavior_mutation}</p>
                      </div>
                    )}
                    {alert.tactical_deviation && (
                      <div>
                        <span className="text-sm font-semibold">Tactical Deviation:</span>
                        <p className="text-sm text-muted-foreground">{alert.tactical_deviation}</p>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Detected: {new Date(alert.created_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
