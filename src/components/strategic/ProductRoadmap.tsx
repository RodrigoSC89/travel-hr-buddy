import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Shield, 
  Brain, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Rocket,
  BarChart3
} from "lucide-react";

interface Sprint {
  id: number;
  name: string;
  status: "completed" | "in-progress" | "planned";
  progress: number;
  startDate: string;
  endDate: string;
  objectives: string[];
  deliverables: string[];
}

interface Phase {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  sprints: Sprint[];
  status: "completed" | "in-progress" | "planned";
  overallProgress: number;
  expectedResult: string;
  color: string;
}

const roadmapData: Phase[] = [
  {
    id: 1,
    name: "Estabilização e Qualidade",
    description: "Corrigir erros, auditar funcionalidades e preparar o sistema para homologação",
    icon: <Settings className="w-6 h-6" />,
    status: "completed",
    overallProgress: 100,
    expectedResult: "Sistema estável e funcional, pronto para ser homologado por usuários-chave",
    color: "bg-success",
    sprints: [
      {
        id: 1,
        name: "Auditoria Funcional",
        status: "completed",
        progress: 100,
        startDate: "2024-01-01",
        endDate: "2024-01-14",
        objectives: ["Mapear todas as funcionalidades", "Identificar bugs críticos", "Documentar fluxos"],
        deliverables: ["Relatório de auditoria", "Lista de bugs priorizados", "Documentação técnica"]
      },
      {
        id: 2,
        name: "Correção de Bugs",
        status: "completed",
        progress: 100,
        startDate: "2024-01-15",
        endDate: "2024-01-28",
        objectives: ["Corrigir bugs críticos", "Otimizar performance", "Melhorar UX"],
        deliverables: ["Sistema estabilizado", "Testes automatizados", "Performance otimizada"]
      },
      {
        id: 3,
        name: "Homologação",
        status: "completed",
        progress: 100,
        startDate: "2024-01-29",
        endDate: "2024-02-11",
        objectives: ["Preparar checklist", "Executar testes", "Validar com usuários"],
        deliverables: ["Checklist de homologação", "Relatório de testes", "Aprovação de usuários"]
      }
    ]
  },
  {
    id: 2,
    name: "Performance e Escalabilidade",
    description: "Garantir performance sob carga real e preparar o sistema para múltiplos clientes",
    icon: <TrendingUp className="w-6 h-6" />,
    status: "completed",
    overallProgress: 100,
    expectedResult: "Sistema escalável, com estrutura pronta para múltiplos clientes e uso intenso",
    color: "bg-info",
    sprints: [
      {
        id: 4,
        name: "Simulações de Carga",
        status: "completed",
        progress: 100,
        startDate: "2024-02-12",
        endDate: "2024-02-25",
        objectives: ["Testes de stress", "Identificar gargalos", "Otimizar queries"],
        deliverables: ["Relatório de performance", "Otimizações implementadas", "Métricas de carga"]
      },
      {
        id: 5,
        name: "Multi-tenant",
        status: "completed",
        progress: 100,
        startDate: "2024-02-26",
        endDate: "2024-03-11",
        objectives: ["Estrutura multiempresa", "Isolamento de dados", "Gestão de tenants"],
        deliverables: ["Arquitetura multi-tenant", "Sistema de organizações", "Controle de acesso"]
      },
      {
        id: 6,
        name: "White Label Base",
        status: "completed",
        progress: 100,
        startDate: "2024-03-12",
        endDate: "2024-03-25",
        objectives: ["Personalização visual", "Branding por cliente", "Configurações customizáveis"],
        deliverables: ["Sistema de branding", "Temas personalizáveis", "Configurações white label"]
      }
    ]
  },
  {
    id: 3,
    name: "Inteligência e Automação",
    description: "Implementar IA, automações e assistente virtual",
    icon: <Brain className="w-6 h-6" />,
    status: "completed",
    overallProgress: 100,
    expectedResult: "Sistema proativo, com suporte inteligente e redução de esforço operacional",
    color: "bg-purple-500",
    sprints: [
      {
        id: 7,
        name: "Assistente Virtual",
        status: "completed",
        progress: 100,
        startDate: "2024-03-26",
        endDate: "2024-04-08",
        objectives: ["IA conversacional", "Assistente contextual", "Comandos de voz"],
        deliverables: ["Nautilus Copilot", "Interface de voz", "Chatbot inteligente"]
      },
      {
        id: 8,
        name: "Central de Ajuda IA",
        status: "completed",
        progress: 100,
        startDate: "2024-04-09",
        endDate: "2024-04-22",
        objectives: ["Suporte automatizado", "Base de conhecimento", "Respostas inteligentes"],
        deliverables: ["Central de ajuda inteligente", "Sistema de tickets", "Base de conhecimento"]
      },
      {
        id: 9,
        name: "Automações",
        status: "completed",
        progress: 100,
        startDate: "2024-04-23",
        endDate: "2024-05-06",
        objectives: ["Workflows automáticos", "Alertas inteligentes", "Relatórios automáticos"],
        deliverables: ["Sistema de automação", "Workflows configuráveis", "Alertas proativos"]
      }
    ]
  },
  {
    id: 4,
    name: "Métricas e Produto Comercial",
    description: "Mensurar o uso do sistema e preparar a versão comercial SaaS",
    icon: <BarChart3 className="w-6 h-6" />,
    status: "in-progress",
    overallProgress: 75,
    expectedResult: "Produto com métricas claras, estrutura comercial e gestão inteligente de clientes",
    color: "bg-warning",
    sprints: [
      {
        id: 10,
        name: "KPIs e Dashboards",
        status: "completed",
        progress: 100,
        startDate: "2024-05-07",
        endDate: "2024-05-20",
        objectives: ["Definir KPIs", "Dashboards executivos", "Métricas operacionais"],
        deliverables: ["Dashboard executivo", "KPIs definidos", "Relatórios gerenciais"]
      },
      {
        id: 11,
        name: "Estrutura Comercial",
        status: "in-progress",
        progress: 50,
        startDate: "2024-05-21",
        endDate: "2024-06-03",
        objectives: ["Planos de assinatura", "Gestão de clientes", "Billing automático"],
        deliverables: ["Planos SaaS", "Sistema de billing", "Gestão comercial"]
      }
    ]
  },
  {
    id: 5,
    name: "Confiabilidade e Escala",
    description: "Fortalecer segurança, continuidade e preparar expansão comercial",
    icon: <Shield className="w-6 h-6" />,
    status: "in-progress",
    overallProgress: 60,
    expectedResult: "Produto confiável, auditável e seguro, pronto para escalar comercialmente",
    color: "bg-destructive",
    sprints: [
      {
        id: 12,
        name: "BCP e Segurança",
        status: "in-progress",
        progress: 80,
        startDate: "2024-06-04",
        endDate: "2024-06-17",
        objectives: ["Plano de continuidade", "Backup automatizado", "Políticas de segurança"],
        deliverables: ["BCP implementado", "Sistema de backup", "Auditoria de segurança"]
      },
      {
        id: 13,
        name: "Preparação Go-to-Market",
        status: "planned",
        progress: 0,
        startDate: "2024-06-18",
        endDate: "2024-07-01",
        objectives: ["Onboarding automático", "Material de vendas", "Treinamento"],
        deliverables: ["Processo de onboarding", "Kit de vendas", "Documentação comercial"]
      }
    ]
  }
];

const ProductRoadmap: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "in-progress":
      return <Clock className="w-4 h-4 text-info" />;
    case "planned":
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "text-success bg-success/10 border-success/30";
    case "in-progress":
      return "text-info bg-info/10 border-info/30";
    case "planned":
      return "text-muted-foreground bg-muted border-border";
    default:
      return "text-muted-foreground bg-muted border-border";
    }
  };

  const currentPhase = roadmapData.find(phase => phase.id === selectedPhase);

  return (
    <div className="space-y-6">
      {/* Header com Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Fases Concluídas</p>
                <p className="text-2xl font-bold">3/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Sprints Executados</p>
                <p className="text-2xl font-bold">10/13</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Go-to-Market</p>
                <p className="text-2xl font-bold">Jun/2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline Geral</TabsTrigger>
          <TabsTrigger value="phases">Fases Detalhadas</TabsTrigger>
          <TabsTrigger value="sprints">Sprints Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roadmap de Evolução - Nautilus One</CardTitle>
              <CardDescription>
                Trilha estratégica para transformação em plataforma SaaS robusta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roadmapData.map((phase, index) => (
                  <div key={phase.id} className="relative">
                    {index < roadmapData.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${phase.color} text-azure-50`}>
                        {phase.icon}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{phase.name}</h3>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(phase.status)}
                            <Badge className={getStatusColor(phase.status)}>
                              {phase.status === "completed" ? "Concluída" : 
                                phase.status === "in-progress" ? "Em Andamento" : "Planejada"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`${phase.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${phase.overallProgress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Sprints {phase.sprints[0].id}-{phase.sprints[phase.sprints.length - 1].id}</span>
                          <span>{phase.overallProgress}% concluído</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground italic">
                          📋 {phase.expectedResult}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {roadmapData.map((phase) => (
              <Button
                key={phase.id}
                variant={selectedPhase === phase.id ? "default" : "outline"}
                onClick={() => setSelectedPhase(phase.id)}
                className="h-auto p-3 flex flex-col items-center gap-2"
              >
                {phase.icon}
                <span className="text-xs text-center">{phase.name}</span>
              </Button>
            ))}
          </div>

          {currentPhase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentPhase.color} text-azure-50`}>
                    {currentPhase.icon}
                  </div>
                  Fase {currentPhase.id}: {currentPhase.name}
                </CardTitle>
                <CardDescription>{currentPhase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progresso Geral</span>
                      <span className="text-sm text-muted-foreground">{currentPhase.overallProgress}%</span>
                    </div>
                    <Progress value={currentPhase.overallProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentPhase.sprints.map((sprint) => (
                      <Card key={sprint.id} className="border-l-4" style={{ borderLeftColor: currentPhase.color.replace("bg-", "#") }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Sprint {sprint.id}</CardTitle>
                            {getStatusIcon(sprint.status)}
                          </div>
                          <CardDescription>{sprint.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Progresso</span>
                              <span className="text-xs">{sprint.progress}%</span>
                            </div>
                            <Progress value={sprint.progress} className="h-1" />
                          </div>

                          <div>
                            <p className="text-xs font-medium mb-1">Objetivos:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {sprint.objectives.map((objective) => (
                                <li key={objective}>• {objective}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-medium mb-1">Entregas:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {sprint.deliverables.map((deliverable) => (
                                <li key={deliverable}>✓ {deliverable}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            📅 {sprint.startDate} a {sprint.endDate}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">🎯 Resultado Esperado</h4>
                    <p className="text-sm text-muted-foreground">{currentPhase.expectedResult}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-info" />
                  Sprints em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapData
                  .flatMap(phase => phase.sprints)
                  .filter(sprint => sprint.status === "in-progress")
                  .map((sprint) => (
                    <div key={sprint.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Sprint {sprint.id}: {sprint.name}</h4>
                        <Badge className="text-info bg-info/10 border-info/30">
                          Em Andamento
                        </Badge>
                      </div>
                      <Progress value={sprint.progress} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {sprint.progress}% concluído • {sprint.startDate} a {sprint.endDate}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Próximos Sprints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {roadmapData
                  .flatMap(phase => phase.sprints)
                  .filter(sprint => sprint.status === "planned")
                  .slice(0, 3)
                  .map((sprint) => (
                    <div key={sprint.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Sprint {sprint.id}: {sprint.name}</h4>
                        <Badge className="text-muted-foreground bg-gray-50 border-gray-200">
                          Planejado
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Início previsto: {sprint.startDate}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductRoadmap;