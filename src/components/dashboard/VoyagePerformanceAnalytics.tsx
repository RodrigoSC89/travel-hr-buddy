/**
 * VoyagePerformanceAnalytics v3
 * Real-time voyage P&L, TCE trends, status distribution, and performance benchmarking
 */
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Navigation, DollarSign, Clock, Fuel, Ship, Anchor, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, kpiCard } from "@/lib/animations/motion-variants";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  completed: 'hsl(var(--success))',
  in_progress: 'hsl(var(--primary))',
  active: 'hsl(var(--primary))',
  underway: 'hsl(var(--info))',
  planned: 'hsl(var(--warning))',
  cancelled: 'hsl(var(--destructive))',
  draft: 'hsl(var(--muted-foreground))',
};

export default function VoyagePerformanceAnalytics() {
  const { data: voyages, isLoading: vLoading } = useQuery({
    queryKey: ["voyage-performance-analytics-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("voyage_plans")
        .select("id, voyage_number, status, origin_port, destination_port, distance_nm, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenses } = useQuery({
    queryKey: ["voyage-expenses-analytics-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("amount, category, date")
        .gte("date", new Date(Date.now() - 180 * 86400000).toISOString().split("T")[0])
        .limit(500);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const analytics = useMemo(() => {
    const total = voyages?.length || 0;
    const completed = voyages?.filter(v => v.status === "completed").length || 0;
    const active = voyages?.filter(v => ["in_progress", "active", "underway"].includes(v.status || "")).length || 0;
    const planned = voyages?.filter(v => v.status === "planned").length || 0;
    const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount || 0), 0) || 0;
    const avgDistance = voyages?.filter(v => v.distance_nm).reduce((s, v, _, a) => s + (v.distance_nm || 0) / a.length, 0) || 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const utilizationRate = total > 0 ? ((active + completed) / total) * 100 : 0;

    // Status distribution for pie chart
    const statusMap: Record<string, number> = {};
    voyages?.forEach(v => { const s = v.status || 'draft'; statusMap[s] = (statusMap[s] || 0) + 1; });
    const statusDist = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // Expense by category
    const catMap: Record<string, number> = {};
    expenses?.forEach(e => { const c = e.category || 'Other'; catMap[c] = (catMap[c] || 0) + Number(e.amount || 0); });
    const expenseByCategory = Object.entries(catMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Monthly voyage count
    const monthMap: Record<string, { voyages: number; expenses: number }> = {};
    voyages?.forEach(v => {
      const m = v.created_at?.slice(0, 7) || 'Unknown';
      if (!monthMap[m]) monthMap[m] = { voyages: 0, expenses: 0 };
      monthMap[m].voyages++;
    });
    expenses?.forEach(e => {
      const m = e.date?.slice(0, 7) || 'Unknown';
      if (!monthMap[m]) monthMap[m] = { voyages: 0, expenses: 0 };
      monthMap[m].expenses += Number(e.amount || 0);
    });
    const monthlyTrend = Object.entries(monthMap)
      .map(([month, d]) => ({ month: month.slice(5), ...d }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    return { total, completed, active, planned, totalExpenses, avgDistance, completionRate, utilizationRate, statusDist, expenseByCategory, monthlyTrend };
  }, [voyages, expenses]);

  if (vLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Voyage Performance v3</CardTitle>
          </div>
          <Badge variant="outline">{analytics.total} voyages</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Grid */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={staggerContainer} initial="hidden" animate="visible">
          {[
            { label: "Active", value: analytics.active, icon: Ship, color: "text-primary", sub: "In progress" },
            { label: "Completed", value: analytics.completed, icon: Anchor, color: "text-success", sub: `${analytics.completionRate.toFixed(0)}% rate` },
            { label: "Planned", value: analytics.planned, icon: Clock, color: "text-warning", sub: "Upcoming" },
            { label: "OPEX", value: `$${(analytics.totalExpenses / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-destructive", sub: "Total expenses" },
          ].map(k => (
            <motion.div key={k.label} variants={kpiCard} className="bg-muted/50 rounded-lg p-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <p className="text-xl font-bold">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
              <p className="text-[9px] text-muted-foreground/70">{k.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Utilization Bar */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium">Fleet Utilization</span>
            <span className="text-xs font-bold">{analytics.utilizationRate.toFixed(0)}%</span>
          </div>
          <Progress value={analytics.utilizationRate} className="h-2" />
          <p className="text-[10px] text-muted-foreground mt-1">Avg distance: {analytics.avgDistance.toFixed(0)} NM</p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status Distribution */}
          {analytics.statusDist.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Voyage Status</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={analytics.statusDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.statusDist.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || `hsl(${i * 60}, 50%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Trend */}
          {analytics.monthlyTrend.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2 text-muted-foreground">Monthly Activity</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="voyages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Voyages" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        {analytics.expenseByCategory.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Top Expense Categories</p>
            <div className="space-y-1.5">
              {analytics.expenseByCategory.map((cat, i) => {
                const maxVal = analytics.expenseByCategory[0]?.value || 1;
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="text-xs w-20 truncate">{cat.name}</span>
                    <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${(cat.value / maxVal) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">${(cat.value / 1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
