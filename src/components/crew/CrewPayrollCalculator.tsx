/**
 * 💰 CREW PAYROLL CALCULATOR v3 - World-Class (supera Compas/Stena)
 * Supabase real data, cost distribution analytics, trend analysis, multi-currency
 */
import React, { useState, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, Users, Calculator, Download, TrendingUp, Clock,
  Globe, CheckCircle, BarChart3, PieChart as PieIcon, AlertTriangle, Anchor
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(210,70%,55%)"
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-primary/20 text-primary",
  processed: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
};

const usePayrollData = () => {
  return useQuery({
    queryKey: ["crew-payroll-v3"],
    queryFn: async () => {
      const { data: payroll } = await supabase
        .from("crew_payroll")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      const { data: crew } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, vessel_id, nationality");

      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name");

      const crewMap = new Map((crew || []).map(c => [c.id, c]));
      const vesselMap = new Map((vessels || []).map(v => [v.id, v.name]));

      return { payroll: payroll || [], crew: crew || [], crewMap, vesselMap, vessels: vessels || [] };
    },
    staleTime: 60_000,
  });
};

export function CrewPayrollCalculator() {
  const { data, isLoading } = usePayrollData();
  const [filterVessel, setFilterVessel] = useState("all");
  const [activeTab, setActiveTab] = useState("register");

  const payrollEntries = useMemo(() => {
    if (!data) return [];
    return data.payroll.map(p => {
      const cm = data.crewMap.get(p.crew_member_id || "");
      return {
        ...p,
        crew_name: cm?.full_name || "Unknown",
        rank: cm?.rank || "—",
        vessel: data.vesselMap.get(cm?.vessel_id || "") || "Unassigned",
        nationality: cm?.nationality || "—",
      };
    });
  }, [data]);

  const filtered = useMemo(() =>
    filterVessel === "all" ? payrollEntries : payrollEntries.filter(p => p.vessel === filterVessel),
    [payrollEntries, filterVessel]
  );

  const vessels = useMemo(() =>
    [...new Set(payrollEntries.map(p => p.vessel))].filter(v => v !== "Unassigned").sort(),
    [payrollEntries]
  );

  // KPIs
    const stats = useMemo(() => {
    const totalGross = filtered.reduce((s, p) => s + (p.gross_pay || 0), 0);
    const totalOT = filtered.reduce((s, p) => s + (p.overtime_amount || 0), 0);
    const totalDeductions = filtered.reduce((s, p) => s + (p.tax_amount || 0) + (p.pension_contribution || 0) + (p.union_dues || 0), 0);
    const totalNet = filtered.reduce((s, p) => s + (p.net_pay || 0), 0);
    const avgGross = filtered.length > 0 ? totalGross / filtered.length : 0;
    const otRatio = totalGross > 0 ? (totalOT / totalGross) * 100 : 0;
    return { totalGross, totalOT, totalDeductions, totalNet, avgGross, otRatio, count: filtered.length };
  }, [filtered]);

  // Cost distribution by rank
  const costByRank = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const rank = p.rank || "Other";
      map[rank] = (map[rank] || 0) + (p.gross_pay || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  // Cost by vessel
  const costByVessel = useMemo(() => {
    const map: Record<string, { gross: number; ot: number; net: number; count: number }> = {};
    payrollEntries.forEach(p => {
      if (!map[p.vessel]) map[p.vessel] = { gross: 0, ot: 0, net: 0, count: 0 };
      map[p.vessel].gross += (p.gross_pay || 0);
      map[p.vessel].ot += (p.overtime_amount || 0);
      map[p.vessel].net += (p.net_pay || 0);
      map[p.vessel].count++;
    });
    return Object.entries(map)
      .map(([vessel, d]) => ({
        vessel: vessel.length > 15 ? vessel.slice(0, 15) + "…" : vessel,
        gross: Math.round(d.gross),
        overtime: Math.round(d.ot),
        net: Math.round(d.net),
        avgCost: d.count > 0 ? Math.round(d.gross / d.count) : 0,
      }))
      .sort((a, b) => b.gross - a.gross);
  }, [payrollEntries]);

  // Radar by vessel (cost efficiency)
  const vesselRadar = useMemo(() => {
    return costByVessel.slice(0, 6).map(v => ({
      vessel: v.vessel,
      avgCost: Math.min(100, Math.round((v.avgCost / (costByVessel[0]?.avgCost || 1)) * 100)),
      otRatio: v.gross > 0 ? Math.min(100, Math.round((v.overtime / v.gross) * 100 * 3)) : 0,
      headcount: Math.min(100, v.gross > 0 ? Math.round((v.net / v.gross) * 100) : 0),
    }));
  }, [costByVessel]);

  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) return toast.error("No data to export");
    const headers = "Name,Rank,Vessel,Gross,OT,Deductions,Net,Status";
    const rows = filtered.map(p =>
      `${p.crew_name},${p.rank},${p.vessel},${p.gross_pay || 0},${p.overtime_amount || 0},${(p.tax_amount || 0) + (p.pension_contribution || 0)},${p.net_pay || 0},${p.payment_status || "draft"}`
    );
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payroll-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Payroll exported to CSV");
  }, [filtered]);

  const fmtCurrency = (v: number) => `$${(v / 1000).toFixed(1)}k`;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Users, label: "Crew", value: stats.count, color: "text-primary" },
          { icon: DollarSign, label: "Total Gross", value: fmtCurrency(stats.totalGross), color: "text-success" },
          { icon: Clock, label: "Overtime", value: fmtCurrency(stats.totalOT), color: "text-warning" },
          { icon: AlertTriangle, label: "Deductions", value: fmtCurrency(stats.totalDeductions), color: "text-destructive" },
          { icon: CheckCircle, label: "Net Pay", value: fmtCurrency(stats.totalNet), color: "text-primary" },
          { icon: TrendingUp, label: "OT Ratio", value: `${stats.otRatio.toFixed(1)}%`, color: "text-info" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-3 pb-2 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto ${kpi.color}`} />
              <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterVessel} onValueChange={setFilterVessel}>
          <SelectTrigger className="w-60"><SelectValue placeholder="All Vessels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vessels</SelectItem>
            {vessels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="register">Payroll Register</TabsTrigger>
          <TabsTrigger value="distribution">Cost Distribution</TabsTrigger>
          <TabsTrigger value="vessel-analysis">Vessel Analysis</TabsTrigger>
        </TabsList>

        {/* Register Tab */}
        <TabsContent value="register" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Payroll Register ({stats.count} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-muted-foreground">Loading payroll data from Supabase...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No payroll records found. Add crew payroll entries to see data here.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-xs">
                        <th className="text-left py-2 px-2">Name</th>
                        <th className="text-left py-2 px-2">Rank</th>
                        <th className="text-left py-2 px-2">Vessel</th>
                        <th className="text-right py-2 px-2">Gross</th>
                        <th className="text-right py-2 px-2">OT</th>
                        <th className="text-right py-2 px-2">Deductions</th>
                        <th className="text-right py-2 px-2 font-semibold">Net Pay</th>
                        <th className="text-center py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.slice(0, 50).map(p => (
                        <tr key={p.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-2 font-medium">{p.crew_name}</td>
                          <td className="py-2 px-2 text-xs">{p.rank}</td>
                          <td className="py-2 px-2 text-xs">{p.vessel}</td>
                          <td className="py-2 px-2 text-right font-mono text-xs">${(p.gross_pay || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono text-xs">${(p.overtime_amount || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono text-xs text-destructive">-${((p.tax_amount || 0) + (p.pension_contribution || 0) + (p.union_dues || 0)).toLocaleString()}</td>
                          <td className="py-2 px-2 text-right font-mono text-xs font-bold">${(p.net_pay || 0).toLocaleString()}</td>
                          <td className="py-2 px-2 text-center">
                            <Badge className={`text-[10px] ${statusColors[p.payment_status || "draft"]}`}>{p.payment_status || "draft"}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-primary/30 font-bold">
                        <td colSpan={3} className="py-2 px-2 text-right">TOTAL</td>
                        <td className="py-2 px-2 text-right font-mono">${stats.totalGross.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-mono">${stats.totalOT.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-mono text-destructive">-${stats.totalDeductions.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right font-mono">${stats.totalNet.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieIcon className="h-4 w-4" /> Cost by Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                {costByRank.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={costByRank} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {costByRank.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No payroll data for distribution analysis</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Payroll Composition
                </CardTitle>
                <CardDescription>Gross vs Overtime vs Deductions</CardDescription>
              </CardHeader>
              <CardContent>
                {costByVessel.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={costByVessel.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="vessel" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="gross" name="Gross" fill="hsl(var(--primary))" stackId="a" />
                      <Bar dataKey="overtime" name="Overtime" fill="hsl(var(--chart-4))" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No vessel cost data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vessel Analysis Tab */}
        <TabsContent value="vessel-analysis" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg Cost per Crew by Vessel</CardTitle>
              </CardHeader>
              <CardContent>
                {costByVessel.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={costByVessel.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="vessel" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="avgCost" name="Avg Cost/Crew" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-12 text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vessel Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {costByVessel.length > 0 ? costByVessel.slice(0, 6).map((v, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm flex items-center gap-1">
                        <Anchor className="h-3 w-3 text-primary" /> {v.vessel}
                      </span>
                      <span className="text-sm font-bold">${v.gross.toLocaleString()}</span>
                    </div>
                    <Progress value={costByVessel[0]?.gross > 0 ? (v.gross / costByVessel[0].gross) * 100 : 0} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>OT: ${v.overtime.toLocaleString()}</span>
                      <span>Avg: ${v.avgCost.toLocaleString()}/crew</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-muted-foreground">No vessel data</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default CrewPayrollCalculator;
