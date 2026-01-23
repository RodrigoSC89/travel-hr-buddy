/**
 * NOCMonitoringCenter - Centro de Monitoramento Proativo 24/7
 * PATCH 861 - Monitoramento autônomo com IA e webhooks
 */

import { useState, useEffect, useCallback } from "react";
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
import {
  Radio,
  Activity,
  AlertTriangle,
  Bell,
  Zap,
  Shield,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Webhook,
  Send,
  Clock,
  Eye,
  Play,
  Pause,
  Settings,
  MessageSquare,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRestart, setAutoRestart] = useState(true);
  const [aiAutonomous, setAiAutonomous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: "all" });

  const generateMockSystems = useCallback(() => {
    const mockSystems: SystemStatus[] = [
      { name: "API Gateway", status: "online", latency: 45, lastCheck: new Date().toISOString(), uptime: 99.99 },
      { name: "Database", status: "online", latency: 12, lastCheck: new Date().toISOString(), uptime: 99.97 },
      { name: "Edge Functions", status: "online", latency: 89, lastCheck: new Date().toISOString(), uptime: 99.95 },
      { name: "AI Service", status: "online", latency: 234, lastCheck: new Date().toISOString(), uptime: 99.92 },
      { name: "Storage", status: "online", latency: 28, lastCheck: new Date().toISOString(), uptime: 99.99 },
      { name: "Auth Service", status: "online", latency: 35, lastCheck: new Date().toISOString(), uptime: 99.98 },
      { name: "Realtime", status: Math.random() > 0.9 ? "degraded" : "online", latency: 67, lastCheck: new Date().toISOString(), uptime: 99.85 },
      { name: "Telemetry", status: "online", latency: 156, lastCheck: new Date().toISOString(), uptime: 99.90 },
    ];
    setSystems(mockSystems);
  }, []);

  const generateMockAlerts = useCallback(() => {
    const mockAlerts: ProactiveAlert[] = [
      {
        id: "1",
        type: "warning",
        title: "Latência elevada no Edge Function",
        description: "nautilus-predict respondendo com latência acima de 500ms",
        source: "Edge Functions",
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        aiSuggestion: "Considerar scale-up automático ou otimização de queries",
        webhookSent: true,
      },
      {
        id: "2",
        type: "info",
        title: "Backup automático concluído",
        description: "Backup diário do banco de dados executado com sucesso",
        source: "Database",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        webhookSent: false,
      },
      {
        id: "3",
        type: "critical",
        title: "Taxa de erro acima do limite",
        description: "5xx errors atingiram 0.5% nas últimas 5 minutos",
        source: "API Gateway",
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        aiSuggestion: "Verificar logs de erro e considerar rollback da última deploy",
        webhookSent: true,
      },
    ];
    setAlerts(mockAlerts);
  }, []);

  const generateMockWebhooks = useCallback(() => {
    const mockWebhooks: WebhookConfig[] = [
      { id: "1", name: "Slack Alertas", url: "https://hooks.slack.com/services/xxx", eventTypes: ["critical", "warning"], isActive: true, lastTriggered: new Date(Date.now() - 10 * 60000).toISOString() },
      { id: "2", name: "WhatsApp NOC", url: "https://api.twilio.com/xxx", eventTypes: ["critical"], isActive: true },
      { id: "3", name: "Email Operações", url: "https://api.sendgrid.com/xxx", eventTypes: ["critical", "warning", "info"], isActive: false },
    ];
    setWebhooks(mockWebhooks);
  }, []);

  useEffect(() => {
    generateMockSystems();
    generateMockAlerts();
    generateMockWebhooks();

    const interval = setInterval(() => {
      if (isMonitoring) {
        generateMockSystems();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isMonitoring, generateMockSystems, generateMockAlerts, generateMockWebhooks]);

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
      case "critical": return "border-red-500 bg-red-500/10";
      case "warning": return "border-amber-500 bg-amber-500/10";
      case "info": return "border-blue-500 bg-blue-500/10";
    }
  };

  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Preencha todos os campos");
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      eventTypes: newWebhook.events === "all" ? ["critical", "warning", "info"] : [newWebhook.events],
      isActive: true,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: "all" });
    setShowWebhookDialog(false);
    toast.success("Webhook adicionado com sucesso!");
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const testWebhook = (webhook: WebhookConfig) => {
    toast.info(`Testando webhook: ${webhook.name}...`);
    setTimeout(() => {
      toast.success(`Webhook ${webhook.name} respondeu com sucesso!`);
    }, 1500);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success("Alerta reconhecido");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">NOC 24/7</h1>
            <p className="text-sm text-muted-foreground">Centro de Operações de Rede</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <Switch id="monitoring" checked={isMonitoring} onCheckedChange={setIsMonitoring} />
            <Label htmlFor="monitoring" className="text-sm">
              {isMonitoring ? <Play className="h-4 w-4 inline mr-1" /> : <Pause className="h-4 w-4 inline mr-1" />}
              Monitoramento
            </Label>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <Switch id="autoRestart" checked={autoRestart} onCheckedChange={setAutoRestart} />
            <Label htmlFor="autoRestart" className="text-sm">Auto-restart</Label>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
            <Switch id="aiAutonomous" checked={aiAutonomous} onCheckedChange={setAiAutonomous} />
            <Label htmlFor="aiAutonomous" className="text-sm">IA Autônoma</Label>
          </div>

          <Badge variant={isMonitoring ? "default" : "secondary"} className={cn(isMonitoring && "animate-pulse")}>
            <span className={cn("w-2 h-2 rounded-full mr-1", isMonitoring ? "bg-success" : "bg-muted-foreground")} />
            {isMonitoring ? "ATIVO" : "PAUSADO"}
          </Badge>
        </div>
      </div>

      {/* Systems Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status dos Sistemas
          </CardTitle>
          <CardDescription>Monitoramento em tempo real de todos os serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systems.map((system) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-300",
                  system.status === "online" && "border-success/30 bg-success/5",
                  system.status === "degraded" && "border-warning/30 bg-warning/5",
                  system.status === "offline" && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{system.name}</span>
                  <span className={cn("w-3 h-3 rounded-full", getStatusColor(system.status))} />
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="font-medium">{getStatusText(system.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latência</span>
                    <span>{system.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span>{system.uptime}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas Proativos
              </div>
              <Badge variant="outline">{alerts.length} ativos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn("p-4 rounded-lg border-l-4", getAlertColor(alert.type))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">{alert.source}</Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString("pt-BR")}
                            </span>
                            {alert.webhookSent && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Send className="h-3 w-3 mr-1" />
                                Notificado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      {alert.aiSuggestion && (
                        <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
                          <p className="text-xs text-primary flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="font-medium">IA:</span> {alert.aiSuggestion}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhooks Configurados
              </div>
              <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    + Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Webhook</DialogTitle>
                    <DialogDescription>Configure um novo endpoint de notificação</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input 
                        placeholder="Ex: Slack Alertas" 
                        value={newWebhook.name}
                        onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input 
                        placeholder="https://..." 
                        value={newWebhook.url}
                        onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Eventos</Label>
                      <Select value={newWebhook.events} onValueChange={(v) => setNewWebhook({ ...newWebhook, events: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="critical">Apenas Críticos</SelectItem>
                          <SelectItem value="warning">Warning e Críticos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleAddWebhook}>
                      Adicionar Webhook
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    webhook.isActive ? "border-primary/30 bg-primary/5" : "border-muted bg-muted/50 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {webhook.name.includes("Slack") && <MessageSquare className="h-4 w-4 text-purple-500" />}
                      {webhook.name.includes("WhatsApp") && <MessageSquare className="h-4 w-4 text-emerald-500" />}
                      {webhook.name.includes("Email") && <Mail className="h-4 w-4 text-blue-500" />}
                      <span className="font-medium text-sm">{webhook.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => testWebhook(webhook)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Switch checked={webhook.isActive} onCheckedChange={() => toggleWebhook(webhook.id)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{webhook.url}</p>
                  <div className="flex items-center gap-2">
                    {webhook.eventTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-[10px]">{type}</Badge>
                    ))}
                    {webhook.lastTriggered && (
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        Último: {new Date(webhook.lastTriggered).toLocaleTimeString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NOCMonitoringCenter;
