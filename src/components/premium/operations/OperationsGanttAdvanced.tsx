/**
 * OPERATIONS GANTT ADVANCED
 * Gantt interativo com dados reais do Supabase
 */

import React, { useState, useMemo } from "react";
import { useVoyageEvents, useWeatherOverlay, type VoyageEvent, type WeatherOverlay } from "@/hooks/useOperationsGanttData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Ship, Anchor, Map, Calendar, Clock, Navigation, Fuel,
  Cloud, Wind, Waves, Thermometer, AlertTriangle, CheckCircle2,
  TrendingUp, DollarSign, Target, Zap, RefreshCw, Download,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays, isWithinInterval, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Type colors
const typeColors = {
  voyage: "bg-primary",
  port_call: "bg-blue-500",
  maintenance: "bg-warning",
  drydock: "bg-purple-500",
};

const statusColors = {
  scheduled: "border-muted-foreground/50",
  in_progress: "border-success ring-2 ring-success/20",
  completed: "border-muted",
  delayed: "border-destructive ring-2 ring-destructive/20",
};

const weatherRiskColors = {
  low: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  high: "bg-destructive/20 text-destructive",
};

export function OperationsGanttAdvanced() {
  const { data: voyagesData = [] } = useVoyageEvents();
  const { data: weatherData = [] } = useWeatherOverlay();
  const voyages = voyagesData;
  const weather = weatherData;
  const [viewMode, setViewMode] = useState<"week" | "month" | "quarter">("month");
  const [showWeather, setShowWeather] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  
  const today = startOfDay(new Date());
  
  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const days = viewMode === "week" ? 14 : viewMode === "month" ? 30 : 90;
    return {
      start: addDays(today, -7),
      end: addDays(today, days),
      days: days + 7,
    };
  }, [viewMode, today]);

  // Generate dates array
  const dates = useMemo(() => {
    return Array.from({ length: dateRange.days }).map((_, i) => addDays(dateRange.start, i));
  }, [dateRange]);

  // Get unique vessels
  const vessels = useMemo(() => {
    const unique = [...new Set(voyages.map(v => v.vesselName))];
    return unique.sort();
  }, [voyages]);

  // Filter voyages
  const filteredVoyages = useMemo(() => {
    return voyages.filter(v => 
      selectedVessel === "all" || v.vesselName === selectedVessel
    );
  }, [voyages, selectedVessel]);

  // Group voyages by vessel
  const voyagesByVessel = useMemo(() => {
    const grouped: Record<string, VoyageEvent[]> = {};
    filteredVoyages.forEach(v => {
      if (!grouped[v.vesselName]) grouped[v.vesselName] = [];
      grouped[v.vesselName].push(v);
    });
    return grouped;
  }, [filteredVoyages]);

  // Calculate bar position and width
  const getBarStyle = (event: VoyageEvent) => {
    const startOffset = Math.max(0, differenceInDays(event.startDate, dateRange.start));
    const endOffset = Math.min(dateRange.days, differenceInDays(event.endDate, dateRange.start));
    const width = Math.max(1, endOffset - startOffset);
    
    return {
      left: `${(startOffset / dateRange.days) * 100}%`,
      width: `${(width / dateRange.days) * 100}%`,
    };
  };

  // Check if date has weather alert
  const getWeatherForDate = (date: Date) => {
    return weather.find(w => 
      format(w.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  // KPIs
  const kpis = useMemo(() => ({
    activeVoyages: voyages.filter(v => v.status === "in_progress").length,
    scheduledVoyages: voyages.filter(v => v.status === "scheduled" && v.type === "voyage").length,
    totalRevenue: voyages.filter(v => v.revenue).reduce((acc, v) => acc + (v.revenue || 0), 0),
    avgFuelConsumption: Math.round(voyages.filter(v => v.fuelConsumption).reduce((acc, v, _, arr) => acc + (v.fuelConsumption || 0) / arr.length, 0)),
    weatherAlerts: weather.filter(w => w.risk === "high").length,
  }), [voyages, weather]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary opacity-70" />
            <div>
              <p className="text-2xl font-bold">{kpis.activeVoyages}</p>
              <p className="text-xs text-muted-foreground">Viagens Ativas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500 opacity-70" />
            <div>
              <p className="text-2xl font-bold">{kpis.scheduledVoyages}</p>
              <p className="text-xs text-muted-foreground">Programadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-success opacity-70" />
            <div>
              <p className="text-2xl font-bold">${(kpis.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Receita Esperada</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Fuel className="h-8 w-8 text-warning opacity-70" />
            <div>
              <p className="text-2xl font-bold">{kpis.avgFuelConsumption}</p>
              <p className="text-xs text-muted-foreground">MT/dia Médio</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn(kpis.weatherAlerts > 0 && "border-destructive/50")}>
          <CardContent className="p-4 flex items-center gap-3">
            <Cloud className={cn("h-8 w-8 opacity-70", kpis.weatherAlerts > 0 ? "text-destructive" : "text-muted-foreground")} />
            <div>
              <p className="text-2xl font-bold">{kpis.weatherAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertas Meteo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Gantt de Operações
              </CardTitle>
              <CardDescription>
                Visualização interativa de viagens, escalas e manutenções
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger className="w-48">
                  <Ship className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Embarcações</SelectItem>
                  {vessels.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={viewMode} onValueChange={(v: "week" | "month" | "quarter") => setViewMode(v)}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">2 Semanas</SelectItem>
                  <SelectItem value="month">1 Mês</SelectItem>
                  <SelectItem value="quarter">3 Meses</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant={showWeather ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setShowWeather(!showWeather)}
              >
                <Cloud className="h-4 w-4 mr-1" />
                Clima
              </Button>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[1200px]">
              {/* Header with dates */}
              <div className="flex border-b">
                <div className="w-48 flex-shrink-0 p-2 font-medium text-sm border-r bg-muted/50">
                  Embarcação
                </div>
                <div className="flex-1 flex">
                  {dates.map((date, idx) => {
                    const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                    const weatherInfo = showWeather ? getWeatherForDate(date) : null;
                    
                    return (
                      <TooltipProvider key={`date-${format(date, "yyyy-MM-dd")}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "flex-1 p-1 text-center text-xs border-r last:border-r-0 relative",
                                isToday && "bg-primary/10",
                                weatherInfo?.risk === "high" && showWeather && "bg-destructive/10"
                              )}
                            >
                              <p className="font-medium">{format(date, "EEE", { locale: ptBR })}</p>
                              <p className={cn("text-muted-foreground", isToday && "font-bold text-primary")}>
                                {format(date, "dd/MM")}
                              </p>
                              {weatherInfo && showWeather && (
                                <div className="absolute bottom-0 left-0 right-0 h-1">
                                  <div className={cn(
                                    "h-full",
                                    weatherInfo.risk === "high" && "bg-destructive",
                                    weatherInfo.risk === "medium" && "bg-warning",
                                    weatherInfo.risk === "low" && "bg-success",
                                  )} />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          {weatherInfo && (
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-bold flex items-center gap-2">
                                  <Cloud className="h-4 w-4" />
                                  {weatherInfo.region}
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Wind className="h-3 w-3" />
                                    {weatherInfo.windSpeed} nós
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Waves className="h-3 w-3" />
                                    {weatherInfo.waveHeight}m
                                  </span>
                                </div>
                                <Badge className={weatherRiskColors[weatherInfo.risk]}>
                                  Risco: {weatherInfo.risk}
                                </Badge>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
              
              {/* Vessel rows */}
              {Object.entries(voyagesByVessel).map(([vesselName, events]) => (
                <div key={vesselName} className="flex border-b hover:bg-muted/30 transition-colors">
                  <div className="w-48 flex-shrink-0 p-2 text-sm border-r bg-muted/20 flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" />
                    <span className="font-medium truncate">{vesselName}</span>
                  </div>
                  <div className="flex-1 relative h-16">
                    {/* Today line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                      style={{
                        left: `${(differenceInDays(today, dateRange.start) / dateRange.days) * 100}%`,
                      }}
                    />
                    
                    {/* Events */}
                    {events.map((event) => {
                      const style = getBarStyle(event);
                      return (
                        <TooltipProvider key={event.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute top-2 bottom-2 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-offset-1",
                                  typeColors[event.type],
                                  statusColors[event.status],
                                  "flex items-center px-2 text-xs text-white font-medium truncate"
                                )}
                                style={style}
                              >
                                {event.title}
                                {event.weatherRisk === "high" && (
                                  <AlertTriangle className="h-3 w-3 ml-1 flex-shrink-0" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <div className="space-y-2">
                                <p className="font-bold">{event.title}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span>Início: {format(event.startDate, "dd/MM/yyyy")}</span>
                                  <span>Fim: {format(event.endDate, "dd/MM/yyyy")}</span>
                                  {event.origin && <span>Origem: {event.origin}</span>}
                                  {event.destination && <span>Destino: {event.destination}</span>}
                                  {event.cargo && <span>Carga: {event.cargo}</span>}
                                  {event.revenue && <span>Receita: ${event.revenue.toLocaleString()}</span>}
                                </div>
                                {event.weatherRisk && (
                                  <Badge className={weatherRiskColors[event.weatherRisk]}>
                                    Risco Meteorológico: {event.weatherRisk}
                                  </Badge>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          
          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="font-medium">Legenda:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Viagem</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>Port Call</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span>Manutenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span>Drydock</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-0.5 h-4 bg-primary" />
              <span>Hoje</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OperationsGanttAdvanced;
