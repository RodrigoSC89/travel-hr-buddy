/**
 * Historical Weather Chart Component
 * Displays weather metrics with Chart.js
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { CalendarDays, TrendingUp, Wind, Thermometer, Droplets } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalWeatherChartProps {
  location?: string;
}

type MetricType = "temperature" | "wind" | "humidity" | "pressure";
type PeriodType = "7d" | "30d" | "90d";

// Placeholder for weather data - will be loaded from API/Supabase
// Returns empty array when no real data is available
const getHistoricalData = (_days: number, _metric: MetricType): { date: string; value: number; min: number; max: number }[] => {
  // In production, this would fetch from weather_historical table or external API
  // For now, return empty to indicate no mock data
  return [];
};

const metricConfig: Record<MetricType, { label: string; unit: string; color: string; icon: React.ElementType }> = {
  temperature: { label: "Temperatura", unit: "°C", color: "rgb(239, 68, 68)", icon: Thermometer },
  wind: { label: "Velocidade do Vento", unit: "nós", color: "rgb(59, 130, 246)", icon: Wind },
  humidity: { label: "Umidade", unit: "%", color: "rgb(34, 197, 94)", icon: Droplets },
  pressure: { label: "Pressão Atmosférica", unit: "hPa", color: "rgb(168, 85, 247)", icon: TrendingUp },
};

export const HistoricalWeatherChart: React.FC<HistoricalWeatherChartProps> = ({ 
  location = "Santos, BR" 
}) => {
  const [metric, setMetric] = useState<MetricType>("temperature");
  const [period, setPeriod] = useState<PeriodType>("7d");

  const periodDays: Record<PeriodType, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const historicalData = useMemo(() => {
    return getHistoricalData(periodDays[period], metric);
  }, [metric, period]);

  const config = metricConfig[metric];

  const chartData = {
    labels: historicalData.map(d => {
      const date = new Date(d.date);
      return period === "7d" 
        ? date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })
        : date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    }),
    datasets: [
      {
        label: config.label,
        data: historicalData.map(d => d.value),
        borderColor: config.color,
        backgroundColor: `${config.color.replace("rgb", "rgba").replace(")", ", 0.1)")}`,
        fill: true,
        tension: 0.4,
        pointRadius: period === "7d" ? 4 : 2,
        pointHoverRadius: 6,
      },
      {
        label: "Máxima",
        data: historicalData.map(d => d.max),
        borderColor: `${config.color.replace("rgb", "rgba").replace(")", ", 0.5)")}`,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Mínima",
        data: historicalData.map(d => d.min),
        borderColor: `${config.color.replace("rgb", "rgba").replace(")", ", 0.5)")}`,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label || "Value"}: ${value} ${config.unit}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: config.unit,
        },
      },
    },
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const values = historicalData.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[values.length - 1] - values[0];
    
    return { avg, max, min, trend };
  }, [historicalData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Dados Históricos
            </CardTitle>
            <CardDescription>
              Análise de condições passadas em {location}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Select value={metric} onValueChange={(v) => setMetric(v as MetricType)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <cfg.icon className="h-4 w-4" />
                      {cfg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg overflow-hidden">
              {(["7d", "30d", "90d"] as PeriodType[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="rounded-none"
                >
                  {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Média</p>
              <p className="text-2xl font-bold">{stats.avg.toFixed(1)} {config.unit}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Máxima</p>
              <p className="text-2xl font-bold text-red-500">{stats.max.toFixed(1)} {config.unit}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Mínima</p>
              <p className="text-2xl font-bold text-blue-500">{stats.min.toFixed(1)} {config.unit}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Tendência</p>
              <p className={`text-2xl font-bold ${stats.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stats.trend >= 0 ? "+" : ""}{stats.trend.toFixed(1)} {config.unit}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="h-[350px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
};
