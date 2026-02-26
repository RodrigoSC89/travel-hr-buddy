/**
 * FuelConsumptionTrends - Fleet fuel consumption analytics
 * Real-time fuel efficiency monitoring with trends
 */
import { motion } from "framer-motion";
import { Fuel, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface NoonReportRow {
  id: string;
  report_date: string | null;
  fuel_consumed_mt: number | null;
  average_speed: number | null;
  vessel_id: string | null;
}

export function FuelConsumptionTrends() {
  const { data: noonReports } = useQuery({
    queryKey: ["fuel-trends-noon"],
    queryFn: async () => {
      const { data } = await fromUntyped("noon_reports")
        .select("id, report_date, fuel_consumed_mt, average_speed, vessel_id")
        .order("report_date", { ascending: false })
        .limit(30);
      return (data ?? []) as NoonReportRow[];
    },
    staleTime: 120000,
  });

  // Aggregate by date
  const dateMap = new Map<string, { total: number; count: number }>();
  (noonReports ?? []).forEach((r) => {
    const day = r.report_date?.split("T")[0] ?? "";
    if (!day) return;
    const existing = dateMap.get(day) ?? { total: 0, count: 0 };
    existing.total += Number(r.fuel_consumed_mt ?? 0);
    existing.count += 1;
    dateMap.set(day, existing);
  });

  const chartData = Array.from(dateMap.entries())
    .map(([date, { total, count }]) => ({
      date: date.slice(5),
      consumo: Math.round(total * 10) / 10,
      media: Math.round((total / count) * 10) / 10,
    }))
    .reverse()
    .slice(-14);

  const totalFuel = chartData.reduce((s, d) => s + d.consumo, 0);
  const avgDaily = chartData.length > 0 ? totalFuel / chartData.length : 0;
  const trend = chartData.length >= 2
    ? chartData[chartData.length - 1].consumo - chartData[chartData.length - 2].consumo
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Fuel className="h-4 w-4 text-warning" />
            Consumo de Combustível
            <Badge variant="outline" className="text-[10px] ml-auto">
              {chartData.length} dias
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Total (MT)</p>
              <p className="text-lg font-bold tabular-nums">{Math.round(totalFuel)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Média/dia</p>
              <p className="text-lg font-bold tabular-nums">{avgDaily.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Tendência</p>
              <div className="flex items-center gap-1">
                {trend <= 0 ? (
                  <TrendingDown className="h-4 w-4 text-success" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-bold ${trend <= 0 ? "text-success" : "text-destructive"}`}>
                  {trend > 0 ? "+" : ""}{trend.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumo"
                  stroke="hsl(var(--warning))"
                  fill="url(#fuelGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-xs text-muted-foreground">
              <BarChart3 className="h-5 w-5 mr-2" />
              Sem dados de noon reports
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
