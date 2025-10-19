import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Plus,
  ExternalLink,
  Database,
  Cloud,
  Smartphone,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "data" | "communication" | "payment" | "analytics" | "automation";
  status: "connected" | "disconnected" | "error";
  icon: React.ElementType;
  isEnabled: boolean;
  lastSync?: string;
  config?: Record<string, unknown>;
}

export const IntegrationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Supabase Database",
      description: "Sistema de banco de dados principal para armazenamento e sincronização",
      category: "data",
      status: "connected",
      icon: Database,
      isEnabled: true,
      lastSync: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      name: "WhatsApp Business",
      description: "Comunicação direta com tripulação via WhatsApp",
      category: "communication",
      status: "disconnected",
      icon: MessageSquare,
      isEnabled: false
    },
    {
      id: "3",
      name: "Google Analytics",
      description: "Análise de uso e performance do sistema",
      category: "analytics",
      status: "connected",
      icon: BarChart3,
      isEnabled: true,
      lastSync: "2024-01-15T11:00:00Z"
    },
    {
      id: "4",
      name: "Stripe Payments",
      description: "Processamento de pagamentos e faturas",
      category: "payment",
      status: "error",
      icon: CreditCard,
      isEnabled: false
    },
    {
      id: "5",
      name: "OpenAI API",
      description: "Assistente de IA e análise preditiva",
      category: "automation",
      status: "connected",
      icon: Zap,
      isEnabled: true,
      lastSync: "2024-01-15T10:45:00Z"
    }
  ]);

  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
    case "connected": return "text-green-600 bg-green-100";
    case "disconnected": return "text-muted-foreground bg-muted";
    case "error": return "text-destructive bg-destructive/10";
    default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "connected": return "Conectado";
    case "disconnected": return "Desconectado";
    case "error": return "Erro";
    default: return "Desconhecido";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
    case "data": return "Dados";
    case "communication": return "Comunicação";
    case "payment": return "Pagamentos";
    case "analytics": return "Analytics";
    case "automation": return "Automação";
    default: return "Outros";
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
    
    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Integração Atualizada",
      description: `${integration?.name} foi ${integration?.isEnabled ? "desabilitada" : "habilitada"}`,
    });
  };

  const handleTestConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Testando Conexão",
      description: `Verificando conectividade com ${integration?.name}...`,
    });
  };

  const getIntegrationsByCategory = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Central de Integrações
          </h1>
          <p className="text-muted-foreground">
            Conecte e gerencie todas as integrações do sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conectadas</p>
                <p className="text-2xl font-bold">{connectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className="text-2xl font-bold">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.isEnabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="communication">Comunicação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                      </div>
                      <Switch 
                        checked={integration.isEnabled}
                        onCheckedChange={() => handleToggleIntegration(integration.id)}
                      />
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(integration.status)}>
                          {getStatusLabel(integration.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(integration.category)}
                        </Badge>
                      </div>
                      
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Última sincronização: {new Date(integration.lastSync).toLocaleString("pt-BR")}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestConnection(integration.id)}
                          className="flex-1"
                        >
                          Testar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getIntegrationsByCategory("data").map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusLabel(integration.status)}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Configurar Banco de Dados
                      </Button>
                      <Button variant="outline" className="w-full">
                        Sincronizar Dados
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getIntegrationsByCategory("communication").map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusLabel(integration.status)}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Configurar API
                      </Button>
                      <Button variant="outline" className="w-full">
                        Testar Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getIntegrationsByCategory("analytics").map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle>{integration.name}</CardTitle>
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusLabel(integration.status)}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        Ver Relatórios
                      </Button>
                      <Button variant="outline" className="w-full">
                        Configurar Tracking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Globais</CardTitle>
              <CardDescription>
                Gerencie as configurações gerais de integrações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-sincronização</p>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar automaticamente a cada 5 minutos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações de erro</p>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas quando integrações falharem
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logs detalhados</p>
                  <p className="text-sm text-muted-foreground">
                    Manter logs detalhados de todas as integrações
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};