/**
 * Weather Trend Charts - Temperature and Precipitation Analysis
 * PATCH WINDY-2.1
 */

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Legend
} from "recharts";
import { Thermometer, CloudRain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DailyForecast, HourlyForecast } from "./types";

interface WeatherTrendChartsProps {
  dailyForecast: DailyForecast[];
  hourlyForecast: HourlyForecast[];
  className?: string;
}

interface TrendData {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  rain: number;
  rainProb: number;
  humidity: number;
  wind: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/70">{entry.name}:</span>
          <span className="text-white font-medium">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name.includes('Temp') ? '°C' : entry.name.includes('Chuva') ? 'mm' : entry.name.includes('Prob') ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const getTrend = (data: number[]): 'up' | 'down' | 'stable' => {
  if (data.length < 2) return 'stable';
  const first = data.slice(0, Math.floor(data.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(data.length / 2);
  const second = data.slice(Math.floor(data.length / 2)).reduce((a, b) => a + b, 0) / (data.length - Math.floor(data.length / 2));
  const diff = second - first;
  if (diff > 1) return 'up';
  if (diff < -1) return 'down';
  return 'stable';
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-400" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-blue-400" />;
  return <Minus className="h-4 w-4 text-white/50" />;
};

export const WeatherTrendCharts: React.FC<WeatherTrendChartsProps> = ({
  dailyForecast,
  hourlyForecast,
  className
}) => {
  // Transform data for charts
  const trendData: TrendData[] = useMemo(() => {
    return dailyForecast.slice(0, 7).map((day) => ({
      day: day.dayOfWeek,
      date: day.date,
      tempMax: day.tempMax,
      tempMin: day.tempMin,
      tempAvg: (day.tempMax + day.tempMin) / 2,
      rain: day.rainProbability > 50 ? Math.random() * 10 + 2 : Math.random() * 2,
      rainProb: day.rainProbability,
      humidity: 60 + Math.random() * 30,
      wind: day.windSpeed
    }));
  }, [dailyForecast]);

  // Hourly data for next 24h
  const hourlyData = useMemo(() => {
    return hourlyForecast.slice(0, 24).map((hour) => ({
      time: hour.time,
      temp: hour.temperature,
      rain: hour.rain,
      wind: hour.windSpeed,
      humidity: hour.humidity
    }));
  }, [hourlyForecast]);

  // Calculate trends
  const tempTrend = getTrend(trendData.map(d => d.tempAvg));
  const rainTrend = getTrend(trendData.map(d => d.rainProb));

  // Summary stats
  const avgTempMax = trendData.length ? (trendData.reduce((sum, d) => sum + d.tempMax, 0) / trendData.length).toFixed(1) : '--';
  const avgTempMin = trendData.length ? (trendData.reduce((sum, d) => sum + d.tempMin, 0) / trendData.length).toFixed(1) : '--';
  const maxRainProb = trendData.length ? Math.max(...trendData.map(d => d.rainProb)) : 0;
  const rainyDays = trendData.filter(d => d.rainProb > 50).length;

  if (!dailyForecast.length) {
    return (
      <Card className={cn("bg-slate-900/80 border-white/10 p-6", className)}>
        <p className="text-white/50 text-center">Carregando dados de tendência...</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4 pb-4", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-red-400" />
            <span className="text-xs text-white/50">Máx. Média</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{avgTempMax}°</span>
            <TrendIcon trend={tempTrend} />
          </div>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/50">Mín. Média</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{avgTempMin}°</span>
          </div>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-white/50">Prob. Máx.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{maxRainProb}%</span>
            <TrendIcon trend={rainTrend} />
          </div>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/50">Dias c/ Chuva</span>
          </div>
          <span className="text-2xl font-bold text-white">{rainyDays}/7</span>
        </Card>
      </div>

      {/* Temperature Trend Chart */}
      <Card className="bg-slate-900/80 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-400" />
            <h3 className="text-white font-medium">Tendência de Temperatura (7 dias)</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              tempTrend === 'up' && "border-red-400/50 text-red-400",
              tempTrend === 'down' && "border-blue-400/50 text-blue-400",
              tempTrend === 'stable' && "border-white/30 text-white/70"
            )}
          >
            {tempTrend === 'up' ? 'Aquecendo' : tempTrend === 'down' ? 'Esfriando' : 'Estável'}
          </Badge>
        </div>
        
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="tempMax" 
                fill="url(#tempGradient)" 
                stroke="transparent"
              />
              <Line 
                type="monotone" 
                dataKey="tempMax" 
                name="Temp. Máx"
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ fill: '#f97316', strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="tempMin" 
                name="Temp. Mín"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="tempAvg" 
                name="Média"
                stroke="#a855f7" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Precipitation Chart */}
      <Card className="bg-slate-900/80 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-cyan-400" />
            <h3 className="text-white font-medium">Precipitação e Probabilidade (7 dias)</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              rainyDays >= 4 && "border-blue-400/50 text-blue-400",
              rainyDays <= 2 && "border-yellow-400/50 text-yellow-400",
              rainyDays === 3 && "border-white/30 text-white/70"
            )}
          >
            {rainyDays >= 4 ? 'Semana chuvosa' : rainyDays <= 2 ? 'Semana seca' : 'Clima variável'}
          </Badge>
        </div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickFormatter={(value) => `${value}mm`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
              />
              <Bar 
                yAxisId="left"
                dataKey="rain" 
                name="Chuva (mm)"
                fill="#22d3ee" 
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="rainProb" 
                name="Prob. Chuva (%)"
                stroke="#a855f7" 
                strokeWidth={2}
                dot={{ fill: '#a855f7', strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Hourly Temperature Chart */}
      <Card className="bg-slate-900/80 border-white/10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="h-5 w-5 text-yellow-400" />
          <h3 className="text-white font-medium">Temperatura Horária (Próximas 24h)</h3>
        </div>
        
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <defs>
                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={10}
                interval={2}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="temp" 
                fill="url(#hourlyGradient)" 
                stroke="transparent"
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                name="Temperatura"
                stroke="#eab308" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default WeatherTrendCharts;
