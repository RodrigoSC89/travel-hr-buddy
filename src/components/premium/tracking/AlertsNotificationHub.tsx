/**
 * FASE 4 - Tracking Hub
 * Central de Alertas priorizada por severidade (benchmark: MarineTraffic)
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Bell, BellOff, AlertTriangle, AlertCircle, Info, 
  CheckCircle, X, Filter, Search, Clock, MapPin,
  Ship, Anchor, Navigation, Thermometer, Wind
} from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "position" | "weather" | "compliance" | "maintenance" | "safety" | "geofence";
  title: string;
  message: string;
  vessel?: string;
  timestamp: Date;
  acknowledged: boolean;
  location?: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    category: "geofence",
    title: "Violação de Geofence - ECA",
    message: "MV Atlântico Sul entrou em zona ECA sem trocar para combustível LSFO",
    vessel: "MV Atlântico Sul",
    timestamp: new Date(Date.now() - 120000),
    acknowledged: false,
    location: "Mar do Norte - ECA Zone"
  },
  {
    id: "2",
    type: "warning",
    category: "weather",
    title: "Alerta Meteorológico",
    message: "Ventos de 45 nós previstos para rota do PSV Oceano Azul nas próximas 6 horas",
    vessel: "PSV Oceano Azul",
    timestamp: new Date(Date.now() - 300000),
    acknowledged: false,
    location: "Bacia de Santos"
  },
  {
    id: "3",
    type: "warning",
    category: "maintenance",
    title: "Manutenção Vencida",
    message: "Inspeção de filtros do Gerador #2 está 30 horas atrasada",
    vessel: "AHTS Maré Alta",
    timestamp: new Date(Date.now() - 600000),
    acknowledged: true,
  },
  {
    id: "4",
    type: "info",
    category: "position",
    title: "Chegada no Porto",
    message: "MV Atlântico Sul atracou no berço 12 do Porto de Rotterdam",
    vessel: "MV Atlântico Sul",
    timestamp: new Date(Date.now() - 900000),
    acknowledged: true,
    location: "Rotterdam, Netherlands"
  },
  {
    id: "5",
    type: "critical",
    category: "safety",
    title: "AIS Signal Lost",
    message: "Sinal AIS perdido há mais de 30 minutos",
    vessel: "Supply Boat SB-07",
    timestamp: new Date(Date.now() - 180000),
    acknowledged: false,
  },
  {
    id: "6",
    type: "success",
    category: "compliance",
    title: "Certificado Renovado",
    message: "SMC renovado com sucesso. Válido até 15/02/2026",
    vessel: "PSV Oceano Azul",
    timestamp: new Date(Date.now() - 1200000),
    acknowledged: true,
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "position": return <MapPin className="h-4 w-4" />;
    case "weather": return <Wind className="h-4 w-4" />;
    case "compliance": return <CheckCircle className="h-4 w-4" />;
    case "maintenance": return <Anchor className="h-4 w-4" />;
    case "safety": return <AlertTriangle className="h-4 w-4" />;
    case "geofence": return <Navigation className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case "critical": return { bg: "bg-destructive/10", border: "border-destructive", text: "text-destructive", icon: AlertCircle };
    case "warning": return { bg: "bg-warning/10", border: "border-warning", text: "text-warning", icon: AlertTriangle };
    case "info": return { bg: "bg-primary/10", border: "border-primary", text: "text-primary", icon: Info };
    case "success": return { bg: "bg-success/10", border: "border-success", text: "text-success", icon: CheckCircle };
    default: return { bg: "bg-muted", border: "border-muted", text: "text-muted-foreground", icon: Bell };
  }
};

export default function AlertsNotificationHub() {
  const [alertList, setAlertList] = useState<Alert[]>(alerts);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mutedCategories, setMutedCategories] = useState<string[]>([]);

  const handleAcknowledge = (id: string) => {
    setAlertList(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido");
  };

  const handleDismiss = (id: string) => {
    setAlertList(prev => prev.filter(a => a.id !== id));
    toast.info("Alerta removido");
  };

  const handleMuteCategory = (category: string) => {
    if (mutedCategories.includes(category)) {
      setMutedCategories(prev => prev.filter(c => c !== category));
      toast.info(`Notificações de ${category} ativadas`);
    } else {
      setMutedCategories(prev => [...prev, category]);
      toast.info(`Notificações de ${category} silenciadas`);
    }
  };

  const filteredAlerts = alertList.filter(alert => {
    if (filter !== "all" && alert.type !== filter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !alert.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const criticalCount = alertList.filter(a => a.type === "critical" && !a.acknowledged).length;
  const warningCount = alertList.filter(a => a.type === "warning" && !a.acknowledged).length;
  const unreadCount = alertList.filter(a => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avisos</p>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Não Lidos</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Bell className="h-8 w-8 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Hoje</p>
                <p className="text-2xl font-bold">{alertList.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar alertas..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["all", "critical", "warning", "info"].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                >
                  {type === "all" ? "Todos" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Central de Alertas
          </CardTitle>
          <CardDescription>
            Alertas priorizados por severidade em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredAlerts
                .sort((a, b) => {
                  const priority = { critical: 0, warning: 1, info: 2, success: 3 };
                  if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
                  return priority[a.type] - priority[b.type];
                })
                .map((alert) => {
                  const styles = getTypeStyles(alert.type);
                  const Icon = styles.icon;
                  
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-4 border-l-4 rounded-lg ${styles.bg} ${styles.border} ${
                        alert.acknowledged ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${styles.text}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{alert.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryIcon(alert.category)}
                                <span className="ml-1">{alert.category}</span>
                              </Badge>
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Reconhecido
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {alert.vessel && (
                                <span className="flex items-center gap-1">
                                  <Ship className="h-3 w-3" />
                                  {alert.vessel}
                                </span>
                              )}
                              {alert.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
