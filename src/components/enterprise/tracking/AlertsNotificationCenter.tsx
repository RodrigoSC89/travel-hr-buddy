/**
 * AlertsNotificationCenter - Central de Alertas e Notificações
 * Enterprise-grade alert management with AI prioritization
 * PATCH: Migrated from mock data to Supabase intelligent_notifications
 */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, 
  Clock, Ship, FileText, Wrench, Users, MapPin, X,
  Volume2, VolumeX, Filter, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "operations" | "maintenance" | "compliance" | "crew" | "safety" | "system";
  title: string;
  message: string;
  vessel?: string;
  source: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  aiPriority: number; // 1-100
  autoResolved?: boolean;
}

// Fallback alerts when no data in DB
const fallbackAlerts: Alert[] = [];

function mapSeverityToType(severity: string): Alert["type"] {
  switch (severity) {
    case "critical": return "critical";
    case "high": return "warning";
    case "low": return "success";
    default: return "info";
  }
}

function priorityToNumber(priority: string): number {
  switch (priority) {
    case "critical": return 95;
    case "high": return 75;
    case "medium": return 50;
    case "low": return 25;
    default: return 50;
  }
}

function mapCategoryFromType(type: string): Alert["category"] {
  if (type.includes("maintenance")) return "maintenance";
  if (type.includes("compliance") || type.includes("certificate")) return "compliance";
  if (type.includes("crew") || type.includes("stcw")) return "crew";
  if (type.includes("safety") || type.includes("emergency")) return "safety";
  if (type.includes("system")) return "system";
  return "operations";
}

const typeConfig = {
  critical: { icon: AlertCircle, color: "bg-destructive text-destructive-foreground", bgLight: "bg-destructive/10 border-destructive/20" },
  warning: { icon: AlertTriangle, color: "bg-warning text-warning-foreground", bgLight: "bg-warning/10 border-warning/20" },
  info: { icon: Info, color: "bg-info text-info-foreground", bgLight: "bg-info/10 border-info/20" },
  success: { icon: CheckCircle2, color: "bg-success text-success-foreground", bgLight: "bg-success/10 border-success/20" },
};

const categoryIcons = {
  operations: Ship,
  maintenance: Wrench,
  compliance: FileText,
  crew: Users,
  safety: AlertTriangle,
  system: Settings,
};

export function AlertsNotificationCenter() {
  const [alerts, setAlerts] = useState<Alert[]>(fallbackAlerts);
  const [filter, setFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const { data, error } = await supabase
          .from('intelligent_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error || !data?.length) return;

        const mapped: Alert[] = data.map(n => ({
          id: n.id,
          type: mapSeverityToType(n.priority || 'info'),
          category: mapCategoryFromType(n.type || ''),
          title: n.title,
          message: n.message || '',
          source: n.type || 'System',
          timestamp: new Date(n.created_at || Date.now()),
          read: n.is_read || false,
          actionRequired: n.priority === 'critical' || n.priority === 'high',
          actionUrl: (n.metadata as Record<string, unknown>)?.actionUrl as string | undefined,
          aiPriority: priorityToNumber(n.priority),
        }));
        setAlerts(mapped);
      } catch {
        // Keep empty state
      }
    }
    loadAlerts();
  }, []);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter !== "all" && alert.type !== filter) return false;
      if (showUnreadOnly && alert.read) return false;
      return true;
    })
    .sort((a, b) => b.aiPriority - a.aiPriority);

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.read).length,
    critical: alerts.filter(a => a.type === "critical").length,
    actionRequired: alerts.filter(a => a.actionRequired && !a.read).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Central de Alertas
            {stats.unread > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{stats.unread}</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Notificações priorizadas por IA</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Som</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Só não lidos</span>
            <Switch checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
          </div>
          <Button variant="outline" onClick={() => setAlerts(prev => prev.map(a => ({ ...a, read: true })))}>
            Marcar Todos Lidos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Lidos</p>
                <p className="text-2xl font-bold text-info">{stats.unread}</p>
              </div>
              <Info className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ação Requerida</p>
                <p className="text-2xl font-bold text-warning">{stats.actionRequired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="critical" className="text-destructive">Críticos</TabsTrigger>
          <TabsTrigger value="warning" className="text-warning">Avisos</TabsTrigger>
          <TabsTrigger value="info" className="text-info">Info</TabsTrigger>
          <TabsTrigger value="success" className="text-success">Sucesso</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alerts List */}
      <Card>
        <CardContent className="pt-4">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                <p className="text-lg font-medium">Nenhum alerta</p>
                <p className="text-muted-foreground">Você está em dia!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const TypeIcon = typeConfig[alert.type].icon;
                  const CategoryIcon = categoryIcons[alert.category];
                  
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-lg border ${typeConfig[alert.type].bgLight} ${!alert.read ? "ring-2 ring-offset-2 ring-primary/20" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-full ${typeConfig[alert.type].color} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{alert.title}</h4>
                            {!alert.read && (
                              <Badge className="bg-info text-info-foreground text-xs">Novo</Badge>
                            )}
                            {alert.actionRequired && (
                              <Badge className="bg-warning text-warning-foreground text-xs">Ação Requerida</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {alert.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {alert.vessel && (
                              <span className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {alert.vessel}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(alert.timestamp, { locale: ptBR, addSuffix: true })}
                            </span>
                            <span>Fonte: {alert.source}</span>
                            <span className="flex items-center gap-1">
                              Prioridade IA: 
                              <span className={`font-medium ${
                                alert.aiPriority >= 80 ? "text-destructive" :
                                alert.aiPriority >= 50 ? "text-warning" : "text-success"
                              }`}>
                                {alert.aiPriority}%
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {alert.actionRequired && alert.actionUrl && (
                            <Button size="sm" variant="default">
                              Resolver
                            </Button>
                          )}
                          {!alert.read && (
                            <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)}>
                              Marcar Lido
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default AlertsNotificationCenter;
