
import { memo, memo, useEffect, useState, useCallback, useMemo } from "react";;;
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Ship, Users, AlertTriangle, TrendingUp, Gauge } from "lucide-react";
import { toast } from "sonner";

interface OperationalMetrics {
  total_vessels: number;
  active_vessels: number;
  crew_members: number;
  active_rotations: number;
  pending_checklists: number;
  active_alerts: number;
  avg_fuel_efficiency: number;
  total_voyages: number;
}

export const OperationsDashboard = memo(function() {
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    total_vessels: 0,
    active_vessels: 0,
    crew_members: 0,
    active_rotations: 0,
    pending_checklists: 0,
    active_alerts: 0,
    avg_fuel_efficiency: 0,
    total_voyages: 0
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperationalData();
    generateAISuggestions();

    // Set up real-time updates
    const channel = supabase
      .channel("operations_updates")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        loadOperationalData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOperationalData = async () => {
    try {
      // Fetch all operational metrics in parallel
      const [
        vesselsRes,
        activeVesselsRes,
        crewRes,
        rotationsRes,
        checklistsRes,
        alertsRes,
        fuelRes,
        voyagesRes
      ] = await Promise.all([
        supabase.from("vessels").select("id", { count: "exact", head: true }),
        supabase.from("vessel_status").select("id", { count: "exact", head: true }).in("status", ["underway", "at_anchor"]),
        supabase.from("crew_assignments").select("id", { count: "exact", head: true }).eq("assignment_status", "active"),
        supabase.from("crew_rotations").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("checklist_records").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("maintenance_alerts").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("fuel_usage").select("efficiency_rating").order("recorded_at", { ascending: false }).limit(10),
        supabase.from("voyage_plans").select("id", { count: "exact", head: true }).eq("status", "active")
      ]);

      // Calculate average fuel efficiency
      const avgEfficiency = fuelRes.data && fuelRes.data.length > 0
        ? fuelRes.data.reduce((sum: number, f: unknown) => sum + (f.efficiency_rating || 0), 0) / fuelRes.data.length
        : 0;

      setMetrics({
        total_vessels: vesselsRes.count || 0,
        active_vessels: activeVesselsRes.count || 0,
        crew_members: crewRes.count || 0,
        active_rotations: rotationsRes.count || 0,
        pending_checklists: checklistsRes.count || 0,
        active_alerts: alertsRes.count || 0,
        avg_fuel_efficiency: avgEfficiency,
        total_voyages: voyagesRes.count || 0
      });
    } catch (error) {
      console.error("Error loading operational data:", error);
      toast.error("Failed to load operational metrics");
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = () => {
    // AI-powered operational suggestions
    // In a real implementation, this would call an AI service
    const suggestions = [
      "Consider rerouting Vessel A to avoid upcoming storm system",
      "Schedule maintenance for Vessel B - fuel efficiency below threshold",
      "Crew rotation due in 3 days - confirm travel arrangements",
      "Optimize fuel consumption on Route C - potential 15% savings",
      "Review pending safety checklists before next departure"
    ];

    setAiSuggestions(suggestions);
  });

  const getMetricColor = (value: number, threshold: number, reverse = false) => {
    if (reverse) {
      return value <= threshold ? "text-green-500" : "text-red-500";
    }
    return value >= threshold ? "text-green-500" : "text-yellow-500";
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading operations dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Operations Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time operational metrics and AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vessels</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.active_vessels} / {metrics.total_vessels}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics.active_vessels / metrics.total_vessels) * 100 || 0).toFixed(0)}% operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crew Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.crew_members}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.active_rotations} rotations scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.active_alerts, 5, true)}`}>
              {metrics.active_alerts}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.pending_checklists} pending checklists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avg_fuel_efficiency.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average rating across fleet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                AI Operational Insights
              </CardTitle>
              <CardDescription>
                Intelligent recommendations based on current operations
              </CardDescription>
            </div>
            <Badge variant="secondary">AI Powered</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm">{suggestion}</p>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              View real-time vessel positions and status
            </p>
            <Button size="sm" variant="outline" className="w-full">
              View Fleet Map
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Crew Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage crew assignments and rotations
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Manage Crew
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Voyage Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Plan routes with weather and fuel optimization
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Plan Voyage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
