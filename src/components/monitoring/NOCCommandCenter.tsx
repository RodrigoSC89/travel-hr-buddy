/**
 * NOC Command Center - PATCH INTERACTIVITY 100%
 * Network Operations Center with alerts, acknowledge and workflows
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  Shield,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Zap,
  Users,
  MessageSquare,
  Phone,
  Mail,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown
} from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";
type AlertSeverity = "critical" | "warning" | "info";
type AlertStatus = "active" | "acknowledged" | "resolved" | "muted";

interface Service {
  id: string;
  name: string;
  type: "database" | "api" | "auth" | "storage" | "edge" | "realtime";
  status: ServiceStatus;
  uptime: number;
  latency: number;
  lastCheck: Date;
  incidents: number;
}

interface NOCAlert {
  id: string;
  serviceId: string;
  serviceName: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notes: string[];
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: Date;
}

const MOCK_SERVICES: Service[] = [
  { id: "s1", name: "Supabase Database", type: "database", status: "operational", uptime: 99.99, latency: 45, lastCheck: new Date(), incidents: 0 },
  { id: "s2", name: "Auth Service", type: "auth", status: "operational", uptime: 99.95, latency: 120, lastCheck: new Date(), incidents: 1 },
  { id: "s3", name: "Edge Functions", type: "edge", status: "degraded", uptime: 98.50, latency: 850, lastCheck: new Date(), incidents: 3 },
  { id: "s4", name: "Storage API", type: "storage", status: "operational", uptime: 99.90, latency: 200, lastCheck: new Date(), incidents: 0 },
  { id: "s5", name: "Realtime", type: "realtime", status: "operational", uptime: 99.85, latency: 50, lastCheck: new Date(), incidents: 2 },
  { id: "s6", name: "REST API", type: "api", status: "maintenance", uptime: 99.00, latency: 0, lastCheck: new Date(), incidents: 0 }
];

const MOCK_ALERTS: NOCAlert[] = [
  {
    id: "a1",
    serviceId: "s3",
    serviceName: "Edge Functions",
    severity: "critical",
    title: "Alta Latência Detectada",
    message: "Latência acima de 800ms nos últimos 5 minutos",
    timestamp: new Date(Date.now() - 300000),
    status: "active",
    notes: []
  },
  {
    id: "a2",
    serviceId: "s3",
    serviceName: "Edge Functions",
    severity: "warning",
    title: "Taxa de Erro Elevada",
    message: "5% das requisições retornando erro 500",
    timestamp: new Date(Date.now() - 600000),
    status: "acknowledged",
    acknowledgedBy: "Admin",
    acknowledgedAt: new Date(Date.now() - 500000),
    notes: ["Investigando causa raiz"]
  },
  {
    id: "a3",
    serviceId: "s6",
    serviceName: "REST API",
    severity: "info",
    title: "Manutenção Programada",
    message: "Manutenção programada para atualização de segurança",
    timestamp: new Date(Date.now() - 3600000),
    status: "active",
    notes: []
  }
];

const MOCK_WEBHOOKS: Webhook[] = [
  { id: "w1", name: "Slack Alerts", url: "https://hooks.slack.com/...", events: ["critical", "outage"], enabled: true, lastTriggered: new Date(Date.now() - 300000) },
  { id: "w2", name: "PagerDuty", url: "https://events.pagerduty.com/...", events: ["critical"], enabled: true },
  { id: "w3", name: "Email Notifications", url: "https://api.sendgrid.com/...", events: ["critical", "warning"], enabled: false }
];

export function NOCCommandCenter() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [alerts, setAlerts] = useState<NOCAlert[]>(MOCK_ALERTS);
  const [webhooks, setWebhooks] = useState<Webhook[]>(MOCK_WEBHOOKS);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<NOCAlert | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    totalServices: services.length,
    operational: services.filter(s => s.status === "operational").length,
    degraded: services.filter(s => s.status === "degraded").length,
    outage: services.filter(s => s.status === "outage").length,
    activeAlerts: alerts.filter(a => a.status === "active").length,
    criticalAlerts: alerts.filter(a => a.severity === "critical" && a.status === "active").length,
    avgUptime: (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)
  }), [services, alerts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchQuery, severityFilter]);

  // Refresh services
  const refreshServices = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setServices(prev => prev.map(s => ({ ...s, lastCheck: new Date() })));
    setIsRefreshing(false);
    toast({
      title: "Status Atualizado",
      description: "Todos os serviços foram verificados"
    });
  }, [toast]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "acknowledged" as const, acknowledgedBy: "Current User", acknowledgedAt: new Date() }
        : a
    ));
    toast({
      title: "Alerta Reconhecido",
      description: "O alerta foi marcado como visualizado"
    });
  }, [toast]);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "resolved" as const, resolvedAt: new Date() }
        : a
    ));
    toast({
      title: "Alerta Resolvido",
      description: "O alerta foi marcado como resolvido"
    });
  }, [toast]);

  // Mute alert
  const muteAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: "muted" as const } : a
    ));
    toast({
      title: "Alerta Silenciado",
      description: "Notificações desativadas para este alerta"
    });
  }, [toast]);

  // Add note to alert
  const addNoteToAlert = useCallback(() => {
    if (!selectedAlert || !newNote.trim()) return;

    setAlerts(prev => prev.map(a => 
      a.id === selectedAlert.id 
        ? { ...a, notes: [...a.notes, `${new Date().toLocaleString('pt-BR')}: ${newNote}`] }
        : a
    ));
    setIsNoteDialogOpen(false);
    setNewNote("");
    toast({
      title: "Nota Adicionada",
      description: "A nota foi registrada no alerta"
    });
  }, [selectedAlert, newNote, toast]);

  // Toggle webhook
  const toggleWebhook = useCallback((webhookId: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === webhookId ? { ...w, enabled: !w.enabled } : w
    ));
  }, []);

  const getStatusColor = (status: ServiceStatus) => {
    const colors = {
      operational: "bg-green-500",
      degraded: "bg-yellow-500",
      outage: "bg-red-500",
      maintenance: "bg-blue-500"
    };
    return colors[status];
  };

  const getStatusLabel = (status: ServiceStatus) => {
    const labels = {
      operational: "Operacional",
      degraded: "Degradado",
      outage: "Indisponível",
      maintenance: "Manutenção"
    };
    return labels[status];
  };

  const getServiceIcon = (type: Service["type"]) => {
    const icons = {
      database: Database,
      api: Zap,
      auth: Shield,
      storage: Server,
      edge: Activity,
      realtime: Wifi
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            NOC Command Center
          </h2>
          <p className="text-muted-foreground">
            Monitoramento 24/7 da infraestrutura
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={refreshServices}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.totalServices}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Operacionais</p>
            <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Degradados</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.degraded}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Indisponíveis</p>
            <p className="text-2xl font-bold text-red-600">{stats.outage}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Alertas Ativos</p>
            <p className="text-2xl font-bold">{stats.activeAlerts}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Uptime Médio</p>
            <p className="text-2xl font-bold">{stats.avgUptime}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            Alertas
            {stats.activeAlerts > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 justify-center text-xs">
                {stats.activeAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const IconComponent = getServiceIcon(service.type);
              return (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(service.status)}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={service.status === "operational" ? "default" : "secondary"}>
                        {getStatusLabel(service.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Latência</span>
                      <span className={`font-medium ${service.latency > 500 ? "text-red-600" : ""}`}>
                        {service.latency}ms
                      </span>
                    </div>
                    <Progress value={service.uptime} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      Última verificação: {service.lastCheck.toLocaleTimeString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alerts List */}
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        alert.status === "active" ? "bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full ${
                            alert.severity === "critical" ? "bg-red-100 text-red-600" :
                            alert.severity === "warning" ? "bg-yellow-100 text-yellow-600" :
                            "bg-blue-100 text-blue-600"
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant={
                                alert.status === "active" ? "destructive" :
                                alert.status === "acknowledged" ? "secondary" :
                                alert.status === "resolved" ? "default" : "outline"
                              }>
                                {alert.status === "active" ? "Ativo" :
                                 alert.status === "acknowledged" ? "Reconhecido" :
                                 alert.status === "resolved" ? "Resolvido" : "Silenciado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                {alert.serviceName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.timestamp.toLocaleString('pt-BR')}
                              </span>
                              {alert.acknowledgedBy && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {alert.acknowledgedBy}
                                </span>
                              )}
                            </div>
                            {alert.notes.length > 0 && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>Notas:</strong>
                                {alert.notes.map((note, i) => (
                                  <p key={i} className="mt-1">{note}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {alert.status === "active" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Reconhecer
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => muteAlert(alert.id)}
                              >
                                <BellOff className="h-4 w-4 mr-1" />
                                Silenciar
                              </Button>
                            </>
                          )}
                          {alert.status === "acknowledged" && (
                            <Button 
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Nota
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços Monitorados</CardTitle>
              <CardDescription>
                Configuração e status de cada serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const IconComponent = getServiceIcon(service.type);
                  return (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-muted`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{service.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Uptime</p>
                          <p className="font-medium">{service.uptime}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Latência</p>
                          <p className={`font-medium ${service.latency > 500 ? "text-red-600" : ""}`}>
                            {service.latency}ms
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Incidentes</p>
                          <p className="font-medium">{service.incidents}</p>
                        </div>
                        <Badge variant={service.status === "operational" ? "default" : "secondary"}>
                          {getStatusLabel(service.status)}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Webhooks de Notificação</CardTitle>
                  <CardDescription>
                    Configure integrações para alertas
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Bell className="h-4 w-4" />
                  Novo Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${webhook.enabled ? "bg-green-100" : "bg-muted"}`}>
                        <Bell className={`h-5 w-5 ${webhook.enabled ? "text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {webhook.url}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {webhook.lastTriggered && (
                        <span className="text-xs text-muted-foreground">
                          Último disparo: {webhook.lastTriggered.toLocaleString('pt-BR')}
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`webhook-${webhook.id}`} className="text-sm">
                          {webhook.enabled ? "Ativo" : "Inativo"}
                        </Label>
                        <Switch
                          id={`webhook-${webhook.id}`}
                          checked={webhook.enabled}
                          onCheckedChange={() => toggleWebhook(webhook.id)}
                        />
                      </div>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nota</DialogTitle>
            <DialogDescription>
              Registre informações sobre este alerta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite sua nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addNoteToAlert} disabled={!newNote.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NOCCommandCenter;
