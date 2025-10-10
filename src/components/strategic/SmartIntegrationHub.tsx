import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Anchor,
  Zap,
  Globe,
  Link,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Ship,
  MapPin,
  Waves,
  Wind,
  FileText,
  BarChart3,
  Settings,
  Play,
  Pause,
  Monitor,
  Webhook,
  Brain,
  Cpu,
  Activity,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "maritime" | "weather" | "logistics" | "government" | "analytics" | "ai";
  status: "connected" | "disconnected" | "error" | "pending";
  icon: React.ElementType;
  provider: string;
  lastSync?: Date;
  dataPoints?: string[];
  apiKey?: string;
  endpoint?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "inactive";
  lastExecuted?: Date;
  executions: number;
}

const SmartIntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [activeTab, setActiveTab] = useState<"integrations" | "automations" | "monitoring">(
    "integrations"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
    loadAutomationRules();
  }, []);

  const loadIntegrations = () => {
    const mockIntegrations: Integration[] = [
      {
        id: "1",
        name: "Porto Digital API",
        description: "Integração com dados portuários em tempo real",
        category: "maritime",
        status: "connected",
        icon: Ship,
        provider: "Autoridade Portuária",
        lastSync: new Date(),
        dataPoints: ["Atracações", "Cargas", "Horários", "Berços"],
        endpoint: "https://api.porto.gov.br/v1/",
      },
      {
        id: "2",
        name: "OpenWeather Marine",
        description: "Condições meteorológicas marítimas",
        category: "weather",
        status: "connected",
        icon: Waves,
        provider: "OpenWeather",
        lastSync: new Date(),
        dataPoints: ["Ventos", "Ondas", "Temperatura", "Visibilidade"],
      },
      {
        id: "3",
        name: "Marinha do Brasil",
        description: "Avisos e regulamentações náuticas",
        category: "government",
        status: "pending",
        icon: Anchor,
        provider: "Marinha do Brasil",
        dataPoints: ["Avisos", "Regulamentos", "Cartas Náuticas"],
      },
      {
        id: "4",
        name: "AIS Global Network",
        description: "Rastreamento automático de embarcações",
        category: "maritime",
        status: "connected",
        icon: MapPin,
        provider: "AIS Network",
        lastSync: new Date(),
        dataPoints: ["Posições", "Rotas", "Velocidades", "Destinos"],
      },
      {
        id: "5",
        name: "Maritime Analytics AI",
        description: "Análise preditiva com IA para operações",
        category: "ai",
        status: "error",
        icon: Brain,
        provider: "AI Maritime Solutions",
        dataPoints: ["Previsões", "Otimizações", "Alertas", "Insights"],
      },
      {
        id: "6",
        name: "Customs Integration",
        description: "Sistema integrado de alfândega",
        category: "government",
        status: "disconnected",
        icon: FileText,
        provider: "Receita Federal",
        dataPoints: ["Declarações", "Liberações", "Impostos"],
      },
    ];

    setIntegrations(mockIntegrations);
  };

  const loadAutomationRules = () => {
    const mockRules: AutomationRule[] = [
      {
        id: "1",
        name: "Alerta de Chegada no Porto",
        trigger: "Embarcação a 10 milhas do porto",
        action: "Notificar equipe de recepção",
        status: "active",
        lastExecuted: new Date(),
        executions: 156,
      },
      {
        id: "2",
        name: "Renovação Automática de Certificados",
        trigger: "Certificado expira em 30 dias",
        action: "Iniciar processo de renovação",
        status: "active",
        lastExecuted: new Date(),
        executions: 23,
      },
      {
        id: "3",
        name: "Otimização de Rota",
        trigger: "Condições climáticas adversas",
        action: "Sugerir rota alternativa",
        status: "active",
        lastExecuted: new Date(),
        executions: 45,
      },
      {
        id: "4",
        name: "Backup Automático",
        trigger: "Todo dia às 02:00",
        action: "Backup completo do sistema",
        status: "active",
        lastExecuted: new Date(),
        executions: 365,
      },
    ];

    setAutomationRules(mockRules);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration => {
        if (integration.id === id) {
          const newStatus = integration.status === "connected" ? "disconnected" : "connected";
          toast({
            title: `Integração ${newStatus === "connected" ? "Ativada" : "Desativada"}`,
            description: `${integration.name} foi ${newStatus === "connected" ? "conectada" : "desconectada"}`,
          });
          return { ...integration, status: newStatus, lastSync: new Date() };
        }
        return integration;
      })
    );
  };

  const syncIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration => {
        if (integration.id === id) {
          toast({
            title: "Sincronização Iniciada",
            description: `Atualizando dados de ${integration.name}...`,
          });
          return { ...integration, lastSync: new Date() };
        }
        return integration;
      })
    );
  };

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev =>
      prev.map(rule => {
        if (rule.id === id) {
          const newStatus = rule.status === "active" ? "inactive" : "active";
          toast({
            title: `Automação ${newStatus === "active" ? "Ativada" : "Desativada"}`,
            description: rule.name,
          });
          return { ...rule, status: newStatus };
        }
        return rule;
      })
    );
  };

  const getStatusIcon = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Integration["status"]) => {
    const variants = {
      connected: "default",
      disconnected: "secondary",
      error: "destructive",
      pending: "outline",
    };

    const labels = {
      connected: "Conectado",
      disconnected: "Desconectado",
      error: "Erro",
      pending: "Pendente",
    };

    return (
      <Badge variant={variants[status] as any}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    );
  };

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrations
      : integrations.filter(i => i.category === selectedCategory);

  const categories = [
    { id: "all", label: "Todas", icon: Globe },
    { id: "maritime", label: "Marítimo", icon: Ship },
    { id: "weather", label: "Clima", icon: Wind },
    { id: "government", label: "Governo", icon: FileText },
    { id: "ai", label: "IA", icon: Brain },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 via-card to-nautical/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-nautical/20">
              <Link className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display">Hub de Integrações Inteligentes</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Conecte e automatize integrações com APIs externas, serviços marítimos e sistemas
            governamentais
          </p>
        </CardHeader>
      </Card>

      {/* Navegação entre tabs */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
        {[
          { id: "integrations", label: "Integrações", icon: Link },
          { id: "automations", label: "Automações", icon: Zap },
          { id: "monitoring", label: "Monitoramento", icon: Monitor },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Filtros por categoria */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Grid de Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map(integration => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.provider}</p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{integration.description}</p>

                    {integration.dataPoints && (
                      <div>
                        <p className="text-xs font-medium mb-2">Dados Disponíveis:</p>
                        <div className="flex gap-1 flex-wrap">
                          {integration.dataPoints.map((point, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Última sync: {integration.lastSync.toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={integration.status === "connected" ? "destructive" : "default"}
                        onClick={() => toggleIntegration(integration.id)}
                        className="flex-1"
                      >
                        {integration.status === "connected" ? "Desconectar" : "Conectar"}
                      </Button>

                      {integration.status === "connected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncIntegration(integration.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}

                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "automations" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Regras de Automação</h3>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </div>

          <div className="space-y-4">
            {automationRules.map(rule => (
              <Card key={rule.id} className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                          {rule.status === "active" ? (
                            <>
                              <Play className="w-3 h-3 mr-1" /> Ativa
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-1" /> Inativa
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Trigger:</strong> {rule.trigger}
                        </p>
                        <p>
                          <strong>Ação:</strong> {rule.action}
                        </p>
                        {rule.lastExecuted && (
                          <p>
                            <strong>Última execução:</strong> {rule.lastExecuted.toLocaleString()}
                          </p>
                        )}
                        <p>
                          <strong>Execuções:</strong> {rule.executions}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={rule.status === "active" ? "destructive" : "default"}
                        onClick={() => toggleAutomationRule(rule.id)}
                      >
                        {rule.status === "active" ? "Pausar" : "Ativar"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "monitoring" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-green-500" />
                  Status Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500 mb-2">94%</div>
                <p className="text-sm text-muted-foreground">Integrações funcionando</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  Requisições/h
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500 mb-2">2.4k</div>
                <p className="text-sm text-muted-foreground">Última hora</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Webhook className="w-5 h-5 text-purple-500" />
                  Automações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500 mb-2">156</div>
                <p className="text-sm text-muted-foreground">Executadas hoje</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    time: "14:32",
                    event: "Integração AIS sincronizada com sucesso",
                    status: "success",
                  },
                  {
                    time: "14:28",
                    event: "Automação de alerta de chegada executada",
                    status: "success",
                  },
                  {
                    time: "14:15",
                    event: "Falha na conexão com Maritime Analytics AI",
                    status: "error",
                  },
                  { time: "14:10", event: "Backup automático concluído", status: "success" },
                  { time: "14:05", event: "Nova regra de automação criada", status: "info" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.status === "success"
                          ? "bg-green-500"
                          : log.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <span className="text-sm">{log.event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SmartIntegrationHub;
