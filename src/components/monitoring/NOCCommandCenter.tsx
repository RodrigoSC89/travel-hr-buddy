/**
 * NOC Command Center - ✅ R01 CORRIGIDO
 * Network Operations Center com dados reais do Supabase
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
  TrendingDown,
  WifiOff
} from "lucide-react";
import { useNOCServices, useNOCAlerts, type NOCService, type NOCAlert, type ServiceStatus } from "@/hooks/useNOCData";
import { useQueryClient } from "@tanstack/react-query";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: Date;
}

type ServiceType = "database" | "api" | "auth" | "storage" | "edge" | "realtime";

export function NOCCommandCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ✅ R01: Dados reais via hooks
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } = useNOCServices();
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useNOCAlerts();
  
  const services = servicesData || [];
  const [alerts, setAlerts] = useState<NOCAlert[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<NOCAlert | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sync alerts from query
  React.useEffect(() => {
    if (alertsData) setAlerts(alertsData);
  }, [alertsData]);
  
  const isLoading = servicesLoading || alertsLoading;
  
  // ⚠️ Estado "Não Configurado"
  if (!isLoading && services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold">NOC Command Center</h2>
            <p className="text-muted-foreground">Monitoramento 24/7</p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Monitoramento Não Configurado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure os serviços de monitoramento para visualizar o status em tempo real.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este painel exibe apenas dados reais da tabela system_status.
              </AlertDescription>
            </Alert>
            <Button onClick={() => window.location.href = '/settings/integrations'}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Monitoramento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Stats
  const stats = {
    totalServices: services.length,
    operational: services.filter(s => s.status === "operational").length,
    degraded: services.filter(s => s.status === "degraded").length,
    outage: services.filter(s => s.status === "outage").length,
    activeAlerts: alerts.filter(a => a.status === "active").length,
    criticalAlerts: alerts.filter(a => a.severity === "critical" && a.status === "active").length,
    avgUptime: services.length > 0 ? (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2) : "0.00"
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  // Refresh services
  const refreshServices = async () => {
    setIsRefreshing(true);
    await refetchServices();
    await refetchAlerts();
    setIsRefreshing(false);
    toast({
      title: "Status Atualizado",
      description: "Todos os serviços foram verificados"
    });
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "acknowledged" as const, acknowledgedBy: "Current User", acknowledgedAt: new Date() }
        : a
    ));
    toast({
      title: "Alerta Reconhecido",
      description: "O alerta foi marcado como visualizado"
    });
  };

  // Resolve alert
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: "resolved" as const, resolvedAt: new Date() }
        : a
    ));
    toast({
      title: "Alerta Resolvido",
      description: "O alerta foi marcado como resolvido"
    });
  };

  // Mute alert
  const muteAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: "muted" as const } : a
    ));
    toast({
      title: "Alerta Silenciado",
      description: "Notificações desativadas para este alerta"
    });
  };

  // Add note to alert
  const addNoteToAlert = () => {
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
  };

  // Toggle webhook
  const toggleWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === webhookId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const getStatusColor = (status: ServiceStatus) => {
    const colors: Record<ServiceStatus, string> = {
      operational: "bg-green-500",
      degraded: "bg-yellow-500",
      outage: "bg-red-500",
      maintenance: "bg-blue-500"
    };
    return colors[status];
  };

  const getStatusLabel = (status: ServiceStatus) => {
    const labels: Record<ServiceStatus, string> = {
      operational: "Operacional",
      degraded: "Degradado",
      outage: "Indisponível",
      maintenance: "Manutenção"
    };
    return labels[status];
  };

  const getServiceIcon = (type: ServiceType) => {
    const icons: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
      database: Database,
      api: Zap,
      auth: Shield,
      storage: Server,
      edge: Activity,
      realtime: Wifi
    };
    return icons[type] || Activity;
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
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Operacional</p>
            <p className="text-2xl font-bold text-green-500">{stats.operational}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Degradado</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.degraded}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Indisponível</p>
            <p className="text-2xl font-bold text-red-500">{stats.outage}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Alertas Ativos</p>
            <p className="text-2xl font-bold text-orange-500">{stats.activeAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Críticos</p>
            <p className="text-2xl font-bold text-red-500">{stats.criticalAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Uptime Médio</p>
            <p className="text-2xl font-bold">{stats.avgUptime}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Serviços</CardTitle>
              <CardDescription>Monitoramento em tempo real de todos os serviços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => {
                  const IconComponent = getServiceIcon(service.type as ServiceType);
                  return (
                    <Card key={service.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusLabel(service.status)}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime</span>
                            <span>{service.uptime.toFixed(2)}%</span>
                          </div>
                          <Progress value={service.uptime} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Latência</span>
                            <span>{service.latency}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Incidentes</span>
                            <span>{service.incidents}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alertas</CardTitle>
                  <CardDescription>Gerenciamento de alertas e incidentes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alertas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {filteredAlerts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAlerts.map((alert) => (
                      <Card key={alert.id} className={`border-l-4 ${
                        alert.severity === 'critical' ? 'border-l-red-500' :
                        alert.severity === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {alert.severity}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{alert.serviceName}</span>
                              </div>
                              <h4 className="font-medium">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {alert.timestamp.toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {alert.status === 'active' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => acknowledgeAlert(alert.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => resolveAlert(alert.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => muteAlert(alert.id)}
                                  >
                                    <BellOff className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setIsNoteDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks de Notificação</CardTitle>
              <CardDescription>Configure integrações para alertas externos</CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum webhook configurado</p>
                  <Button variant="outline" className="mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Adicionar Webhook
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      </div>
                      <Switch 
                        checked={webhook.enabled}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nota</DialogTitle>
            <DialogDescription>
              Adicione uma nota ao alerta: {selectedAlert?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
            <Button onClick={addNoteToAlert}>
              Salvar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NOCCommandCenter;
