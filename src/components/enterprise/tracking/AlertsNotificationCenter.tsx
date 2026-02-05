/**
 * AlertsNotificationCenter - Central de Alertas e Notificações
 * Enterprise-grade alert management with AI prioritization
 */

import React, { useState } from "react";
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

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    category: "compliance",
    title: "Certificado ISPS Expirando",
    message: "O certificado ISPS do MV Atlantic Star expira em 7 dias. Ação imediata necessária.",
    vessel: "MV Atlantic Star",
    source: "Compliance Monitor",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionRequired: true,
    actionUrl: "/compliance/certificates",
    aiPriority: 95,
  },
  {
    id: "2",
    type: "warning",
    category: "maintenance",
    title: "Manutenção Preventiva Pendente",
    message: "Motor auxiliar #2 precisa de troca de óleo. Programado para há 3 dias.",
    vessel: "MV Pacific Dawn",
    source: "Maintenance Predictor",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    actionRequired: true,
    actionUrl: "/maintenance",
    aiPriority: 78,
  },
  {
    id: "3",
    type: "warning",
    category: "crew",
    title: "Tripulante com Certificado Vencendo",
    message: "STCW de Carlos Silva expira em 15 dias. Renovação deve ser iniciada.",
    vessel: "MV Caribbean Blue",
    source: "Crew Manager",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    actionRequired: true,
    actionUrl: "/people/certifications",
    aiPriority: 72,
  },
  {
    id: "4",
    type: "info",
    category: "operations",
    title: "ETA Atualizado",
    message: "Devido a condições meteorológicas, ETA para Singapore alterado para 15/02 08:00.",
    vessel: "MV Atlantic Star",
    source: "Voyage Optimizer",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    actionRequired: false,
    aiPriority: 45,
  },
  {
    id: "5",
    type: "success",
    category: "compliance",
    title: "Auditoria Concluída",
    message: "Auditoria ISM anual concluída com sucesso. Zero não-conformidades.",
    vessel: "MV Pacific Dawn",
    source: "Audit Center",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    actionRequired: false,
    aiPriority: 30,
  },
  {
    id: "6",
    type: "critical",
    category: "safety",
    title: "Desvio de Rota Detectado",
    message: "MV Caribbean Blue desviou 15nm da rota planejada. Verificar situação.",
    vessel: "MV Caribbean Blue",
    source: "AIS Tracker",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    actionRequired: true,
    actionUrl: "/tracking",
    aiPriority: 92,
  },
];

const typeConfig = {
  critical: { icon: AlertCircle, color: "bg-red-500 text-white", bgLight: "bg-red-50 border-red-200" },
  warning: { icon: AlertTriangle, color: "bg-amber-500 text-white", bgLight: "bg-amber-50 border-amber-200" },
  info: { icon: Info, color: "bg-blue-500 text-white", bgLight: "bg-blue-50 border-blue-200" },
  success: { icon: CheckCircle2, color: "bg-green-500 text-white", bgLight: "bg-green-50 border-green-200" },
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
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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
              <Badge className="bg-red-500 text-white">{stats.unread}</Badge>
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
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ação Requerida</p>
                <p className="text-2xl font-bold text-amber-600">{stats.actionRequired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="critical" className="text-red-600">Críticos</TabsTrigger>
          <TabsTrigger value="warning" className="text-amber-600">Avisos</TabsTrigger>
          <TabsTrigger value="info" className="text-blue-600">Info</TabsTrigger>
          <TabsTrigger value="success" className="text-green-600">Sucesso</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alerts List */}
      <Card>
        <CardContent className="pt-4">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
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
                              <Badge className="bg-blue-500 text-white text-xs">Novo</Badge>
                            )}
                            {alert.actionRequired && (
                              <Badge className="bg-amber-500 text-white text-xs">Ação Requerida</Badge>
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
                                alert.aiPriority >= 80 ? "text-red-600" :
                                alert.aiPriority >= 50 ? "text-amber-600" : "text-green-600"
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
