/**
 * Telemetry Alerts Component
 * Real-time alert management with filtering and actions
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Bell,
  BellOff,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface TelemetryAlert {
  id: string;
  type: "weather" | "satellite" | "system" | "ai" | "security";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source: string;
  metadata?: Record<string, any>;
}

interface TelemetryAlertsProps {
  alerts: TelemetryAlert[];
  onAlertsChange?: (alerts: TelemetryAlert[]) => void;
}

export function TelemetryAlerts({ alerts: initialAlerts, onAlertsChange }: TelemetryAlertsProps) {
  const [alerts, setAlerts] = useState<TelemetryAlert[]>(initialAlerts);
  const [filter, setFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Update alerts when props change
  React.useEffect(() => {
    setAlerts(initialAlerts);
  }, [initialAlerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesType = filter === "all" || alert.type === filter;
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesSearch = searchQuery === "" || 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSeverity && matchesSearch;
    });
  }, [alerts, filter, severityFilter, searchQuery]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = (id: string) => {
    const updated = alerts.map(a => 
      a.id === id ? { ...a, read: true } : a
    );
    setAlerts(updated);
    onAlertsChange?.(updated);
  };

  const markAllAsRead = () => {
    const updated = alerts.map(a => ({ ...a, read: true }));
    setAlerts(updated);
    onAlertsChange?.(updated);
    toast.success("Todos os alertas marcados como lidos");
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    onAlertsChange?.(updated);
    toast.success("Alerta removido");
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    onAlertsChange?.([]);
    toast.success("Todos os alertas foram limpos");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "destructive";
    case "warning": return "default";
    default: return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
    case "critical": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    case "warning": return <Bell className="h-4 w-4 text-yellow-500" />;
    default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      weather: "Meteorologia",
      satellite: "Satélite",
      system: "Sistema",
      ai: "IA",
      security: "Segurança",
    };
    return labels[type] || type;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} novo{unreadCount > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alertas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="weather">Meteorologia</SelectItem>
                    <SelectItem value="satellite">Satélite</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="ai">IA</SelectItem>
                    <SelectItem value="security">Segurança</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllAlerts}
                  disabled={alerts.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar todos
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-8"
                >
                  <BellOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum alerta encontrado</p>
                </motion.div>
              ) : (
                filteredAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 border rounded-lg space-y-2 transition-colors ${
                      !alert.read ? "bg-muted/50 border-primary/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(alert.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!alert.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{alert.source}</span>
                      <span>
                        {alert.timestamp.toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
