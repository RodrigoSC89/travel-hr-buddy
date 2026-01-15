/**
 * Alert History Timeline Component
 * Visual timeline showing when alerts were triggered and associated weather conditions
 * PATCH WINDY-2.2
 */

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertTriangle, Bell, Wind, Waves, Thermometer, CloudRain,
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Filter, Download, Clock, MapPin, TrendingUp, Eye
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeatherAlert {
  id: string;
  type: 'wind' | 'wave' | 'temperature' | 'rain' | 'visibility' | 'storm';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  city: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  conditions: {
    windSpeed?: number;
    waveHeight?: number;
    temperature?: number;
    rainProbability?: number;
    visibility?: number;
  };
  threshold: {
    type: string;
    value: number;
    actual: number;
  };
  acknowledged: boolean;
}

interface AlertHistoryTimelineProps {
  className?: string;
}

const STORAGE_KEY = 'weather_alert_history';

const ALERT_ICONS = {
  wind: Wind,
  wave: Waves,
  temperature: Thermometer,
  rain: CloudRain,
  visibility: Eye,
  storm: AlertTriangle,
};

const SEVERITY_COLORS = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

// Generate mock historical data for demonstration
function generateMockHistory(): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const cities = ['Santos, SP', 'Rio de Janeiro, RJ', 'Macaé, RJ', 'Vitória, ES', 'Salvador, BA'];
  const types: WeatherAlert['type'][] = ['wind', 'wave', 'temperature', 'rain', 'visibility', 'storm'];
  const severities: WeatherAlert['severity'][] = ['info', 'warning', 'critical'];
  
  // Generate alerts for the last 30 days
  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const triggeredAt = new Date();
    triggeredAt.setDate(triggeredAt.getDate() - daysAgo);
    triggeredAt.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);
    
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    const conditions: WeatherAlert['conditions'] = {};
    let threshold = { type: '', value: 0, actual: 0 };
    
    switch (type) {
      case 'wind':
        conditions.windSpeed = 25 + Math.floor(Math.random() * 30);
        threshold = { type: 'Vento', value: 30, actual: conditions.windSpeed };
        break;
      case 'wave':
        conditions.waveHeight = 2 + Math.random() * 3;
        threshold = { type: 'Ondas', value: 2.5, actual: conditions.waveHeight };
        break;
      case 'temperature':
        conditions.temperature = severity === 'critical' ? 38 + Math.random() * 4 : 8 - Math.random() * 5;
        threshold = { type: 'Temperatura', value: conditions.temperature > 30 ? 35 : 10, actual: conditions.temperature };
        break;
      case 'rain':
        conditions.rainProbability = 70 + Math.floor(Math.random() * 30);
        threshold = { type: 'Chuva', value: 80, actual: conditions.rainProbability };
        break;
      case 'visibility':
        conditions.visibility = 1 + Math.random() * 3;
        threshold = { type: 'Visibilidade', value: 3, actual: conditions.visibility };
        break;
      case 'storm':
        conditions.windSpeed = 50 + Math.floor(Math.random() * 30);
        conditions.rainProbability = 90 + Math.floor(Math.random() * 10);
        threshold = { type: 'Tempestade', value: 50, actual: conditions.windSpeed };
        break;
    }
    
    alerts.push({
      id: `alert-${i}-${Date.now()}`,
      type,
      severity,
      title: getAlertTitle(type, severity),
      description: getAlertDescription(type, conditions),
      city,
      triggeredAt,
      resolvedAt: Math.random() > 0.3 ? new Date(triggeredAt.getTime() + Math.random() * 6 * 60 * 60 * 1000) : undefined,
      conditions,
      threshold,
      acknowledged: Math.random() > 0.2,
    });
  }
  
  return alerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
}

function getAlertTitle(type: WeatherAlert['type'], severity: WeatherAlert['severity']): string {
  const titles: Record<WeatherAlert['type'], string> = {
    wind: 'Alerta de Vento Forte',
    wave: 'Alerta de Ondas Altas',
    temperature: 'Alerta de Temperatura',
    rain: 'Alerta de Chuva Intensa',
    visibility: 'Alerta de Baixa Visibilidade',
    storm: 'Alerta de Tempestade',
  };
  return `${severity === 'critical' ? '⚠️ ' : ''}${titles[type]}`;
}

function getAlertDescription(type: WeatherAlert['type'], conditions: WeatherAlert['conditions']): string {
  switch (type) {
    case 'wind':
      return `Vento atingindo ${conditions.windSpeed} km/h. Condições adversas para navegação.`;
    case 'wave':
      return `Ondas de ${conditions.waveHeight?.toFixed(1)}m detectadas. Risco para embarcações menores.`;
    case 'temperature':
      return `Temperatura ${conditions.temperature && conditions.temperature > 30 ? 'extremamente alta' : 'muito baixa'}: ${conditions.temperature?.toFixed(1)}°C.`;
    case 'rain':
      return `Probabilidade de chuva: ${conditions.rainProbability}%. Prepare-se para precipitação.`;
    case 'visibility':
      return `Visibilidade reduzida: ${conditions.visibility?.toFixed(1)} km. Navegação com cautela.`;
    case 'storm':
      return `Tempestade detectada com ventos de ${conditions.windSpeed} km/h e ${conditions.rainProbability}% de chuva.`;
    default:
      return 'Condições meteorológicas adversas detectadas.';
  }
}

export const AlertHistoryTimeline: React.FC<AlertHistoryTimelineProps> = ({
  className
}) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<WeatherAlert['type'] | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<WeatherAlert['severity'] | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts from localStorage or generate mock data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          triggeredAt: new Date(a.triggeredAt),
          resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : undefined,
        })));
      } else {
        const mockData = generateMockHistory();
        setAlerts(mockData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
      }
    } catch (e) {
      console.error('Failed to load alert history:', e);
      setAlerts(generateMockHistory());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filterType !== 'all' && alert.type !== filterType) return false;
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      return true;
    });
  }, [alerts, filterType, filterSeverity]);

  // Alerts for selected date
  const alertsOnDate = useMemo(() => {
    return filteredAlerts.filter(alert => isSameDay(alert.triggeredAt, selectedDate));
  }, [filteredAlerts, selectedDate]);

  // Get dates with alerts for calendar highlighting
  const datesWithAlerts = useMemo(() => {
    const dates = new Map<string, { count: number; maxSeverity: WeatherAlert['severity'] }>();
    filteredAlerts.forEach(alert => {
      const key = format(alert.triggeredAt, 'yyyy-MM-dd');
      const existing = dates.get(key);
      if (!existing) {
        dates.set(key, { count: 1, maxSeverity: alert.severity });
      } else {
        dates.set(key, {
          count: existing.count + 1,
          maxSeverity: alert.severity === 'critical' ? 'critical' : 
                       (existing.maxSeverity === 'critical' ? 'critical' : 
                        (alert.severity === 'warning' ? 'warning' : existing.maxSeverity))
        });
      }
    });
    return dates;
  }, [filteredAlerts]);

  // Statistics
  const stats = useMemo(() => {
    const last7Days = filteredAlerts.filter(a => 
      a.triggeredAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const last30Days = filteredAlerts.filter(a => 
      a.triggeredAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return {
      total: filteredAlerts.length,
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      unacknowledged: filteredAlerts.filter(a => !a.acknowledged).length,
    };
  }, [filteredAlerts]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const exportHistory = () => {
    const csv = [
      'Data,Hora,Cidade,Tipo,Severidade,Título,Descrição,Condição,Limite,Valor Real',
      ...filteredAlerts.map(a => [
        format(a.triggeredAt, 'dd/MM/yyyy'),
        format(a.triggeredAt, 'HH:mm'),
        a.city,
        a.type,
        a.severity,
        a.title,
        a.description.replace(/,/g, ';'),
        a.threshold.type,
        a.threshold.value,
        a.threshold.actual.toFixed(1),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_alertas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-slate-900/80 border-white/10 p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-white/50">Carregando histórico...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4 min-h-[600px]", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-white/50">Total</span>
          </div>
          <span className="text-2xl font-bold text-white">{stats.total}</span>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-xs text-white/50">7 dias</span>
          </div>
          <span className="text-2xl font-bold text-white">{stats.last7Days}</span>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-white/50">30 dias</span>
          </div>
          <span className="text-2xl font-bold text-white">{stats.last30Days}</span>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-xs text-white/50">Críticos</span>
          </div>
          <span className="text-2xl font-bold text-red-400">{stats.critical}</span>
        </Card>
        
        <Card className="bg-slate-800/70 border-white/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-white/50">Pendentes</span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{stats.unacknowledged}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="bg-slate-900/80 border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendário
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-white/70 text-sm min-w-[100px] text-center">
                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={selectedDate}
            className="bg-transparent"
            modifiers={{
              hasAlerts: (date) => datesWithAlerts.has(format(date, 'yyyy-MM-dd')),
            }}
            modifiersStyles={{
              hasAlerts: {
                fontWeight: 'bold',
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const key = format(date, 'yyyy-MM-dd');
                const alertInfo = datesWithAlerts.get(key);
                return (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <span>{date.getDate()}</span>
                    {alertInfo && (
                      <div className={cn(
                        "absolute -bottom-1 w-1.5 h-1.5 rounded-full",
                        alertInfo.maxSeverity === 'critical' && "bg-red-500",
                        alertInfo.maxSeverity === 'warning' && "bg-yellow-500",
                        alertInfo.maxSeverity === 'info' && "bg-blue-500"
                      )} />
                    )}
                  </div>
                );
              }
            }}
          />

          {/* Filters */}
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/50" />
              <span className="text-xs text-white/50">Filtros</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(['all', 'wind', 'wave', 'temperature', 'rain', 'visibility', 'storm'] as const).map(type => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "cursor-pointer text-xs",
                    filterType === type 
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "text-white/50 border-white/20 hover:bg-white/5"
                  )}
                  onClick={() => setFilterType(type)}
                >
                  {type === 'all' ? 'Todos' : type}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(['all', 'info', 'warning', 'critical'] as const).map(sev => (
                <Badge
                  key={sev}
                  variant="outline"
                  className={cn(
                    "cursor-pointer text-xs",
                    filterSeverity === sev
                      ? sev === 'all' 
                        ? "bg-primary/20 text-primary border-primary/50"
                        : SEVERITY_COLORS[sev]
                      : "text-white/50 border-white/20 hover:bg-white/5"
                  )}
                  onClick={() => setFilterSeverity(sev)}
                >
                  {sev === 'all' ? 'Todas' : sev}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="bg-slate-900/80 border-white/10 p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              Alertas - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              <Badge variant="outline" className="text-xs text-white/70 border-white/20">
                {alertsOnDate.length} {alertsOnDate.length === 1 ? 'alerta' : 'alertas'}
              </Badge>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={exportHistory}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            {alertsOnDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-white/20 mb-4" />
                <p className="text-white/50">Nenhum alerta nesta data</p>
                <p className="text-white/30 text-sm">Selecione outra data no calendário</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {alertsOnDate.map(alert => {
                  const Icon = ALERT_ICONS[alert.type];
                  return (
                    <Card
                      key={alert.id}
                      className={cn(
                        "border-l-4 bg-slate-800/50",
                        alert.severity === 'critical' && "border-l-red-500",
                        alert.severity === 'warning' && "border-l-yellow-500",
                        alert.severity === 'info' && "border-l-blue-500"
                      )}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className={cn(
                              "h-5 w-5",
                              alert.severity === 'critical' && "text-red-400",
                              alert.severity === 'warning' && "text-yellow-400",
                              alert.severity === 'info' && "text-blue-400"
                            )} />
                            <div>
                              <p className="text-white font-medium text-sm">{alert.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="h-3 w-3 text-white/40" />
                                <span className="text-xs text-white/50">{alert.city}</span>
                                <span className="text-xs text-white/30">•</span>
                                <Clock className="h-3 w-3 text-white/40" />
                                <span className="text-xs text-white/50">
                                  {format(alert.triggeredAt, 'HH:mm')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", SEVERITY_COLORS[alert.severity])}
                            >
                              {alert.severity}
                            </Badge>
                            {alert.resolvedAt && (
                              <span className="text-xs text-green-400">
                                Resolvido {format(alert.resolvedAt, 'HH:mm')}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-white/70 mt-2">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <span className="text-white/30">Limite:</span>
                            {alert.threshold.value} {alert.threshold.type === 'Temperatura' ? '°C' : alert.threshold.type === 'Ondas' ? 'm' : alert.threshold.type === 'Visibilidade' ? 'km' : alert.threshold.type === 'Chuva' ? '%' : 'km/h'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-white/30">Real:</span>
                            <span className={cn(
                              alert.severity === 'critical' && "text-red-400",
                              alert.severity === 'warning' && "text-yellow-400"
                            )}>
                              {alert.threshold.actual.toFixed(1)} {alert.threshold.type === 'Temperatura' ? '°C' : alert.threshold.type === 'Ondas' ? 'm' : alert.threshold.type === 'Visibilidade' ? 'km' : alert.threshold.type === 'Chuva' ? '%' : 'km/h'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default AlertHistoryTimeline;
