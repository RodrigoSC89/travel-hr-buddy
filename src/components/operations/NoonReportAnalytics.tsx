/**
 * Noon Report Analytics - vs Cloud Fleet Manager / Vessel Insight
 * Performance analytics derived from noon reports with AI trend detection
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, Ship, Fuel, Navigation, Wind, Waves,
  TrendingUp, TrendingDown, Download, Clock, Gauge
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";

const fuelTrend = [
  { day: "Feb 01", hfo: 28.5, mdo: 3.2, speed: 12.1 },
  { day: "Feb 03", hfo: 27.8, mdo: 3.0, speed: 11.8 },
  { day: "Feb 05", hfo: 29.1, mdo: 3.5, speed: 12.4 },
  { day: "Feb 07", hfo: 26.2, mdo: 2.8, speed: 11.5 },
  { day: "Feb 09", hfo: 30.5, mdo: 3.8, speed: 13.0 },
  { day: "Feb 11", hfo: 28.0, mdo: 3.1, speed: 12.0 },
  { day: "Feb 13", hfo: 27.2, mdo: 2.9, speed: 11.7 },
  { day: "Feb 15", hfo: 29.8, mdo: 3.4, speed: 12.6 },
];

const performanceData = [
  { metric: "Speed (kts)", actual: 12.3, charter: 13.0, variance: -5.4 },
  { metric: "HFO (mt/d)", actual: 28.4, charter: 30.0, variance: -5.3 },
  { metric: "MDO (mt/d)", actual: 3.2, charter: 3.5, variance: -8.6 },
  { metric: "Slip (%)", actual: 4.2, charter: 5.0, variance: -16.0 },
  { metric: "Distance (nm/d)", actual: 295, charter: 312, variance: -5.4 },
];

export function NoonReportAnalytics() {
  const [tab, setTab] = useState("performance");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Noon Report Analytics
          </h1>
          <p className="text-muted-foreground">Vessel performance intelligence • vs Cloud Fleet Manager</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => quickExport(fuelTrend, "Noon Report Analytics")}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Avg Speed", value: "12.3 kts", icon: Navigation, trend: "-0.2" },
          { label: "Fuel/Day", value: "31.6 mt", icon: Fuel, trend: "-1.4" },
          { label: "BF Avg", value: "4.2", icon: Wind, trend: "+0.5" },
          { label: "Slip", value: "4.2%", icon: Gauge, trend: "-0.3" },
          { label: "Reports", value: "15", icon: Clock, trend: null },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50 bg-card/80">
            <CardContent className="p-3 text-center">
              <kpi.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
              {kpi.trend && (
                <div className="flex items-center justify-center gap-1 text-xs">
                  {parseFloat(kpi.trend) < 0 ? 
                    <TrendingDown className="h-3 w-3 text-success" /> : 
                    <TrendingUp className="h-3 w-3 text-warning" />
                  }
                  <span className={parseFloat(kpi.trend) < 0 ? "text-success" : "text-warning"}>{kpi.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Trends</TabsTrigger>
          <TabsTrigger value="cp_comparison">CP Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Speed vs Consumption</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="hfo" stackId="1" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.3} name="HFO (mt)" />
                  <Area type="monotone" dataKey="mdo" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} name="MDO (mt)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Daily Fuel Consumption</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="hfo" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="HFO (mt)" />
                  <Bar dataKey="mdo" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="MDO (mt)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cp_comparison" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Charter Party vs Actual</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.map((row) => (
                  <div key={row.metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <span className="text-sm font-medium w-32">{row.metric}</span>
                    <span className="text-sm">{row.actual}</span>
                    <span className="text-sm text-muted-foreground">{row.charter}</span>
                    <Badge variant="outline" className={row.variance < 0 ? "text-success border-success/30" : "text-destructive border-destructive/30"}>
                      {row.variance > 0 ? "+" : ""}{row.variance}%
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Negative variance on consumption = better than CP (saving). Positive = worse.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
