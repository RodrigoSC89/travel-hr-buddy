/**
 * Historical Weather Chart Component
 * Displays weather metrics with Recharts
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarDays, TrendingUp, Wind, Thermometer, Droplets } from "lucide-react";

interface HistoricalWeatherChartProps {
  location?: string;
}

type MetricType = "temperature" | "wind" | "humidity" | "pressure";
type PeriodType = "7d" | "30d" | "90d";

const getHistoricalData = (_days: number, _metric: MetricType): { date: string; value: number; min: number; max: number }[] => {
  return [];
};

const metricConfig: Record<MetricType, { label: string; unit: string; color: string; icon: React.ElementType }> = {
  temperature: { label: "Temperatura", unit: "°C", color: "#ef4444", icon: Thermometer },
  wind: { label: "Velocidade do Vento", unit: "nós", color: "#3b82f6", icon: Wind },
  humidity: { label: "Umidade", unit: "%", color: "#22c55e", icon: Droplets },
  pressure: { label: "Pressão Atmosférica", unit: "hPa", color: "#a855f7", icon: TrendingUp },
};

export const HistoricalWeatherChart: React.FC<HistoricalWeatherChartProps> = ({ location = "Santos, BR" }) => {
  const [metric, setMetric] = useState<MetricType>("temperature");
  const [period, setPeriod] = useState<PeriodType>("7d");
  const periodDays: Record<PeriodType, number> = { "7d": 7, "30d": 30, "90d": 90 };

  const historicalData = useMemo(() => getHistoricalData(periodDays[period], metric), [metric, period]);
  const config = metricConfig[metric];

  const chartData = historicalData.map(d => ({
    name: period === "7d" 
      ? new Date(d.date).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })
      : new Date(d.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    value: d.value,
    max: d.max,
    min: d.min,
  }));

  const stats = useMemo(() => {
    const values = historicalData.map(d => d.value);
    if (values.length === 0) return { avg: 0, max: 0, min: 0, trend: 0 };
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      trend: values[values.length - 1] - values[0],
    };
  }, [historicalData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Dados Históricos</CardTitle>
            <CardDescription>Análise de condições passadas em {location}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(metricConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}><div className="flex items-center gap-2"><cfg.icon className="h-4 w-4" />{cfg.label}</div></SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              {(["7d", "30d", "90d"] as PeriodType[]).map((p) => (
                <Button key={p} variant={period === p ? "default" : "ghost"} size="sm" onClick={() => setPeriod(p)} className="rounded-none">
                  {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-muted/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Média</p><p className="text-2xl font-bold">{stats.avg.toFixed(1)} {config.unit}</p></CardContent></Card>
          <Card className="bg-muted/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Máxima</p><p className="text-2xl font-bold text-red-500">{stats.max.toFixed(1)} {config.unit}</p></CardContent></Card>
          <Card className="bg-muted/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Mínima</p><p className="text-2xl font-bold text-blue-500">{stats.min.toFixed(1)} {config.unit}</p></CardContent></Card>
          <Card className="bg-muted/50"><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Tendência</p><p className={`text-2xl font-bold ${stats.trend >= 0 ? "text-green-500" : "text-red-500"}`}>{stats.trend >= 0 ? "+" : ""}{stats.trend.toFixed(1)} {config.unit}</p></CardContent></Card>
        </div>
        <div className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit={` ${config.unit}`} />
                <Tooltip formatter={(value: number) => `${value} ${config.unit}`} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={config.color} name={config.label} strokeWidth={2} dot={{ r: period === "7d" ? 4 : 2 }} />
                <Line type="monotone" dataKey="max" stroke={config.color} strokeDasharray="5 5" name="Máxima" dot={false} strokeOpacity={0.5} />
                <Line type="monotone" dataKey="min" stroke={config.color} strokeDasharray="5 5" name="Mínima" dot={false} strokeOpacity={0.5} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Dados históricos indisponíveis. Aguardando integração com API de clima.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};