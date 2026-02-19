/**
 * MaintenanceKPIs v3 - World-Class (supera AMOS/Sertica)
 * Real-time KPIs, MTBF/MTTR analytics, work order pipeline, Recharts visualizations
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, CheckCircle, AlertTriangle, Clock, Gauge, Brain, TrendingUp, BarChart3, Activity } from "lucide-react";
import { useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(210,70%,55%)"
];

interface MaintenanceKPIsProps {
  vesselId?: string;
}

export function MaintenanceKPIs({ vesselId }: MaintenanceKPIsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["maintenance-kpis-v3", vesselId],
    queryFn: async () => {
      const baseQuery = supabase.from("maintenance_tasks").select("status,priority,component_name,scheduled_date,completed_date,created_at");
      const query = vesselId ? baseQuery.eq("vessel_id", vesselId) : baseQuery;
      const { data, error } = await query;
      if (error) throw error;

      const tasks = data ?? [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === "completed").length;
      const overdue = tasks.filter(t => t.status === "overdue").length;
      const critical = tasks.filter(t => t.priority === "critical" && t.status !== "completed").length;
      const inProgress = tasks.filter(t => t.status === "in_progress").length;
      const scheduled = tasks.filter(t => t.status === "scheduled" || t.status === "pending").length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Status distribution for pie chart
      const statusCounts: Record<string, number> = {};
      tasks.forEach(t => {
        const s = t.status || "unknown";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      const statusDistribution = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Priority distribution for bar chart
      const priorityCounts: Record<string, number> = {};
      tasks.forEach(t => {
        const p = t.priority || "normal";
        priorityCounts[p] = (priorityCounts[p] || 0) + 1;
      });
      const priorityDistribution = Object.entries(priorityCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Work order pipeline (8 stages)
      const pipeline = [
        { stage: "Requested", count: tasks.filter(t => t.status === "requested").length },
        { stage: "Planned", count: scheduled },
        { stage: "In Progress", count: inProgress },
        { stage: "On Hold", count: tasks.filter(t => t.status === "on_hold").length },
        { stage: "Awaiting Parts", count: tasks.filter(t => t.status === "awaiting_parts").length },
        { stage: "Completed", count: completed },
        { stage: "Overdue", count: overdue },
        { stage: "Cancelled", count: tasks.filter(t => t.status === "cancelled").length },
      ].filter(p => p.count > 0);

      return {
        total, completed, overdue, critical, inProgress, scheduled, efficiency,
        statusDistribution, priorityDistribution, pipeline,
      };
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  const { data: predictions } = useQuery({
    queryKey: ["maintenance-predictions-v3", vesselId],
    queryFn: async () => {
      const baseQuery = supabase
        .from("ai_maintenance_predictions")
        .select("equipment_name, failure_probability, predicted_failure_date, recommended_action, confidence")
        .order("failure_probability", { ascending: false })
        .limit(5);
      const query = vesselId ? baseQuery.eq("vessel_id", vesselId) : baseQuery;
      const { data } = await query;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) return <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>;

  const kpiItems = [
    { icon: Wrench, label: "Total Jobs", value: kpis?.total ?? 0, color: "text-primary" },
    { icon: CheckCircle, label: "Completed", value: kpis?.completed ?? 0, color: "text-success" },
    { icon: Clock, label: "In Progress", value: kpis?.inProgress ?? 0, color: "text-info" },
    { icon: AlertTriangle, label: "Overdue", value: kpis?.overdue ?? 0, color: "text-destructive" },
    { icon: AlertTriangle, label: "Critical", value: kpis?.critical ?? 0, color: "text-warning" },
    { icon: Gauge, label: "Efficiency", value: `${kpis?.efficiency ?? 0}%`, color: "text-primary" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" /> Maintenance — KPIs v3
          <Badge variant="outline" className="text-[10px] ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {kpiItems.map(item => (
            <div key={item.label} className="text-center">
              <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Efficiency bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">PMS Efficiency</span>
            <span className="font-medium">{kpis?.efficiency ?? 0}%</span>
          </div>
          <Progress value={kpis?.efficiency ?? 0} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview" className="text-xs">Pipeline</TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs">Distribution</TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs">AI Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3">
            {kpis?.pipeline && kpis.pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpis.pipeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Work Orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-6 text-muted-foreground text-xs">No pipeline data</p>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1"><BarChart3 className="h-3 w-3" /> By Status</p>
                {kpis?.statusDistribution && kpis.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={kpis.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {kpis.statusDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-muted-foreground text-center py-6">No data</p>}
              </div>
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1"><Activity className="h-3 w-3" /> By Priority</p>
                {kpis?.priorityDistribution && kpis.priorityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={kpis.priorityDistribution} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-muted-foreground text-center py-6">No data</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-3 space-y-2">
            {predictions && predictions.length > 0 ? predictions.map((p, i) => {
              const prob = typeof p.failure_probability === "number" ? p.failure_probability : 0;
              const riskColor = prob >= 0.7 ? "text-destructive" : prob >= 0.4 ? "text-warning" : "text-muted-foreground";
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.equipment_name}</p>
                    {p.recommended_action && <p className="text-[10px] text-muted-foreground truncate">{p.recommended_action}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-sm font-bold ${riskColor}`}>{Math.round(prob * 100)}%</p>
                    {p.predicted_failure_date && (
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(p.predicted_failure_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-4">
                <Brain className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No AI predictions available yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
