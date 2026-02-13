/**
 * Integrations Dashboard - Premium System Hub Component
 * Gerenciamento de integrações e conectores externos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plug, 
  Settings, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Database,
  Cloud,
  Ship,
  Globe,
  Mail,
  MessageSquare,
  FileText,
  CreditCard,
  MapPin,
  Radio,
  Wifi,
  WifiOff,
  Activity,
  TrendingUp,
  BarChart3,
  Link2,
  Unlink,
  Key,
  Shield,
  Play,
  Pause,
  History,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "error" | "syncing";
  enabled: boolean;
  lastSync?: string;
  syncFrequency: string;
  dataPoints: number;
  apiCalls: number;
  apiLimit: number;
  healthScore: number;
  features: string[];
  config?: {
    apiKey?: string;
    endpoint?: string;
    webhookUrl?: string;
  };
  logs: IntegrationLog[];
}

interface IntegrationLog {
  id: string;
  type: "sync" | "error" | "warning" | "info";
  message: string;
  timestamp: string;
  details?: string;
}

// Integration configuration data - represents external system connectors
// These are not user-generated data; they describe system topology
const fallbackIntegrations: Integration[] = [
  {
    id: "1", name: "AIS Data Provider", category: "Maritime",
    description: "Dados de rastreamento AIS em tempo real para monitoramento de frotas",
    icon: Ship, status: "connected", enabled: true, lastSync: new Date().toISOString(),
    syncFrequency: "Real-time", dataPoints: 1247500, apiCalls: 45230, apiLimit: 100000, healthScore: 98,
    features: ["Posição em tempo real", "Histórico de rotas", "Alertas de zona", "Previsão de ETA"],
    config: { apiKey: "ais_****_****_7890", endpoint: "https://api.ais-provider.com/v2" },
    logs: [{ id: "l1", type: "sync", message: "Sincronização completa - 156 posições atualizadas", timestamp: new Date().toISOString() }]
  },
  {
    id: "2", name: "Weather Service", category: "Operations",
    description: "Previsões meteorológicas marítimas e alertas de tempestade",
    icon: Cloud, status: "connected", enabled: true, lastSync: new Date().toISOString(),
    syncFrequency: "Hourly", dataPoints: 85420, apiCalls: 12450, apiLimit: 50000, healthScore: 95,
    features: ["Previsão 7 dias", "Alertas de tempestade", "Condições de mar"],
    logs: [{ id: "l1", type: "warning", message: "Alerta de tempestade emitido para Atlântico Norte", timestamp: new Date().toISOString() }]
  },
  {
    id: "3", name: "Email Service (SendGrid)", category: "Communication",
    description: "Envio de emails transacionais e notificações",
    icon: Mail, status: "connected", enabled: true, lastSync: new Date().toISOString(),
    syncFrequency: "On-demand", dataPoints: 25680, apiCalls: 8750, apiLimit: 40000, healthScore: 100,
    features: ["Emails transacionais", "Templates", "Tracking", "Analytics"],
    logs: [{ id: "l1", type: "sync", message: "245 emails enviados nas últimas 24h", timestamp: new Date().toISOString() }]
  },
  {
    id: "4", name: "Port Information System", category: "Maritime",
    description: "Informações de portos, berços e serviços disponíveis",
    icon: MapPin, status: "syncing", enabled: true, lastSync: new Date().toISOString(),
    syncFrequency: "Every 6 hours", dataPoints: 12500, apiCalls: 3200, apiLimit: 10000, healthScore: 88,
    features: ["Dados de portos", "Disponibilidade de berços"],
    logs: [{ id: "l1", type: "sync", message: "Sincronizando dados de 450 portos...", timestamp: new Date().toISOString() }]
  },
  {
    id: "5", name: "Satellite Communication", category: "Communication",
    description: "Comunicação via satélite para embarcações em alto mar",
    icon: Radio, status: "error", enabled: true, lastSync: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    syncFrequency: "Real-time", dataPoints: 45000, apiCalls: 15000, apiLimit: 20000, healthScore: 45,
    features: ["Voz", "Dados", "Rastreamento", "Emergência"],
    logs: [{ id: "l1", type: "error", message: "Falha de conexão com satélite principal", timestamp: new Date().toISOString(), details: "Timeout após 30s." }]
  },
  {
    id: "6", name: "Payment Gateway (Stripe)", category: "Finance",
    description: "Processamento de pagamentos e faturamento",
    icon: CreditCard, status: "disconnected", enabled: false,
    syncFrequency: "On-demand", dataPoints: 0, apiCalls: 0, apiLimit: 25000, healthScore: 0,
    features: ["Pagamentos", "Assinaturas", "Faturas"], logs: []
  },
  {
    id: "7", name: "Document Storage (S3)", category: "Storage",
    description: "Armazenamento seguro de documentos na nuvem",
    icon: Database, status: "connected", enabled: true, lastSync: new Date().toISOString(),
    syncFrequency: "Real-time", dataPoints: 156000, apiCalls: 78500, apiLimit: 200000, healthScore: 99,
    features: ["Upload/Download", "Versionamento", "Criptografia"],
    logs: [{ id: "l1", type: "info", message: "156 GB armazenados", timestamp: new Date().toISOString() }]
  }
];

const categoryIcons: Record<string, React.ElementType> = {
  "Maritime": Ship,
  "Operations": Cloud,
  "Communication": MessageSquare,
  "Finance": CreditCard,
  "Storage": Database
};

const statusConfig = {
  connected: { label: "Conectado", color: "bg-green-500", icon: CheckCircle2 },
  disconnected: { label: "Desconectado", color: "bg-slate-500", icon: Unlink },
  error: { label: "Erro", color: "bg-red-500", icon: AlertTriangle },
  syncing: { label: "Sincronizando", color: "bg-blue-500", icon: RefreshCw }
};

export default function IntegrationsDashboard() {
  const [integrations] = useState<Integration[]>(fallbackIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(fallbackIntegrations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  const totalApiCalls = integrations.reduce((acc, i) => acc + i.apiCalls, 0);
  const avgHealthScore = integrations.filter(i => i.enabled).reduce((acc, i, _, arr) => acc + i.healthScore / arr.length, 0);

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", { 
      day: "2-digit", 
      month: "short", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(integrations.map(i => i.category))];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Link2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedCount}/{integrations.length}</p>
                <p className="text-xs text-muted-foreground">Conectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-xs text-muted-foreground">Com Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(totalApiCalls)}</p>
                <p className="text-xs text-muted-foreground">API Calls/Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgHealthScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Saúde Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Integrations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integrações
              </CardTitle>
              <Button size="sm">
                <Plug className="h-4 w-4 mr-2" />
                Nova
              </Button>
            </div>
            <Input 
              placeholder="Buscar integração..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredIntegrations.map((integration) => {
                  const IntegrationIcon = integration.icon;
                  const StatusConfig = statusConfig[integration.status];
                  const StatusIcon = StatusConfig.icon;
                  
                  return (
                    <div
                      key={integration.id}
                      onClick={() => setSelectedIntegration(integration)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedIntegration?.id === integration.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50",
                        !integration.enabled && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            integration.status === "connected" ? "bg-green-500/10" :
                            integration.status === "error" ? "bg-red-500/10" : "bg-muted"
                          )}>
                            <IntegrationIcon className={cn(
                              "h-5 w-5",
                              integration.status === "connected" ? "text-green-500" :
                              integration.status === "error" ? "text-red-500" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.category}</p>
                          </div>
                        </div>
                        <Badge className={cn("text-white text-xs", StatusConfig.color)}>
                          <StatusIcon className={cn("h-3 w-3 mr-1", integration.status === "syncing" && "animate-spin")} />
                          {StatusConfig.label}
                        </Badge>
                      </div>

                      {integration.enabled && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">API Usage</span>
                            <span>{Math.round((integration.apiCalls / integration.apiLimit) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(integration.apiCalls / integration.apiLimit) * 100} 
                            className="h-1.5" 
                          />
                          {integration.lastSync && (
                            <p className="text-xs text-muted-foreground">
                              Última sync: {formatDateTime(integration.lastSync)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Integration Details */}
        <Card className="lg:col-span-2">
          {selectedIntegration ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      selectedIntegration.status === "connected" ? "bg-green-500/10" :
                      selectedIntegration.status === "error" ? "bg-red-500/10" : "bg-muted"
                    )}>
                      <selectedIntegration.icon className={cn(
                        "h-8 w-8",
                        selectedIntegration.status === "connected" ? "text-green-500" :
                        selectedIntegration.status === "error" ? "text-red-500" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{selectedIntegration.name}</CardTitle>
                      <CardDescription>{selectedIntegration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch checked={selectedIntegration.enabled} />
                    </div>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="config">Configuração</TabsTrigger>
                    <TabsTrigger value="logs">
                      Logs
                      {selectedIntegration.logs.some(l => l.type === "error") && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">!</Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg border text-center">
                        <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{selectedIntegration.healthScore}%</p>
                        <p className="text-xs text-muted-foreground">Saúde</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{formatNumber(selectedIntegration.apiCalls)}</p>
                        <p className="text-xs text-muted-foreground">API Calls</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Database className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{formatNumber(selectedIntegration.dataPoints)}</p>
                        <p className="text-xs text-muted-foreground">Data Points</p>
                      </div>
                      <div className="p-4 rounded-lg border text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-lg font-bold">{selectedIntegration.syncFrequency}</p>
                        <p className="text-xs text-muted-foreground">Frequência</p>
                      </div>
                    </div>

                    {/* API Usage */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Uso de API</span>
                        <span className="text-muted-foreground">
                          {formatNumber(selectedIntegration.apiCalls)} / {formatNumber(selectedIntegration.apiLimit)}
                        </span>
                      </div>
                      <Progress 
                        value={(selectedIntegration.apiCalls / selectedIntegration.apiLimit) * 100} 
                        className="h-3"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.round((selectedIntegration.apiCalls / selectedIntegration.apiLimit) * 100)}% do limite mensal utilizado
                      </p>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-3">Funcionalidades</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedIntegration.features.map((feature) => (
                          <Badge key={`feat-${feature}`} variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar Agora
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Activity className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="config">
                    <div className="space-y-6">
                      {/* API Key */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          API Key
                        </label>
                        <div className="flex gap-2">
                          <Input 
                            type="password" 
                            value={selectedIntegration.config?.apiKey || ""} 
                            readOnly 
                            className="font-mono"
                          />
                          <Button variant="outline">Revelar</Button>
                          <Button variant="outline">Regenerar</Button>
                        </div>
                      </div>

                      {/* Endpoint */}
                      {selectedIntegration.config?.endpoint && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Endpoint
                          </label>
                          <Input 
                            value={selectedIntegration.config.endpoint} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                        </div>
                      )}

                      {/* Webhook */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Webhook URL (opcional)
                        </label>
                        <Input 
                          placeholder="https://sua-api.com/webhook"
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Security */}
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Segurança</span>
                        </div>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Conexão criptografada (TLS 1.3)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Autenticação OAuth 2.0
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            Rate limiting ativo
                          </li>
                        </ul>
                      </div>

                      <Button className="w-full">
                        Salvar Configurações
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="logs">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-3">
                        {selectedIntegration.logs.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum log disponível</p>
                          </div>
                        ) : (
                          selectedIntegration.logs.map((log) => (
                            <div 
                              key={log.id}
                              className={cn(
                                "p-4 rounded-lg border-l-4",
                                log.type === "error" ? "border-l-red-500 bg-red-500/5" :
                                log.type === "warning" ? "border-l-yellow-500 bg-yellow-500/5" :
                                log.type === "sync" ? "border-l-blue-500 bg-blue-500/5" :
                                "border-l-green-500 bg-green-500/5"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant={
                                    log.type === "error" ? "destructive" :
                                    log.type === "warning" ? "secondary" : "outline"
                                  } className="mb-2">
                                    {log.type.toUpperCase()}
                                  </Badge>
                                  <p className="text-sm">{log.message}</p>
                                  {log.details && (
                                    <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                  {formatDateTime(log.timestamp)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <Plug className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma integração para ver detalhes</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
