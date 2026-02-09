/**
 * Sistema Hub Aprimorado - Configurações e Integrações
 * PATCH PREMIUM-2.0
 */

import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Lazy load premium component
const IntegrationsDashboard = lazy(() => import("@/modules/system-hub/components/IntegrationsDashboard"));
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Link, Globe, Server, Database, Shield,
  Zap, Bell, Users, Key, Cloud, CheckCircle,
  AlertTriangle, RefreshCw, Code, Webhook, Lock
} from "lucide-react";
import { toast } from "sonner";

const integrations = [
  { id: "supabase", name: "Supabase", description: "Banco de dados e autenticação", status: "connected", icon: Database, health: 100 },
  { id: "openai", name: "OpenAI GPT-4o", description: "Inteligência artificial", status: "connected", icon: Zap, health: 98 },
  { id: "mapbox", name: "Mapbox", description: "Mapas e geolocalização", status: "connected", icon: Globe, health: 100 },
  { id: "stripe", name: "Stripe", description: "Pagamentos e faturamento", status: "disconnected", icon: Shield, health: 0 },
  { id: "webhook", name: "Webhooks", description: "Integrações externas", status: "connected", icon: Webhook, health: 95 },
  { id: "api", name: "REST API", description: "API pública v1", status: "connected", icon: Code, health: 100 },
];

const systemSettings = [
  { id: "notifications", label: "Notificações Push", description: "Receber alertas em tempo real", enabled: true },
  { id: "darkMode", label: "Modo Escuro Automático", description: "Alternar baseado no horário", enabled: false },
  { id: "analytics", label: "Coleta de Analytics", description: "Métricas de uso anonimizadas", enabled: true },
  { id: "ai", label: "Sugestões de IA", description: "Insights automáticos", enabled: true },
  { id: "offline", label: "Modo Offline", description: "Sincronização quando disponível", enabled: true },
  { id: "2fa", label: "Autenticação 2FA", description: "Segurança adicional no login", enabled: false },
];

const systemHealth = [
  { name: "Frontend", status: "operational", uptime: 99.9 },
  { name: "Backend API", status: "operational", uptime: 99.8 },
  { name: "Banco de Dados", status: "operational", uptime: 99.99 },
  { name: "Edge Functions", status: "operational", uptime: 99.5 },
  { name: "Storage", status: "operational", uptime: 100 },
  { name: "Realtime", status: "operational", uptime: 99.7 },
];

const apiUsage = {
  requests: 45230,
  limit: 100000,
  period: "Fev 2026",
  breakdown: [
    { endpoint: "/api/vessels", calls: 12500, percentage: 27.6 },
    { endpoint: "/api/crew", calls: 8900, percentage: 19.7 },
    { endpoint: "/api/documents", calls: 7200, percentage: 15.9 },
    { endpoint: "/api/maintenance", calls: 6800, percentage: 15.0 },
    { endpoint: "Outros", calls: 9830, percentage: 21.8 },
  ],
};

export default function SystemHubAprimorado() {
  const [settings, setSettings] = React.useState(systemSettings);

  const handleToggle = async (id: string) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    // Persist to ai_configurations
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("ai_configurations").upsert({
      config_key: `system_setting_${id}`,
      config_value: JSON.stringify({ enabled: !settings.find(s => s.id === id)?.enabled }),
      description: `System setting: ${id}`,
    }, { onConflict: "config_key" });
    toast.success("Configuração atualizada e salva");
  };

  const handleConnect = (integration: typeof integrations[0]) => {
    if (integration.status === "connected") {
      toast.info(`${integration.name} já está conectado`);
    } else {
      toast.info(`${integration.name} requer configuração manual. Configure as credenciais na seção de integrações.`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-muted/50 via-background to-muted/50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-muted-foreground/20 to-muted text-foreground">
              <Settings className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sistema</h1>
              <p className="text-sm text-muted-foreground">Configurações, integrações e monitoramento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Saúde
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Premium Dashboard */}
          <TabsContent value="dashboard">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando dashboard...</span>
              </div>
            }>
              <IntegrationsDashboard />
            </Suspense>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integrations">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${integration.status === "connected" ? "bg-emerald-500/10" : "bg-muted"}`}>
                        <integration.icon className={`h-5 w-5 ${integration.status === "connected" ? "text-emerald-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{integration.name}</p>
                          <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                            {integration.status === "connected" ? "Conectado" : "Desconectado"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
                        {integration.status === "connected" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Saúde</span>
                              <span>{integration.health}%</span>
                            </div>
                            <Progress value={integration.health} className="h-1.5" />
                          </div>
                        )}
                        <Button 
                          variant={integration.status === "connected" ? "outline" : "default"} 
                          size="sm" 
                          className="mt-3 w-full"
                          onClick={() => handleConnect(integration)}
                        >
                          {integration.status === "connected" ? "Gerenciar" : "Conectar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Sistema</CardTitle>
                <CardDescription>Configure o comportamento geral da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch 
                        checked={setting.enabled} 
                        onCheckedChange={() => handleToggle(setting.id)} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saúde do Sistema */}
          <TabsContent value="health">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Status dos Serviços</CardTitle>
                    <CardDescription>Monitoramento em tempo real</CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Todos Operacionais
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Uptime: {service.uptime}%</span>
                        <Badge variant="outline">Operacional</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Usage */}
          <TabsContent value="api">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Uso da API</CardTitle>
                  <CardDescription>Consumo de requisições em {apiUsage.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">{apiUsage.requests.toLocaleString()}</span>
                      <span className="text-muted-foreground">/ {apiUsage.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={(apiUsage.requests / apiUsage.limit) * 100} className="h-3" />
                  </div>
                  <div className="space-y-3">
                    {apiUsage.breakdown.map((item) => (
                      <div key={item.endpoint} className="flex items-center justify-between">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{item.endpoint}</code>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{item.calls.toLocaleString()}</span>
                          <Badge variant="outline">{item.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Chaves de API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Produção</span>
                      <Badge>Ativa</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground">naut_prod_****...k7x2</code>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Desenvolvimento</span>
                      <Badge variant="secondary">Ativa</Badge>
                    </div>
                    <code className="text-xs text-muted-foreground">naut_dev_****...m3p9</code>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    <Key className="h-4 w-4 mr-2" />
                    Gerar Nova Chave
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Autenticação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação 2FA</p>
                      <p className="text-sm text-muted-foreground">Camada extra de segurança</p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                  <div className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sessões Ativas</p>
                      <p className="text-sm text-muted-foreground">3 dispositivos conectados</p>
                    </div>
                    <Button variant="outline">Gerenciar</Button>
                  </div>
                  <div className="p-4 rounded-lg border flex items-center justify-between">
                    <div>
                      <p className="font-medium">Logs de Acesso</p>
                      <p className="text-sm text-muted-foreground">Histórico de atividades</p>
                    </div>
                    <Button variant="outline">Ver Logs</Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Permissões
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Administradores</p>
                      <Badge>3</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Gerentes</p>
                      <Badge variant="secondary">8</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Acesso a operações e relatórios</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Operadores</p>
                      <Badge variant="outline">24</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Acesso limitado por módulo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
