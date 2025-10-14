import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings,
  Zap,
  Shield,
  Clock,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Code,
  Database,
  Globe,
  Lock,
  Webhook,
  Timer,
  BarChart3,
  Brain,
  Target,
  Filter,
  Layers
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  condition: string;
  action: string;
  isActive: boolean;
  priority: "low" | "medium" | "high" | "critical";
  lastTriggered?: string;
  successRate: number;
}

interface IntegrationConfig {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>;
  authentication: {
    type: "none" | "api_key" | "bearer" | "oauth" | "basic";
    credentials: Record<string, string>;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  retry: {
    enabled: boolean;
    maxAttempts: number;
    backoffMultiplier: number;
  };
  caching: {
    enabled: boolean;
    ttlSeconds: number;
  };
  monitoring: {
    healthCheck: boolean;
    alerting: boolean;
    logging: boolean;
  };
}

export const IntegrationAutomation: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("rules");
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [config, setConfig] = useState<Partial<IntegrationConfig>>({
    method: "GET",
    headers: {},
    authentication: { type: "none", credentials: {} },
    rateLimit: { enabled: true, requestsPerMinute: 60, burstLimit: 10 },
    retry: { enabled: true, maxAttempts: 3, backoffMultiplier: 2 },
    caching: { enabled: false, ttlSeconds: 300 },
    monitoring: { healthCheck: true, alerting: true, logging: true }
  });

  const { toast } = useToast();

  const [automationRules] = useState<AutomationRule[]>([
    {
      id: "1",
      name: "Auto-Retry em Falhas",
      description: "Reexecuta automaticamente requisições que falharam com erro 5xx",
      trigger: "integration_error",
      condition: "status_code >= 500",
      action: "retry_request",
      isActive: true,
      priority: "high",
      lastTriggered: "2024-01-20T15:30:00Z",
      successRate: 85.2
    },
    {
      id: "2",
      name: "Escalação de Alertas",
      description: "Notifica equipe quando taxa de erro excede 10% em 5 minutos",
      trigger: "error_rate_threshold",
      condition: "error_rate > 10% in 5min",
      action: "send_alert",
      isActive: true,
      priority: "critical",
      lastTriggered: "2024-01-20T14:15:00Z",
      successRate: 98.7
    },
    {
      id: "3",
      name: "Renovação Automática de Token",
      description: "Renova tokens de autenticação antes do vencimento",
      trigger: "token_expiring",
      condition: "expires_in < 24h",
      action: "refresh_token",
      isActive: true,
      priority: "medium",
      lastTriggered: "2024-01-19T09:00:00Z",
      successRate: 94.1
    },
    {
      id: "4",
      name: "Cache Inteligente",
      description: "Ativa cache automaticamente para endpoints com baixa variação",
      trigger: "response_pattern",
      condition: "response_similarity > 90%",
      action: "enable_caching",
      isActive: false,
      priority: "low",
      successRate: 76.3
    },
    {
      id: "5",
      name: "Balanceamento de Carga",
      description: "Redistribui requisições quando servidor está sobrecarregado",
      trigger: "high_latency",
      condition: "response_time > 5s",
      action: "load_balance",
      isActive: true,
      priority: "high",
      lastTriggered: "2024-01-20T16:45:00Z",
      successRate: 91.8
    }
  ]);

  const triggerTypes = [
    { value: "integration_error", label: "Erro de Integração", icon: AlertTriangle },
    { value: "error_rate_threshold", label: "Limite de Taxa de Erro", icon: BarChart3 },
    { value: "token_expiring", label: "Token Expirando", icon: Clock },
    { value: "response_pattern", label: "Padrão de Resposta", icon: Brain },
    { value: "high_latency", label: "Alta Latência", icon: Timer },
    { value: "resource_usage", label: "Uso de Recursos", icon: Cpu },
    { value: "scheduled", label: "Agendado", icon: RefreshCw }
  ];

  const actionTypes = [
    { value: "retry_request", label: "Reexecutar Requisição", icon: RefreshCw },
    { value: "send_alert", label: "Enviar Alerta", icon: AlertTriangle },
    { value: "refresh_token", label: "Renovar Token", icon: Lock },
    { value: "enable_caching", label: "Ativar Cache", icon: Database },
    { value: "load_balance", label: "Balancear Carga", icon: Layers },
    { value: "scale_resources", label: "Escalar Recursos", icon: Cpu },
    { value: "circuit_breaker", label: "Circuit Breaker", icon: Shield }
  ];

  const getPriorityColor = (priority: AutomationRule["priority"]) => {
    switch (priority) {
    case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
    case "high": return "bg-warning/20 text-warning border-warning/30";
    case "medium": return "bg-primary/20 text-primary border-primary/30";
    case "low": return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleSaveConfig = () => {
    toast({
      title: "Configuração Salva",
      description: "As configurações da integração foram salvas com sucesso.",
    });
  };

  const handleToggleRule = (ruleId: string) => {
    toast({
      title: "Regra Atualizada",
      description: "Status da regra de automação foi alterado.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Automação Inteligente
              </CardTitle>
              <CardDescription>
                Configure regras automáticas e otimize suas integrações
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* Regras de Automação */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Regras de Automação</h3>
              <p className="text-sm text-muted-foreground">Configure ações automáticas baseadas em eventos</p>
            </div>
            <Button onClick={() => setIsCreatingRule(true)} className="bg-primary hover:bg-primary/90">
              <Zap className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automationRules.map((rule) => (
              <Card key={rule.id} className="border border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">{rule.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleRule(rule.id)}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(rule.priority)}>
                      {rule.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rule.successRate}% sucesso
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trigger:</span>
                      <code className="text-primary">{rule.trigger}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condição:</span>
                      <code className="text-accent">{rule.condition}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ação:</span>
                      <code className="text-success">{rule.action}</code>
                    </div>
                  </div>
                  
                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground">
                      Última execução: {new Date(rule.lastTriggered).toLocaleString("pt-BR")}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="w-3 h-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuração Avançada */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  Configuração da API
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input
                    id="endpoint"
                    value={config.endpoint || ""}
                    onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                    placeholder="https://api.exemplo.com/v1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="method">Método HTTP</Label>
                  <Select 
                    value={config.method} 
                    onValueChange={(value: IntegrationConfig["method"]) => setConfig({...config, method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lock className="w-5 h-5 text-primary" />
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Autenticação</Label>
                  <Select 
                    value={config.authentication?.type} 
                    onValueChange={(value: IntegrationConfig["authentication"]["type"]) => setConfig({
                      ...config, 
                      authentication: {
                        type: value,
                        credentials: config.authentication?.credentials || {}
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {config.authentication?.type !== "none" && (
                  <div className="space-y-2">
                    <Label htmlFor="token">Token/Chave</Label>
                    <Input
                      id="token"
                      type="password"
                      placeholder="Insira seu token ou chave de API"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Timer className="w-5 h-5 text-primary" />
                  Rate Limiting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate-limit-enabled">Ativar Rate Limiting</Label>
                  <Switch 
                    id="rate-limit-enabled"
                    checked={config.rateLimit?.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      rateLimit: {
                        enabled: checked,
                        requestsPerMinute: config.rateLimit?.requestsPerMinute || 60,
                        burstLimit: config.rateLimit?.burstLimit || 10
                      }
                    })}
                  />
                </div>
                
                {config.rateLimit?.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Requisições por Minuto: {config.rateLimit?.requestsPerMinute}</Label>
                      <Slider
                        value={[config.rateLimit?.requestsPerMinute || 60]}
                        onValueChange={([value]) => setConfig({
                          ...config,
                          rateLimit: {
                            enabled: config.rateLimit?.enabled ?? true,
                            requestsPerMinute: value,
                            burstLimit: config.rateLimit?.burstLimit || 10
                          }
                        })}
                        max={1000}
                        min={1}
                        step={10}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Limite de Burst: {config.rateLimit?.burstLimit}</Label>
                      <Slider
                        value={[config.rateLimit?.burstLimit || 10]}
                        onValueChange={([value]) => setConfig({
                          ...config,
                          rateLimit: {
                            enabled: config.rateLimit?.enabled ?? true,
                            requestsPerMinute: config.rateLimit?.requestsPerMinute || 60,
                            burstLimit: value
                          }
                        })}
                        max={100}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  Retry e Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Retry Automático</Label>
                  <Switch 
                    checked={config.retry?.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      retry: {
                        enabled: checked,
                        maxAttempts: config.retry?.maxAttempts || 3,
                        backoffMultiplier: config.retry?.backoffMultiplier || 2
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Cache de Resposta</Label>
                  <Switch 
                    checked={config.caching?.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      caching: {
                        enabled: checked,
                        ttlSeconds: config.caching?.ttlSeconds || 300
                      }
                    })}
                  />
                </div>
                
                {config.caching?.enabled && (
                  <div className="space-y-2">
                    <Label>TTL do Cache (segundos): {config.caching?.ttlSeconds}</Label>
                    <Slider
                      value={[config.caching?.ttlSeconds || 300]}
                      onValueChange={([value]) => setConfig({
                        ...config,
                        caching: {
                          enabled: config.caching?.enabled ?? false,
                          ttlSeconds: value
                        }
                      })}
                      max={3600}
                      min={60}
                      step={60}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} className="bg-primary hover:bg-primary/90">
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-primary" />
                  Otimização Automática
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">94%</div>
                  <p className="text-sm text-muted-foreground">Eficiência Geral</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cache Hit Rate</span>
                    <span className="text-foreground">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compressão</span>
                    <span className="text-foreground">76%</span>
                  </div>
                  <Progress value={76} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Connection Pool</span>
                    <span className="text-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">Otimização Detectada</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cache pode ser ativado no endpoint /users para reduzir 40% da latência
                  </p>
                </div>
                
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">Atenção</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rate limit será atingido em ~2h no ritmo atual de requisições
                  </p>
                </div>
                
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Sugestão</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Implementar connection pooling pode melhorar performance em 25%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Métricas Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-foreground">245ms</div>
                    <p className="text-xs text-muted-foreground">Latência Média</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-success">99.8%</div>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">156/min</div>
                    <p className="text-xs text-muted-foreground">Req/min</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-warning">0.2%</div>
                    <p className="text-xs text-muted-foreground">Taxa Erro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5 text-primary" />
                  Health Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Health Check Automático</Label>
                  <Switch 
                    checked={config.monitoring?.healthCheck}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      monitoring: {
                        healthCheck: checked,
                        alerting: config.monitoring?.alerting ?? true,
                        logging: config.monitoring?.logging ?? true
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Alertas por Email</Label>
                  <Switch 
                    checked={config.monitoring?.alerting}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      monitoring: {
                        healthCheck: config.monitoring?.healthCheck ?? true,
                        alerting: checked,
                        logging: config.monitoring?.logging ?? true
                      }
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Logging Detalhado</Label>
                  <Switch 
                    checked={config.monitoring?.logging}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      monitoring: {
                        healthCheck: config.monitoring?.healthCheck ?? true,
                        alerting: config.monitoring?.alerting ?? true,
                        logging: checked
                      }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="w-5 h-5 text-primary" />
                  Segurança e Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Certificado SSL</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Criptografia de Dados</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Audit Log</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Rate Limiting</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};