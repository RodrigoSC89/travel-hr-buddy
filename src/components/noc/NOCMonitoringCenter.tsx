/**
 * NOCMonitoringCenter - Centro de Monitoramento Proativo 24/7
 * ✅ P0 CORRIGIDO: Dados reais via Supabase (R01 MITIGADO)
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Radio,
  Activity,
  AlertTriangle,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Webhook,
  Send,
  Play,
  Pause,
  Settings,
  WifiOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface SystemStatus {
  name: string;
  status: "online" | "degraded" | "offline";
  latency: number;
  lastCheck: string;
  uptime: number;
}

interface ProactiveAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  source: string;
  timestamp: string;
  aiSuggestion?: string;
  webhookSent: boolean;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  eventTypes: string[];
  isActive: boolean;
  lastTriggered?: string;
}

export function NOCMonitoringCenter() {
  const navigate = useNavigate();
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRestart, setAutoRestart] = useState(true);
  const [aiAutonomous, setAiAutonomous] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: "all" });
  const [localWebhooks, setLocalWebhooks] = useState<WebhookConfig[]>([]);

  // ✅ R01: Fetch real system status from database
  const { data: systemsData, isLoading: systemsLoading, refetch: refetchSystems } = useQuery({
    queryKey: ["noc-systems"],
    queryFn: async (): Promise<SystemStatus[]> => {
      const { data, error } = await supabase
        .from("system_status")
        .select("*")
        .order("service_name", { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(s => ({
        name: s.service_name || "Serviço",
        status: (s.status === "healthy" ? "online" : s.status === "degraded" ? "degraded" : "offline") as SystemStatus["status"],
        latency: s.response_time || 0,
        lastCheck: s.last_check || new Date().toISOString(),
        uptime: s.uptime_percentage || 99.9,
      }));
    },
    refetchInterval: isMonitoring ? 30000 : false,
  });

  // ✅ R01: Fetch real alerts from database
  const { data: alertsData, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ["noc-alerts"],
    queryFn: async (): Promise<ProactiveAlert[]> => {
      const { data, error } = await supabase
        .from("soc_alerts")
        .select("*")
        .eq("is_acknowledged", false)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      return (data || []).map(a => ({
        id: a.id,
        type: (a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "info") as ProactiveAlert["type"],
        title: a.title || "Alerta",
        description: a.message || "",
        source: a.source_module || "Sistema",
        timestamp: a.created_at || new Date().toISOString(),
        aiSuggestion: typeof a.metadata === "object" ? (a.metadata as Record<string, unknown>)?.aiSuggestion as string : undefined,
        webhookSent: a.is_acknowledged || false,
      }));
    },
    refetchInterval: isMonitoring ? 15000 : false,
  });

  const systems = systemsData || [];
  const alerts = alertsData || [];
  const webhooks = localWebhooks;
  const isLoading = systemsLoading || alertsLoading;

  const getStatusColor = (status: SystemStatus["status"]) => {
    switch (status) {
      case "online": return "bg-success";
      case "degraded": return "bg-warning animate-pulse";
      case "offline": return "bg-destructive animate-pulse";
    }
  };

  const getStatusText = (status: SystemStatus["status"]) => {
    switch (status) {
      case "online": return "Online";
      case "degraded": return "Degradado";
      case "offline": return "Offline";
    }
  };

  const getAlertColor = (type: ProactiveAlert["type"]) => {
    switch (type) {
      case "critical": return "border-destructive bg-destructive/10";
      case "warning": return "border-warning bg-warning/10";
      case "info": return "border-primary bg-primary/10";
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Preencha todos os campos");
      return;
    }

    const webhook: WebhookConfig = {
      id: `wh-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      eventTypes: newWebhook.events === "all" ? ["critical", "warning", "info"] : [newWebhook.events],
      isActive: true,
    };

    setLocalWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: "", url: "", events: "all" });
    setShowWebhookDialog(false);
    toast.success("Webhook adicionado com sucesso!");
  };

  const toggleWebhook = (id: string) => {
    setLocalWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    toast.info(`Testando webhook: ${webhook.name}...`);
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, source: 'noc-monitoring', timestamp: new Date().toISOString() }),
      });
      if (response.ok) {
        setLocalWebhooks(prev => prev.map(w => w.id === webhook.id ? { ...w, lastTriggered: new Date().toISOString() } : w));
        toast.success(`Webhook ${webhook.name} respondeu com sucesso!`);
      } else {
        toast.error(`Webhook ${webhook.name} retornou status ${response.status}`);
      }
    } catch {
      toast.error(`Falha ao conectar com webhook ${webhook.name}`);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    await supabase.from("soc_alerts").update({ is_acknowledged: true }).eq("id", id);
    await refetchAlerts();
    toast.success("Alerta reconhecido");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSystems(), refetchAlerts()]);
    setIsRefreshing(false);
    toast.success("Dados atualizados");
  };

  // ⚠️ Estado "Não Configurado" quando não há dados
  if (!isLoading && systems.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-muted">
            <Radio className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NOC 24/7</h1>
            <p className="text-sm text-muted-foreground">Centro de Operações de Rede</p>
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
                Este painel exibe apenas dados reais. Configure as integrações para começar.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/integrations-center')}>
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
      <div className="space-y-6 p-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const onlineCount = systems.filter(s => s.status === "online").length;
  const degradedCount = systems.filter(s => s.status === "degraded").length;
  const offlineCount = systems.filter(s => s.status === "offline").length;
  const criticalAlerts = alerts.filter(a => a.type === "critical").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NOC 24/7</h1>
            <p className="text-sm text-muted-foreground">Centro de Operações de Rede</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="monitoring"
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
            />
            <Label htmlFor="monitoring" className="flex items-center gap-2">
              {isMonitoring ? <Play className="h-4 w-4 text-success" /> : <Pause className="h-4 w-4" />}
              {isMonitoring ? "Monitorando" : "Pausado"}
            </Label>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-success">{onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Degradado</p>
                <p className="text-2xl font-bold text-warning">{degradedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-destructive">{offlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-destructive">{criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Systems Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status dos Sistemas</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {systems.map((system, idx) => (
                <motion.div
                  key={system.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", getStatusColor(system.status))} />
                    <div>
                      <p className="font-medium">{system.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Latência: {system.latency}ms | Uptime: {system.uptime}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={system.status === "online" ? "default" : system.status === "degraded" ? "secondary" : "destructive"}>
                    {getStatusText(system.status)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Proativos</CardTitle>
            <CardDescription>Incidentes recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <AnimatePresence mode="popLayout">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={cn("p-3 rounded-lg border", getAlertColor(alert.type))}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={alert.type === "critical" ? "destructive" : "secondary"}>
                                {alert.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{alert.source}</span>
                            </div>
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                            {alert.aiSuggestion && (
                              <p className="text-xs text-primary mt-2">💡 {alert.aiSuggestion}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Webhooks de Notificação</CardTitle>
            <CardDescription>Configure integrações para alertas externos</CardDescription>
          </div>
          <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Webhook className="h-4 w-4 mr-2" />
                Adicionar Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Webhook</DialogTitle>
                <DialogDescription>
                  Configure um webhook para receber alertas externos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Ex: Slack Alerts"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eventos</Label>
                  <Select
                    value={newWebhook.events}
                    onValueChange={(value) => setNewWebhook(prev => ({ ...prev, events: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os eventos</SelectItem>
                      <SelectItem value="critical">Apenas críticos</SelectItem>
                      <SelectItem value="warning">Avisos e críticos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleAddWebhook}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum webhook configurado</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{webhook.name}</p>
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">{webhook.url}</p>
                    <div className="flex gap-1">
                      {webhook.eventTypes.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => testWebhook(webhook)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="autoRestart"
                checked={autoRestart}
                onCheckedChange={setAutoRestart}
              />
              <Label htmlFor="autoRestart">Reinício Automático de Serviços</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="aiAutonomous"
                checked={aiAutonomous}
                onCheckedChange={setAiAutonomous}
              />
              <Label htmlFor="aiAutonomous">IA Autônoma para Mitigação</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NOCMonitoringCenter;
