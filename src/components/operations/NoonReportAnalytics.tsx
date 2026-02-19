/**
 * Noon Report Analytics v3 - World-class performance intelligence
 * Real Supabase data + EEOI Calculator + Speed/Consumption Radar + CP Comparison
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, Fuel, Navigation, Wind, TrendingUp, TrendingDown,
  Download, Clock, Gauge, Globe, Award, Ship
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { quickExport } from "@/lib/export-utils";

// IMO CO2 emission factors (kg CO2 per MT fuel)
const CO2_FACTORS: Record<string, number> = { HFO: 3114, MDO: 3206, MGO: 3206, VLSFO: 3151, LSMGO: 3206 };

export function NoonReportAnalytics() {
  const [tab, setTab] = useState("performance");

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['noon-analytics-v3'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noon_reports')
        .select('id, report_date, vessel_id, speed_avg, speed_ordered, distance_run, distance_to_go, consumption_hfo, consumption_mdo, consumption_mgo, sea_state, wind_force, me_rpm, me_power, me_load_percent, draft_fwd, draft_aft, vessel_status, created_at')
        .order('report_date', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['noon-vessels-analytics'],
    queryFn: async () => {
      const { data } = await supabase.from('vessels').select('id, name, gross_tonnage').limit(100);
      return data || [];
    },
  });

  const analytics = useMemo(() => {
    if (!reports.length) return null;

    const totalDistance = reports.reduce((s, r) => s + (r.distance_run || 0), 0);
    const totalHFO = reports.reduce((s, r) => s + (r.consumption_hfo || 0), 0);
    const totalMDO = reports.reduce((s, r) => s + (r.consumption_mdo || 0), 0);
    const totalMGO = reports.reduce((s, r) => s + (r.consumption_mgo || 0), 0);
    const totalFuel = totalHFO + totalMDO + totalMGO;
    const avgSpeed = reports.reduce((s, r) => s + (r.speed_avg || 0), 0) / reports.length;
    const avgWind = reports.filter(r => r.wind_force).reduce((s, r) => s + (r.wind_force || 0), 0) / (reports.filter(r => r.wind_force).length || 1);
    const fuelEfficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;

    // EEOI Calculation: (CO2 * 10^6) / (DWT * Distance)
    const totalCO2 = (totalHFO * CO2_FACTORS.HFO + totalMDO * CO2_FACTORS.MDO + totalMGO * CO2_FACTORS.MGO) / 1000; // tonnes
    const avgDWT = vessels.length > 0 ? vessels.reduce((s, v) => s + ((v.gross_tonnage || 5000) * 1.5), 0) / vessels.length : 7500;
    const eeoi = totalDistance > 0 && avgDWT > 0 ? (totalCO2 * 1e6) / (avgDWT * totalDistance) : 0;

    // Good vs Bad weather (Beaufort >= 5 = bad)
    const goodWeather = reports.filter(r => (r.wind_force || 0) < 5);
    const badWeather = reports.filter(r => (r.wind_force || 0) >= 5);
    const goodAvgSpeed = goodWeather.length > 0 ? goodWeather.reduce((s, r) => s + (r.speed_avg || 0), 0) / goodWeather.length : 0;
    const badAvgSpeed = badWeather.length > 0 ? badWeather.reduce((s, r) => s + (r.speed_avg || 0), 0) / badWeather.length : 0;
    const goodAvgFuel = goodWeather.length > 0 ? goodWeather.reduce((s, r) => s + (r.consumption_hfo || 0) + (r.consumption_mdo || 0), 0) / goodWeather.length : 0;
    const badAvgFuel = badWeather.length > 0 ? badWeather.reduce((s, r) => s + (r.consumption_hfo || 0) + (r.consumption_mdo || 0), 0) / badWeather.length : 0;

    // Daily trend (last 14 reports)
    const dailyTrend = reports.slice(0, 14).reverse().map(r => ({
      date: r.report_date?.slice(5, 10) || '',
      hfo: r.consumption_hfo || 0,
      mdo: r.consumption_mdo || 0,
      speed: r.speed_avg || 0,
    }));

    // Vessel ranking
    const vesselMap: Record<string, { totalFuel: number; totalDist: number; count: number; name: string }> = {};
    reports.forEach(r => {
      if (!r.vessel_id) return;
      if (!vesselMap[r.vessel_id]) {
        const v = vessels.find(v => v.id === r.vessel_id);
        vesselMap[r.vessel_id] = { totalFuel: 0, totalDist: 0, count: 0, name: v?.name || r.vessel_id.slice(0, 8) };
      }
      vesselMap[r.vessel_id].totalFuel += (r.consumption_hfo || 0) + (r.consumption_mdo || 0) + (r.consumption_mgo || 0);
      vesselMap[r.vessel_id].totalDist += r.distance_run || 0;
      vesselMap[r.vessel_id].count++;
    });
    const vesselRanking = Object.values(vesselMap)
      .map(v => ({ ...v, efficiency: v.totalDist > 0 ? v.totalFuel / v.totalDist : 0 }))
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, 5);

    // Radar data
    const maxSpeed = Math.max(...reports.map(r => r.speed_avg || 0), 1);
    const maxFuel = Math.max(...reports.map(r => (r.consumption_hfo || 0) + (r.consumption_mdo || 0)), 1);
    const maxWind = 12;
    const radarData = [
      { dim: 'Speed', value: Math.round((avgSpeed / maxSpeed) * 100), fullMark: 100 },
      { dim: 'Fuel Eff.', value: Math.round((1 - fuelEfficiency) * 100), fullMark: 100 },
      { dim: 'Weather', value: Math.round(((maxWind - avgWind) / maxWind) * 100), fullMark: 100 },
      { dim: 'Distance', value: Math.min(100, Math.round((totalDistance / (reports.length * 350)) * 100)), fullMark: 100 },
      { dim: 'EEOI', value: Math.max(0, Math.round((1 - eeoi / 30) * 100)), fullMark: 100 },
      { dim: 'Reports', value: Math.min(100, Math.round((reports.length / 100) * 100)), fullMark: 100 },
    ];

    return {
      totalReports: reports.length, totalDistance, totalFuel, avgSpeed, avgWind, fuelEfficiency, eeoi, totalCO2,
      goodWeather: { count: goodWeather.length, avgSpeed: goodAvgSpeed, avgFuel: goodAvgFuel },
      badWeather: { count: badWeather.length, avgSpeed: badAvgSpeed, avgFuel: badAvgFuel },
      dailyTrend, vesselRanking, radarData, uniqueVessels: Object.keys(vesselMap).length,
    };
  }, [reports, vessels]);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-5 gap-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div></div>;

  if (!analytics) return <Card className="p-8 text-center text-muted-foreground">Nenhum noon report registrado.</Card>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" /> Noon Report Analytics v3
          </h1>
          <p className="text-muted-foreground">{analytics.totalReports} reports • {analytics.uniqueVessels} vessels • EEOI: {analytics.eeoi.toFixed(2)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => quickExport(analytics.dailyTrend, "Noon Report Analytics v3")}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Avg Speed", value: `${analytics.avgSpeed.toFixed(1)} kn`, icon: Navigation, color: "text-primary" },
          { label: "Total Fuel", value: `${analytics.totalFuel.toFixed(0)} MT`, icon: Fuel, color: "text-warning" },
          { label: "Distance", value: `${analytics.totalDistance.toLocaleString()} NM`, icon: Globe, color: "text-info" },
          { label: "EEOI", value: analytics.eeoi.toFixed(2), icon: Award, color: analytics.eeoi < 15 ? "text-success" : "text-destructive" },
          { label: "CO₂", value: `${analytics.totalCO2.toFixed(0)} t`, icon: Wind, color: "text-muted-foreground" },
          { label: "Efficiency", value: `${analytics.fuelEfficiency.toFixed(3)} MT/NM`, icon: Gauge, color: "text-success" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
              <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="weather">Weather Impact</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="ranking">Vessel Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg">Speed vs Fuel Consumption Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Area type="monotone" dataKey="hfo" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.2} name="HFO (MT)" />
                  <Area type="monotone" dataKey="mdo" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.2} name="MDO (MT)" />
                  <Area type="monotone" dataKey="speed" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Speed (kn)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-success/30 bg-success/5">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2">☀️ Good Weather (BF &lt; 5)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm">Reports</span><span className="font-bold">{analytics.goodWeather.count}</span></div>
                <div className="flex justify-between"><span className="text-sm">Avg Speed</span><span className="font-bold">{analytics.goodWeather.avgSpeed.toFixed(1)} kn</span></div>
                <div className="flex justify-between"><span className="text-sm">Avg Fuel/Day</span><span className="font-bold">{analytics.goodWeather.avgFuel.toFixed(1)} MT</span></div>
                <Progress value={(analytics.goodWeather.count / analytics.totalReports) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">{((analytics.goodWeather.count / analytics.totalReports) * 100).toFixed(0)}% of reports</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2">🌊 Bad Weather (BF ≥ 5)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-sm">Reports</span><span className="font-bold">{analytics.badWeather.count}</span></div>
                <div className="flex justify-between"><span className="text-sm">Avg Speed</span><span className="font-bold">{analytics.badWeather.avgSpeed.toFixed(1)} kn</span></div>
                <div className="flex justify-between"><span className="text-sm">Avg Fuel/Day</span><span className="font-bold">{analytics.badWeather.avgFuel.toFixed(1)} MT</span></div>
                <Progress value={(analytics.badWeather.count / analytics.totalReports) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">{((analytics.badWeather.count / analytics.totalReports) * 100).toFixed(0)}% of reports</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="radar" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg">6-Dimension Performance Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={analytics.radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-warning" /> Vessel Efficiency Ranking</CardTitle></CardHeader>
            <CardContent>
              {analytics.vesselRanking.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados suficientes para ranking.</p>
              ) : (
                <div className="space-y-3">
                  {analytics.vesselRanking.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-warning/20 text-warning' : i === 1 ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground'}`}>
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.count} reports • {v.totalDist.toFixed(0)} NM</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{v.efficiency.toFixed(4)}</p>
                        <p className="text-[10px] text-muted-foreground">MT/NM</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
