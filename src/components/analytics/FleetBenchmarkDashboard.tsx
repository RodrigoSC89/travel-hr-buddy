/**
 * Fleet Benchmark Dashboard - Advanced analytics with trend analysis
 * Compares vessel performance across KPIs with export capabilities
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line
} from "recharts";
import { Download, TrendingUp, TrendingDown, Ship, Fuel, Shield, Wrench, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KPICardsSkeleton, ChartSkeleton } from "@/components/ui/LoadingSkeleton";

type Period = "7d" | "30d" | "90d" | "1y";

export function FleetBenchmarkDashboard() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: vessels = [], isLoading: loadingVessels } = useQuery({
    queryKey: ["fleet-benchmark-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, status, vessel_type, imo_number, flag_state");
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["fleet-benchmark-maint"],
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_tasks").select("id, status, priority, vessel_id, created_at, completed_at");
      return data || [];
    },
  });

  const { data: certs = [] } = useQuery({
    queryKey: ["fleet-benchmark-certs"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_certifications").select("id, vessel_id, expiry_date, status");
      return data || [];
    },
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["fleet-benchmark-incidents"],
    queryFn: async () => {
      const { data } = await supabase.from("soc_alerts").select("id, vessel_id, severity, resolved_at, created_at");
      return data || [];
    },
  });

  const { data: noonReports = [] } = useQuery({
    queryKey: ["fleet-benchmark-noon"],
    queryFn: async () => {
      const { data } = await fromUntyped("noon_reports")
        .select("id, vessel_id, fuel_consumed_mt, distance_nm, report_date")
        .order("report_date", { ascending: false })
        .limit(1000);
      return data || [];
    },
  });

  // Compute per-vessel benchmarks
  const benchmarks = useMemo(() => {
    return vessels.map((v) => {
      const vMaint = maintenance.filter((m: any) => m.vessel_id === v.id);
      const vCerts = certs.filter((c: any) => c.vessel_id === v.id);
      const vIncidents = incidents.filter((i: any) => i.vessel_id === v.id);
      const vNoon = noonReports.filter((n: any) => n.vessel_id === v.id);

      const completedMaint = vMaint.filter((m: any) => m.status === "completed").length;
      const totalMaint = vMaint.length || 1;
      const maintScore = Math.round((completedMaint / totalMaint) * 100);

      const validCerts = vCerts.filter((c: any) => new Date(c.expiry_date) > new Date()).length;
      const totalCerts = vCerts.length || 1;
      const certScore = Math.round((validCerts / totalCerts) * 100);

      const resolvedIncidents = vIncidents.filter((i: any) => i.resolved_at).length;
      const totalIncidents = vIncidents.length || 1;
      const safetyScore = Math.round((resolvedIncidents / totalIncidents) * 100);

      const totalFuel = vNoon.reduce((sum: number, n: any) => sum + (n.fuel_consumed_mt || 0), 0);
      const totalDist = vNoon.reduce((sum: number, n: any) => sum + (n.distance_nm || 0), 0);
      const fuelEfficiency = totalDist > 0 ? +(totalFuel / totalDist).toFixed(3) : 0;

      const overallScore = Math.round((maintScore * 0.3 + certScore * 0.3 + safetyScore * 0.25 + (fuelEfficiency > 0 ? Math.min(100, 100 - fuelEfficiency * 200) : 50) * 0.15));

      return {
        name: v.name,
        type: v.vessel_type,
        status: v.status,
        maintScore,
        certScore,
        safetyScore,
        fuelEfficiency,
        overallScore: Math.max(0, Math.min(100, overallScore)),
        totalIncidents: vIncidents.length,
        pendingMaint: vMaint.filter((m: any) => m.status === "pending").length,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [vessels, maintenance, certs, incidents, noonReports]);

  // Fleet averages
  const fleetAvg = useMemo(() => {
    if (benchmarks.length === 0) return { maint: 0, cert: 0, safety: 0, fuel: 0, overall: 0 };
    return {
      maint: Math.round(benchmarks.reduce((s, b) => s + b.maintScore, 0) / benchmarks.length),
      cert: Math.round(benchmarks.reduce((s, b) => s + b.certScore, 0) / benchmarks.length),
      safety: Math.round(benchmarks.reduce((s, b) => s + b.safetyScore, 0) / benchmarks.length),
      fuel: +(benchmarks.reduce((s, b) => s + b.fuelEfficiency, 0) / benchmarks.length).toFixed(3),
      overall: Math.round(benchmarks.reduce((s, b) => s + b.overallScore, 0) / benchmarks.length),
    };
  }, [benchmarks]);

  // Radar data for top 5 vessels
  const radarData = useMemo(() => {
    const top5 = benchmarks.slice(0, 5);
    return ["Manutenção", "Certificados", "Segurança", "Eficiência"].map((dim, i) => {
      const entry: Record<string, any> = { dimension: dim };
      top5.forEach((v) => {
        entry[v.name] = [v.maintScore, v.certScore, v.safetyScore, Math.max(0, 100 - v.fuelEfficiency * 200)][i];
      });
      return entry;
    });
  }, [benchmarks]);

  const handleExportCSV = () => {
    const headers = "Vessel,Type,Status,Maintenance%,Certificates%,Safety%,FuelEff,Overall%\n";
    const rows = benchmarks.map(b =>
      `${b.name},${b.type},${b.status},${b.maintScore},${b.certScore},${b.safetyScore},${b.fuelEfficiency},${b.overallScore}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-benchmark-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = loadingVessels;
  const radarColors = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))"];

  const kpis = [
    { label: "Fleet Score", value: `${fleetAvg.overall}%`, icon: BarChart3, trend: fleetAvg.overall >= 75 ? "up" : "down" },
    { label: "Manutenção Avg", value: `${fleetAvg.maint}%`, icon: Wrench, trend: fleetAvg.maint >= 80 ? "up" : "down" },
    { label: "Compliance Avg", value: `${fleetAvg.cert}%`, icon: Shield, trend: fleetAvg.cert >= 90 ? "up" : "down" },
    { label: "Embarcações", value: String(vessels.length), icon: Ship, trend: "up" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fleet Benchmarking</h2>
          <p className="text-sm text-muted-foreground">Análise comparativa de performance entre embarcações</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? <KPICardsSkeleton count={4} /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="bg-card border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton height={280} />
          <ChartSkeleton height={280} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart - Overall Scores */}
          <Card className="bg-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Score Geral por Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={benchmarks.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="overallScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Score %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart - Top 5 */}
          <Card className="bg-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Radar Comparativo (Top 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  {benchmarks.slice(0, 5).map((v, i) => (
                    <Radar key={v.name} name={v.name} dataKey={v.name} stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.15} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rankings Table */}
      <Card className="bg-card border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Ranking da Frota</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left p-3 text-muted-foreground font-medium">#</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Embarcação</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Manutenção</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Certificados</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Segurança</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Fuel Eff</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b, i) => (
                  <tr key={b.name} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">{b.name}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-xs">{b.type || "N/A"}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn("font-medium", b.maintScore >= 80 ? "text-success" : b.maintScore >= 50 ? "text-warning" : "text-destructive")}>{b.maintScore}%</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn("font-medium", b.certScore >= 90 ? "text-success" : b.certScore >= 70 ? "text-warning" : "text-destructive")}>{b.certScore}%</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn("font-medium", b.safetyScore >= 80 ? "text-success" : "text-warning")}>{b.safetyScore}%</span>
                    </td>
                    <td className="p-3 text-center font-mono text-muted-foreground">{b.fuelEfficiency}</td>
                    <td className="p-3 text-center">
                      <Badge className={cn(
                        "text-xs font-bold",
                        b.overallScore >= 80 ? "bg-success/20 text-success border-success/30" :
                        b.overallScore >= 60 ? "bg-warning/20 text-warning border-warning/30" :
                        "bg-destructive/20 text-destructive border-destructive/30"
                      )}>
                        {b.overallScore}%
                      </Badge>
                    </td>
                  </tr>
                ))}
                {benchmarks.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">Nenhuma embarcação encontrada</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FleetBenchmarkDashboard;
