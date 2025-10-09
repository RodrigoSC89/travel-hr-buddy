import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Bot, Brain, Zap, Trophy, Eye, Shield, Smartphone,
  TrendingUp, BarChart3, Lightbulb, Rocket, Target, 
  MessageSquare, Workflow, TestTube, Cpu, Database, 
  Network, ChevronRight, Activity, Sparkles
} from "lucide-react";

const Innovation = () => {
  const navigate = useNavigate();

  const handleModuleAccess = (path: string) => {
    navigate(path);
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Centro de Inovação & IA"
        description="Tecnologias avançadas e inteligência artificial para o futuro marítimo"
        gradient="purple"
        badges={[
          { icon: Bot, label: "IA Avançada" },
          { icon: Rocket, label: "Inovação" },
          { icon: Sparkles, label: "Tecnologia" }
        ]}
      />

      {/* Innovation Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Bot className="h-5 w-5" />
              IA & Automação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sistemas inteligentes em operação
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">12</span>
              <Badge className="bg-blue-100 text-blue-700">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Lightbulb className="h-5 w-5" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Iniciativas em desenvolvimento
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">8</span>
              <Badge className="bg-green-100 text-green-700">Em Progresso</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Rocket className="h-5 w-5" />
              Implementações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Soluções em produção
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">24</span>
              <Badge className="bg-orange-100 text-orange-700">Produção</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              Eficiência IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Performance dos modelos
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">94.8%</span>
              <Badge className="bg-purple-100 text-purple-700">Excelente</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Innovation Modules */}
      <Tabs defaultValue="ai" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 min-w-fit">
            <TabsTrigger value="ai">
              <span className="hidden sm:inline">Inteligência Artificial</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger value="emerging">
              <span className="hidden sm:inline">Tecnologias Emergentes</span>
              <span className="sm:hidden">Emergentes</span>
            </TabsTrigger>
            <TabsTrigger value="optimization">
              <span className="hidden sm:inline">Otimização</span>
              <span className="sm:hidden">Otimização</span>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <span className="hidden sm:inline">Analytics Avançado</span>
              <span className="sm:hidden">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="automation">
              <span className="hidden sm:inline">Automação</span>
              <span className="sm:hidden">Automação</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" 
              onClick={() => handleModuleAccess("/ai-assistant")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Assistente IA
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Assistente inteligente conversacional com IA avançada
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-green-100 text-green-700">Online</Badge>
                  <span className="text-xs text-muted-foreground">98.7% precisão</span>
                </div>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  handleModuleAccess("/ai-assistant");
                }}>
                  Acessar Assistente
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" 
              onClick={() => handleModuleAccess("/predictive-analytics")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Análise Preditiva
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Previsões avançadas e insights estratégicos com machine learning
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-700">Ativo</Badge>
                  <span className="text-xs text-muted-foreground">247 predições</span>
                </div>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  handleModuleAccess("/predictive-analytics");
                }}>
                  Ver Predições
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-green-500" />
                  Automação Inteligente
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Workflows automatizados com decisões baseadas em IA
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-green-100 text-green-700">24 workflows</Badge>
                  <span className="text-xs text-muted-foreground">89% eficiência</span>
                </div>
                <Button className="w-full" variant="outline">Em Breve</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-orange-500" />
                  Laboratório de Modelos
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Treinamento e teste de modelos de machine learning
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-orange-100 text-orange-700">12 modelos</Badge>
                  <span className="text-xs text-muted-foreground">6 em treinamento</span>
                </div>
                <Button className="w-full" variant="outline">Acessar Lab</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-red-500" />
                  Processamento IA
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Análise de dados em tempo real com processamento distribuído
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-red-100 text-red-700">GPU Acelerado</Badge>
                  <span className="text-xs text-muted-foreground">1.2TB processados</span>
                </div>
                <Button className="w-full" variant="outline">Ver Status</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-500" />
                  Lago de Dados IA
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Repositório centralizado de dados para treinamento de IA
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-cyan-100 text-cyan-700">45.7TB</Badge>
                  <span className="text-xs text-muted-foreground">Estruturado</span>
                </div>
                <Button className="w-full" variant="outline">Explorar Dados</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emerging" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-500" />
                  Realidade Aumentada
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Interfaces imersivas para manutenção e treinamento
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-indigo-100 text-indigo-700">Beta</Badge>
                  <span className="text-xs text-muted-foreground">3 aplicações</span>
                </div>
                <Button className="w-full" variant="outline">Explorar AR</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Blockchain
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Segurança e transparência distribuída para documentos
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700">Seguro</Badge>
                  <span className="text-xs text-muted-foreground">1,247 transações</span>
                </div>
                <Button className="w-full" variant="outline">Acessar Blockchain</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => handleModuleAccess("/iot")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  IoT Dashboard
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Internet das Coisas e monitoramento de dispositivos em tempo real
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-700">342 dispositivos</Badge>
                  <span className="text-xs text-muted-foreground">99.2% online</span>
                </div>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  handleModuleAccess("/iot");
                }}>
                  Ver Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-500" />
                  Edge Computing
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Processamento distribuído na borda da rede
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-purple-100 text-purple-700">15 nós</Badge>
                  <span className="text-xs text-muted-foreground">4ms latência</span>
                </div>
                <Button className="w-full" variant="outline">Gerenciar Nós</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-pink-500" />
                  Computação Quântica
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Simulações avançadas para otimização de rotas
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-pink-100 text-pink-700">Experimental</Badge>
                  <span className="text-xs text-muted-foreground">Em pesquisa</span>
                </div>
                <Button className="w-full" variant="outline">Ver Projetos</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  IA Generativa
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Geração automática de documentos e relatórios
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-yellow-100 text-yellow-700">GPT-4</Badge>
                  <span className="text-xs text-muted-foreground">156 docs gerados</span>
                </div>
                <Button className="w-full" variant="outline">Criar Conteúdo</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Otimização de Performance
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Análise e otimização automática de sistemas
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-yellow-100 text-yellow-700">96.8% eficiência</Badge>
                  <span className="text-xs text-muted-foreground">12 otimizações ativas</span>
                </div>
                <Button className="w-full">Otimizar Sistema</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  Gamificação
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Engajamento através de mecânicas de jogos
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-orange-100 text-orange-700">247 usuários ativos</Badge>
                  <span className="text-xs text-muted-foreground">8 conquistas</span>
                </div>
                <Button className="w-full">Ver Gamificação</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Analytics Avançado
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Análises aprofundadas com visualizações interativas
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-700">47 dashboards</Badge>
                  <span className="text-xs text-muted-foreground">Real-time</span>
                </div>
                <Button className="w-full">Ver Analytics</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Insights de Negócio
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Inteligência de negócio e análise de tendências
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-green-100 text-green-700">342 insights</Badge>
                  <span className="text-xs text-muted-foreground">AI-powered</span>
                </div>
                <Button className="w-full">Ver Insights</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5 text-purple-500" />
                  Workflows Automatizados
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Automação completa de processos operacionais
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-purple-100 text-purple-700">24 workflows</Badge>
                  <span className="text-xs text-muted-foreground">89% automação</span>
                </div>
                <Button className="w-full" variant="outline">Gerenciar</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  RPA (Automação Robótica)
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Bots inteligentes para tarefas repetitivas
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-red-100 text-red-700">12 bots ativos</Badge>
                  <span className="text-xs text-muted-foreground">345 tarefas/dia</span>
                </div>
                <Button className="w-full" variant="outline">Configurar</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Triggers Inteligentes
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ações automáticas baseadas em eventos e condições
                </p>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-yellow-100 text-yellow-700">67 triggers</Badge>
                  <span className="text-xs text-muted-foreground">99.8% precisão</span>
                </div>
                <Button className="w-full" variant="outline">Configurar Triggers</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default Innovation;