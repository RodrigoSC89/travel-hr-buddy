/**
 * Alert History Timeline Component
 * Visual timeline showing when alerts were triggered
 * REFACTORED: Uses useWeatherAlerts hook for real data
 */

import React, { useState, useMemo } from "react";
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
  Filter, Download, Clock, MapPin, TrendingUp, Eye, Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWeatherAlerts, useWeatherAlertHistory, type WeatherAlert } from "@/hooks/useWeatherAlerts";

interface AlertHistoryTimelineProps {
  className?: string;
}

const ALERT_ICONS: Record<string, React.ElementType> = {
  wind: Wind,
  wave: Waves,
  temperature: Thermometer,
  rain: CloudRain,
  visibility: Eye,
  storm: AlertTriangle,
  general: Bell,
};

const SEVERITY_COLORS = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export const AlertHistoryTimeline: React.FC<AlertHistoryTimelineProps> = ({
  className
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const { alerts, stats, isLoading, error, acknowledgeAlert } = useWeatherAlerts({ limit: 100 });
  const { data: historyData } = useWeatherAlertHistory({ days: 30 });

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesType = filterType === 'all' || alert.alert_type === filterType;
      const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
      return matchesType && matchesSeverity;
    });
  }, [alerts, filterType, filterSeverity]);

  // Group alerts by date
  const alertsByDate = useMemo(() => {
    const grouped = new Map<string, WeatherAlert[]>();
    filteredAlerts.forEach(alert => {
      const date = alert.created_at.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(alert);
    });
    return grouped;
  }, [filteredAlerts]);

  // Get alerts for selected date
  const selectedDateAlerts = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return alertsByDate.get(dateStr) || [];
  }, [alertsByDate, selectedDate]);

  // Calendar day modifiers
  const daysWithAlerts = useMemo(() => {
    return Array.from(alertsByDate.keys()).map(d => new Date(d));
  }, [alertsByDate]);

  const exportHistory = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      totalAlerts: alerts.length,
      alerts: alerts,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-alerts-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando histórico de alertas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8 text-red-500", className)}>
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar alertas</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="text-xs text-muted-foreground">Total de Alertas</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-500">{stats?.critical || 0}</div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-500">{stats?.active || 0}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-500">{stats?.unacknowledged || 0}</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <select 
            className="px-3 py-1.5 rounded-md border bg-background text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="storm">Tempestade</option>
            <option value="wind">Vento</option>
            <option value="wave">Ondas</option>
            <option value="visibility">Visibilidade</option>
            <option value="temperature">Temperatura</option>
          </select>

          <select 
            className="px-3 py-1.5 rounded-md border bg-background text-sm"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="all">Todas severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "dd MMM yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                modifiers={{
                  hasAlerts: daysWithAlerts,
                }}
                modifiersStyles={{
                  hasAlerts: {
                    fontWeight: 'bold',
                    backgroundColor: 'hsl(var(--primary) / 0.2)',
                  },
                }}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={exportHistory}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Day Alerts */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-medium">
              Alertas em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDateAlerts.length} alerta(s) encontrado(s)
            </p>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-3">
              {selectedDateAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum alerta nesta data</p>
                </div>
              ) : (
                selectedDateAlerts.map(alert => {
                  const IconComponent = ALERT_ICONS[alert.alert_type] || Bell;
                  const severityClass = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.low;
                  
                  return (
                    <div 
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        !alert.acknowledged && "bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-full", severityClass)}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{alert.title}</span>
                            <Badge variant="outline" className={severityClass}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(alert.created_at), "HH:mm")}
                            </span>
                            {alert.location?.name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.location.name}
                              </span>
                            )}
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Ack
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Recent History */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="font-medium">Histórico Recente</h3>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {historyData?.map(day => (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {format(new Date(day.date), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-2">
                      {day.summary.critical > 0 && (
                        <Badge variant="destructive">{day.summary.critical} críticos</Badge>
                      )}
                      <Badge variant="secondary">{day.summary.total} alertas</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {day.alerts.slice(0, 5).map(alert => {
                      const IconComponent = ALERT_ICONS[alert.alert_type] || Bell;
                      return (
                        <div 
                          key={alert.id}
                          className={cn(
                            "p-1.5 rounded",
                            SEVERITY_COLORS[alert.severity]
                          )}
                          title={alert.title}
                        >
                          <IconComponent className="h-3 w-3" />
                        </div>
                      );
                    })}
                    {day.alerts.length > 5 && (
                      <span className="text-xs text-muted-foreground px-2">
                        +{day.alerts.length - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
