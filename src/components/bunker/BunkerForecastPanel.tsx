/**
 * BunkerForecastPanel Component
 * Displays 7-day AI-powered price forecasts with port comparison
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  MapPin, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useBunkerForecast, type PortForecast } from "@/hooks/useBunkerForecast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-destructive" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-success" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const ForecastCard = ({ forecast, isSelected, onSelect }: { 
  forecast: PortForecast; 
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const priceChange = forecast.forecast.length > 0 
    ? ((forecast.forecast[6]?.vlsfo - forecast.currentPrices.vlsfo) / forecast.currentPrices.vlsfo * 100)
    : 0;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md min-w-[280px] ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{forecast.port}</CardTitle>
          </div>
          <Badge 
            variant={forecast.trend === "down" ? "default" : forecast.trend === "up" ? "destructive" : "secondary"}
            className="gap-1"
          >
            <TrendIcon trend={forecast.trend} />
            {forecast.trend === "down" ? "Queda" : forecast.trend === "up" ? "Alta" : "Estável"}
          </Badge>
        </div>
        <CardDescription>{forecast.country}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">VLSFO</p>
            <p className="font-bold">${forecast.currentPrices.vlsfo}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">MGO</p>
            <p className="font-bold">${forecast.currentPrices.mgo}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="text-xs text-muted-foreground">HFO</p>
            <p className="font-bold">${forecast.currentPrices.hfo}</p>
          </div>
        </div>

        <div className={`text-sm p-2 rounded flex items-center gap-2 ${
          forecast.trend === "down" 
            ? "bg-success/10 text-success"
            : forecast.trend === "up"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
        }`}>
          <Sparkles className="h-3 w-3" />
          <span>
            Previsão 7d: {priceChange > 0 ? "+" : ""}{priceChange.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const ForecastChart = ({ forecast }: { forecast: PortForecast }) => {
  const chartData = [
    { 
      date: "Hoje", 
      vlsfo: forecast.currentPrices.vlsfo,
      mgo: forecast.currentPrices.mgo,
      hfo: forecast.currentPrices.hfo,
    },
    ...forecast.forecast.map(f => ({
      date: format(new Date(f.date), "dd/MM"),
      vlsfo: f.vlsfo,
      mgo: f.mgo,
      hfo: f.hfo,
      confidence: f.confidence,
    }))
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="vlsfoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis 
          tickFormatter={(v) => `$${v}`}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--background))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px"
          }}
          formatter={(value: number) => [`$${value}/MT`, ""]}
        />
        <Area
          type="monotone"
          dataKey="vlsfo"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#vlsfoGradient)"
          name="VLSFO"
        />
        <Line 
          type="monotone" 
          dataKey="mgo" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
          name="MGO"
        />
        <Line 
          type="monotone" 
          dataKey="hfo" 
          stroke="hsl(var(--chart-3))" 
          strokeWidth={1.5}
          strokeDasharray="3 3"
          dot={false}
          name="HFO"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export function BunkerForecastPanel() {
  const { forecasts, isLoading, refetch, isRefetching, generatedAt, getBestOpportunity } = useBunkerForecast();
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  const selectedForecast = forecasts.find(f => f.port === selectedPort) || forecasts[0];
  const bestOpportunity = getBestOpportunity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Best Opportunity */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Previsão de Preços com IA</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Próximos 7 dias • Atualizado: {generatedAt ? format(new Date(generatedAt), "HH:mm", { locale: ptBR }) : "--:--"}
          </CardDescription>
        </CardHeader>
        
        {bestOpportunity && (
          <CardContent className="pt-0">
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-success">
                  Melhor Oportunidade: {bestOpportunity.port}
                </p>
                <p className="text-sm text-success/80">
                  VLSFO a ${bestOpportunity.currentPrices.vlsfo}/MT • {bestOpportunity.recommendation}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Port Comparison Scroll */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Comparativo de Portos
        </h3>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {forecasts.map((forecast) => (
              <ForecastCard
                key={forecast.port}
                forecast={forecast}
                isSelected={selectedPort === forecast.port || (!selectedPort && forecast === forecasts[0])}
                onSelect={() => setSelectedPort(forecast.port)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Selected Port Forecast */}
      {selectedForecast && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Previsão: {selectedForecast.port}
                </CardTitle>
                <CardDescription>{selectedForecast.country}</CardDescription>
              </div>
              <Badge 
                variant={selectedForecast.trend === "down" ? "default" : selectedForecast.trend === "up" ? "destructive" : "secondary"}
              >
                <TrendIcon trend={selectedForecast.trend} />
                <span className="ml-1">
                  {selectedForecast.trend === "down" ? "Tendência de Queda" : 
                   selectedForecast.trend === "up" ? "Tendência de Alta" : "Estável"}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ForecastChart forecast={selectedForecast} />

            {/* Analysis & Recommendation */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Análise IA
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedForecast.analysis}
                </p>
              </div>
              
              <div className={`p-4 rounded-lg ${
                selectedForecast.trend === "down" 
                  ? "bg-success/10 border border-success/20" 
                  : selectedForecast.trend === "up"
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-muted/50"
              }`}>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  {selectedForecast.trend === "down" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : selectedForecast.trend === "up" ? (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  Recomendação
                </h4>
                <p className="text-sm">
                  {selectedForecast.recommendation}
                </p>
              </div>
            </div>

            {/* 7-Day Forecast Table */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preços Projetados (USD/MT)
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                <div className="text-center p-2 bg-primary/10 rounded">
                  <p className="text-xs text-muted-foreground">Hoje</p>
                  <p className="font-bold">${selectedForecast.currentPrices.vlsfo}</p>
                </div>
                {selectedForecast.forecast.map((f, i) => (
                  <div key={f.date} className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(f.date), "dd/MM")}
                    </p>
                    <p className="font-bold">${f.vlsfo}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(f.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BunkerForecastPanel;
