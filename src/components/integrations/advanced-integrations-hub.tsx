import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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
  BarChart3,
  Shield,
  Webhook,
  Brain,
  Cpu,
  Activity,
  RefreshCw,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  Clock,
  TrendingUp,
  Users,
  Lock,
  Key,
  Gauge,
  Calendar,
} from "lucide-react";
import { IntegrationMonitoring } from "./integration-monitoring";
import { IntegrationSecurity } from "./integration-security";
import { AIIntegrationAssistant } from "./ai-integration-assistant";
import { IntegrationTemplates as IntegrationTemplatesComponent } from "./integration-templates";
import { IntegrationTesting } from "./integration-testing";
import { IntegrationAutomation } from "./integration-automation";
import { SmartOptimization } from "./smart-optimization";
import { WebhookBuilder } from "./webhook-builder";
import { IntegrationMarketplace } from "./integration-marketplace";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "data" | "communication" | "payment" | "analytics" | "automation" | "ai" | "security";
  status: "connected" | "disconnected" | "error" | "configuring";
  icon: React.ElementType;
  isEnabled: boolean;
  lastSync?: string;
  config?: Record<string, any>;
  template?: boolean;
  provider: string;
  healthScore: number;
  requests24h: number;
  uptime: number;
  errorRate: number;
}

interface LogEntry {
  id: string;
  integrationId: string;
  timestamp: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  statusCode?: number;
  duration?: number;
  data?: any;
}

interface AIInsight {
  id: string;
  type: "suggestion" | "warning" | "optimization";
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

export const AdvancedIntegrationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [systemHealth, setSystemHealth] = useState(94);

  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
    loadLogs();
    loadAIInsights();
  }, []);

  const loadIntegrations = () => {
    const mockIntegrations: Integration[] = [
      {
        id: "1",
        name: "Supabase Database",
        description: "Sistema de banco de dados principal com sincronização em tempo real",
        category: "data",
        status: "connected",
        icon: Database,
        isEnabled: true,
        lastSync: "2024-01-15T10:30:00Z",
        provider: "Supabase",
        healthScore: 98,
        requests24h: 2847,
        uptime: 99.8,
        errorRate: 0.1,
        template: true,
      },
      {
        id: "2",
        name: "WhatsApp Business API",
        description: "Comunicação direta com tripulação via WhatsApp Business",
        category: "communication",
        status: "configuring",
        icon: MessageSquare,
        isEnabled: false,
        provider: "Meta",
        healthScore: 0,
        requests24h: 0,
        uptime: 0,
        errorRate: 0,
        template: true,
      },
      {
        id: "3",
        name: "Nautilus Analytics AI",
        description: "IA preditiva para análise de performance e otimização operacional",
        category: "ai",
        status: "connected",
        icon: Brain,
        isEnabled: true,
        lastSync: "2024-01-15T11:00:00Z",
        provider: "Nautilus AI",
        healthScore: 95,
        requests24h: 1243,
        uptime: 97.2,
        errorRate: 0.3,
      },
      {
        id: "4",
        name: "Stripe Payments",
        description: "Processamento seguro de pagamentos e cobrança automática",
        category: "payment",
        status: "error",
        icon: CreditCard,
        isEnabled: false,
        provider: "Stripe",
        healthScore: 45,
        requests24h: 156,
        uptime: 85.4,
        errorRate: 2.1,
        template: true,
      },
      {
        id: "5",
        name: "Microsoft Outlook",
        description: "Integração com calendário e emails corporativos",
        category: "communication",
        status: "connected",
        icon: Mail,
        isEnabled: true,
        lastSync: "2024-01-15T10:45:00Z",
        provider: "Microsoft",
        healthScore: 89,
        requests24h: 524,
        uptime: 96.7,
        errorRate: 0.8,
        template: true,
      },
      {
        id: "6",
        name: "Power BI Dashboard",
        description: "Dashboards avançados e relatórios executivos em tempo real",
        category: "analytics",
        status: "disconnected",
        icon: BarChart3,
        isEnabled: false,
        provider: "Microsoft",
        healthScore: 0,
        requests24h: 0,
        uptime: 0,
        errorRate: 0,
        template: true,
      },
    ];

    setIntegrations(mockIntegrations);
  };

  const loadLogs = () => {
    const mockLogs: LogEntry[] = [
      {
        id: "1",
        integrationId: "1",
        timestamp: new Date().toISOString(),
        type: "success",
        message: "Sincronização de dados concluída com sucesso",
        statusCode: 200,
        duration: 1250,
      },
      {
        id: "2",
        integrationId: "4",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: "error",
        message: "Falha na autenticação - Token expirado",
        statusCode: 401,
        duration: 2100,
      },
      {
        id: "3",
        integrationId: "3",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: "warning",
        message: "Taxa de requisições próxima do limite",
        statusCode: 429,
        duration: 890,
      },
    ];

    setLogs(mockLogs);
  };

  const loadAIInsights = () => {
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        type: "warning",
        title: "Token de autenticação expirado",
        description:
          "A integração Stripe está retornando erro 401. O token de autenticação precisa ser renovado.",
        confidence: 95,
        action: "Renovar token na configuração",
      },
      {
        id: "2",
        type: "suggestion",
        title: "Integração recomendada: Google Calendar",
        description:
          "Baseado no uso de alertas de viagem, recomendamos integrar com Google Calendar para melhor organização.",
        confidence: 78,
      },
      {
        id: "3",
        type: "optimization",
        title: "Otimização de cache detectada",
        description: "A configuração de cache pode ser otimizada para reduzir latência em 15%.",
        confidence: 82,
        action: "Aplicar otimização automática",
      },
    ];

    setAiInsights(mockInsights);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "connected":
      return "bg-success/10 text-success border-success/20";
    case "disconnected":
      return "bg-muted text-muted-foreground border-border";
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "configuring":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "connected":
      return <CheckCircle className="w-4 h-4" />;
    case "disconnected":
      return <Gauge className="w-4 h-4" />;
    case "error":
      return <AlertTriangle className="w-4 h-4" />;
    case "configuring":
      return <Settings className="w-4 h-4 animate-spin" />;
    default:
      return <Gauge className="w-4 h-4" />;
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? {
            ...integration,
            isEnabled: !integration.isEnabled,
            status: !integration.isEnabled ? "connected" : "disconnected",
          }
          : integration
      )
    );

    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Status Atualizado",
      description: `${integration?.name} foi ${integration?.isEnabled ? "desabilitada" : "habilitada"}`,
    });
  };

  const handleTestConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Testando Conexão",
      description: `Verificando conectividade com ${integration?.name}...`,
    });

    // Simular teste de conexão
    setTimeout(() => {
      toast({
        title: "Teste Concluído",
        description: `Conexão com ${integration?.name} está funcionando corretamente`,
      });
    }, 2000);
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.requests24h, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-nautical/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-foreground">
                  Hub de Integrações
                </CardTitle>
                <CardDescription className="text-lg">
                  Centro inteligente de conectividade e automação
                </CardDescription>
              </div>
            </div>
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Integração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Assistente de Integração</DialogTitle>
                  <DialogDescription>
                    Configure uma nova integração em poucos passos
                  </DialogDescription>
                </DialogHeader>
                <IntegrationWizard onClose={() => setIsWizardOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saúde do Sistema</p>
                <p className="text-2xl font-bold text-success">{systemHealth}%</p>
              </div>
              <Activity className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conectadas</p>
                <p className="text-2xl font-bold text-primary">{connectedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className="text-2xl font-bold text-destructive">{errorCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-nautical/20 bg-nautical/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Req. 24h</p>
                <p className="text-2xl font-bold text-nautical">{totalRequests.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-nautical" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Configurar
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Testes
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Otimização
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AISystemStatus insights={aiInsights} integrations={integrations} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar integrações..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "data", "communication", "payment", "analytics", "ai"].map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "Todas" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={handleToggleIntegration}
                onTest={handleTestConnection}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <IntegrationTemplatesComponent />
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <IntegrationMarketplace />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <WebhookBuilder />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <IntegrationTesting />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <IntegrationAutomation />
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <SmartOptimization />
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-6">
          <AIIntegrationAssistant />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <IntegrationMonitoring />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <IntegrationSecurity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente do Card de Integração
const IntegrationCard: React.FC<{
  integration: Integration;
  onToggle: (id: string) => void;
  onTest: (id: string) => void;
}> = ({ integration, onToggle, onTest }) => {
  const Icon = integration.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
    case "connected":
      return "bg-success/10 text-success border-success/20";
    case "disconnected":
      return "bg-muted text-muted-foreground border-border";
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "configuring":
      return "bg-warning/10 text-warning border-warning/20";
    default:
      return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "connected":
      return <CheckCircle className="w-4 h-4" />;
    case "disconnected":
      return <Gauge className="w-4 h-4" />;
    case "error":
      return <AlertTriangle className="w-4 h-4" />;
    case "configuring":
      return <Settings className="w-4 h-4 animate-spin" />;
    default:
      return <Gauge className="w-4 h-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group border border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{integration.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{integration.provider}</p>
            </div>
          </div>
          <Switch
            checked={integration.isEnabled}
            onCheckedChange={() => onToggle(integration.id)}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{integration.description}</p>

        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(integration.status)}>
            {getStatusIcon(integration.status)}
            <span className="ml-1 capitalize">{integration.status}</span>
          </Badge>
          {integration.template && (
            <Badge variant="outline" className="text-xs">
              Template
            </Badge>
          )}
        </div>

        {/* Métricas */}
        {integration.status === "connected" && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Saúde</p>
              <p className="font-semibold text-foreground">{integration.healthScore}%</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Req. 24h</p>
              <p className="font-semibold text-foreground">{integration.requests24h}</p>
            </div>
          </div>
        )}

        {integration.lastSync && (
          <p className="text-xs text-muted-foreground">
            Última sync: {new Date(integration.lastSync).toLocaleString("pt-BR")}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(integration.id)}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Testar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de Status do Sistema com IA
const AISystemStatus: React.FC<{
  insights: AIInsight[];
  integrations: Integration[];
}> = ({ insights, integrations }) => {
  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
              <Badge className="bg-success/20 text-success border-success/30">Operacional</Badge>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Integrações Ativas</h3>
            <p className="text-3xl font-bold text-success mb-2">
              {integrations.filter(i => i.status === "connected").length}
            </p>
            <p className="text-sm text-muted-foreground">de {integrations.length} configuradas</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Cpu className="w-8 h-8 text-primary" />
              <Badge className="bg-primary/20 text-primary border-primary/30">Em Tempo Real</Badge>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Performance</h3>
            <p className="text-3xl font-bold text-primary mb-2">
              {Math.round(
                integrations.reduce((sum, i) => sum + i.healthScore, 0) / integrations.length
              )}
              %
            </p>
            <p className="text-sm text-muted-foreground">saúde geral do sistema</p>
          </CardContent>
        </Card>

        <Card className="border-nautical/20 bg-gradient-to-br from-nautical/5 to-nautical/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-nautical" />
              <Badge className="bg-nautical/20 text-nautical border-nautical/30">IA Ativa</Badge>
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">Insights de IA</h3>
            <p className="text-3xl font-bold text-nautical mb-2">{insights.length}</p>
            <p className="text-sm text-muted-foreground">recomendações ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="w-5 h-5 text-primary" />
            Insights de IA Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.slice(0, 3).map(insight => (
              <Alert key={insight.id} className="border border-border/50">
                <Brain className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confiança
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de Templates
const IntegrationTemplates: React.FC<{
  onSelect: (template: string) => void;
}> = ({ onSelect }) => {
  const templates = [
    {
      name: "Google Calendar",
      description: "Sincronização automática de eventos e agendamentos",
      icon: Calendar,
      category: "communication",
      popular: true,
    },
    {
      name: "Slack/Teams",
      description: "Notificações e alertas em tempo real",
      icon: MessageSquare,
      category: "communication",
      popular: true,
    },
    {
      name: "Power BI",
      description: "Dashboards e relatórios executivos",
      icon: BarChart3,
      category: "analytics",
      popular: false,
    },
    {
      name: "OCR Service",
      description: "Processamento automático de documentos",
      icon: Eye,
      category: "ai",
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Templates Pré-configurados</h3>
          <p className="text-muted-foreground">Configure integrações comuns em poucos cliques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const Icon = template.icon;
          return (
            <Card
              key={template.name}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  {template.popular && (
                    <Badge className="bg-warning/20 text-warning border-warning/30">Popular</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-lg text-foreground mb-2">{template.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <Button
                  onClick={() => onSelect(template.name)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Configurar Agora
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Logs
const LogsViewer: React.FC<{
  logs: LogEntry[];
  integrations: Integration[];
}> = ({ logs, integrations }) => {
  const getLogTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
    case "success":
      return "text-success bg-success/10 border-success/20";
    case "error":
      return "text-destructive bg-destructive/10 border-destructive/20";
    case "warning":
      return "text-warning bg-warning/10 border-warning/20";
    case "info":
      return "text-info bg-info/10 border-info/20";
    default:
      return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Logs de Integração</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.map(log => {
            const integration = integrations.find(i => i.id === log.integrationId);
            return (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={getLogTypeColor(log.type)}>{log.type}</Badge>
                  <div>
                    <p className="font-medium text-foreground">{integration?.name}</p>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{new Date(log.timestamp).toLocaleTimeString("pt-BR")}</p>
                  {log.duration && <p>{log.duration}ms</p>}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de IA Insights
const AIInsightsPanel: React.FC<{
  insights: AIInsight[];
}> = ({ insights }) => {
  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
    case "suggestion":
      return "border-primary/20 bg-primary/5";
    case "warning":
      return "border-warning/20 bg-warning/5";
    case "optimization":
      return "border-success/20 bg-success/5";
    default:
      return "border-border bg-background";
    }
  };

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
    case "suggestion":
      return <Brain className="w-5 h-5 text-primary" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "optimization":
      return <TrendingUp className="w-5 h-5 text-success" />;
    default:
      return <Brain className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Análise de IA</h3>
          <p className="text-muted-foreground">
            Insights inteligentes para otimizar suas integrações
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Análise
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map(insight => (
          <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-background border border-border/50">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confiança
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{insight.description}</p>
                  {insight.action && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Componente do Assistente de Integração
const IntegrationWizard: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    endpoint: "",
    method: "GET",
    headers: {},
    auth: "",
  });

  const steps = [
    { title: "Tipo de Integração", description: "Selecione o tipo de integração" },
    { title: "Configuração", description: "Configure os parâmetros" },
    { title: "Autenticação", description: "Configure a autenticação" },
    { title: "Teste", description: "Teste a conexão" },
  ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index + 1 <= currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 ml-2 ${
                  index + 1 < currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Selecione o Tipo de Integração
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {["REST API", "Webhook", "OAuth 2.0", "Database"].map(type => (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all hover:shadow-md border ${
                    formData.type === type ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-foreground">{type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configuração Básica</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome da Integração</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Sistema ERP Interno"
                />
              </div>
              <div>
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  value={formData.endpoint}
                  onChange={e => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                  placeholder="https://api.exemplo.com/v1"
                />
              </div>
              <div>
                <Label htmlFor="method">Método HTTP</Label>
                <select
                  value={formData.method}
                  onChange={e => setFormData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Autenticação</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="auth">Tipo de Autenticação</Label>
                <select
                  value={formData.auth}
                  onChange={e => setFormData(prev => ({ ...prev, auth: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">Selecione...</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="oauth">OAuth 2.0</option>
                  <option value="apikey">API Key</option>
                </select>
              </div>
              {formData.auth && (
                <div>
                  <Label htmlFor="token">Token/Chave</Label>
                  <Input id="token" type="password" placeholder="Cole seu token aqui" />
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Teste de Conexão</h3>
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Conexão testada com sucesso! A integração está pronta para ser ativada.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        <Button
          onClick={() => {
            if (currentStep === steps.length) {
              onClose();
            } else {
              setCurrentStep(Math.min(steps.length, currentStep + 1));
            }
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {currentStep === steps.length ? "Finalizar" : "Próximo"}
        </Button>
      </div>
    </div>
  );
};
