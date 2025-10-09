import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Clock,
  Sparkles,
  Cpu,
  Database,
  Wifi,
  RefreshCw,
  Play,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

const AdvancedAIInsights = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");

  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      title: "Otimização de Processos",
      description: "Identificadas oportunidades de melhoria no fluxo de trabalho",
      confidence: 92,
      impact: "high",
      category: "efficiency",
      recommendations: [
        "Automatizar aprovações de documentos",
        "Implementar notificações inteligentes",
        "Otimizar roteamento de tarefas",
      ],
      estimatedSavings: "25% tempo",
      status: "new",
    },
    {
      id: 2,
      title: "Padrões de Uso",
      description: "Análise comportamental dos usuários revela insights importantes",
      confidence: 87,
      impact: "medium",
      category: "user_behavior",
      recommendations: [
        "Personalizar interface por usuário",
        "Melhorar onboarding",
        "Criar dashboards específicos",
      ],
      estimatedSavings: "15% engajamento",
      status: "active",
    },
    {
      id: 3,
      title: "Predição de Demanda",
      description: "Modelo preditivo identifica picos de utilização",
      confidence: 95,
      impact: "high",
      category: "prediction",
      recommendations: [
        "Escalar recursos automaticamente",
        "Preparar equipe para picos",
        "Otimizar cache preditivo",
      ],
      estimatedSavings: "30% recursos",
      status: "implemented",
    },
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState({
    aiAccuracy: 94.5,
    predictionReliability: 91.2,
    automationEfficiency: 87.8,
    insightValue: 89.5,
    userAdoption: 76.3,
  });

  const predictiveData = [
    { day: "Seg", atual: 45, previsto: 48, usuarios: 120 },
    { day: "Ter", atual: 52, previsto: 55, usuarios: 145 },
    { day: "Qua", atual: 48, previsto: 50, usuarios: 135 },
    { day: "Qui", atual: 61, previsto: 58, usuarios: 160 },
    { day: "Sex", atual: 55, previsto: 57, usuarios: 155 },
    { day: "Sab", atual: 33, previsto: 35, usuarios: 90 },
    { day: "Dom", atual: 28, previsto: 30, usuarios: 75 },
  ];

  const radarData = [
    { subject: "Eficiência", A: 120, fullMark: 150 },
    { subject: "Qualidade", A: 98, fullMark: 150 },
    { subject: "Velocidade", A: 86, fullMark: 150 },
    { subject: "Precisão", A: 99, fullMark: 150 },
    { subject: "Inovação", A: 85, fullMark: 150 },
    { subject: "Custo", A: 65, fullMark: 150 },
  ];

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);

    toast({
      title: "Análise IA iniciada",
      description: "Processando dados e gerando insights...",
    });

    await new Promise(resolve => setTimeout(resolve, 4000));

    // Simular novos insights
    const newInsight = {
      id: Date.now(),
      title: "Novo Insight Descoberto",
      description: "IA identificou padrão emergente nos dados",
      confidence: 88,
      impact: "medium",
      category: "emerging",
      recommendations: ["Implementar nova estratégia", "Monitorar tendência", "Ajustar parâmetros"],
      estimatedSavings: "18% melhoria",
      status: "new",
    };

    setAiInsights(prev => [newInsight, ...prev]);
    setIsAnalyzing(false);

    toast({
      title: "Análise concluída",
      description: "Novos insights foram gerados pela IA",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-muted-foreground bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "active":
        return <Activity className="w-4 h-4 text-blue-600" />;
      case "new":
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "efficiency":
        return <Zap className="w-4 h-4" />;
      case "user_behavior":
        return <Users className="w-4 h-4" />;
      case "prediction":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const handleImplementInsight = (insightTitle: string) => {
    toast({
      title: "✨ Implementar Insight",
      description: `Iniciando implementação: ${insightTitle}`,
    });
    // TODO: Open implementation workflow dialog
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            IA Insights Avançados
          </h1>
          <p className="text-muted-foreground">
            Inteligência artificial para insights e otimizações inteligentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast({ title: "Relatório", description: "Exportando insights..." })}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Nova Análise
          </Button>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {performanceMetrics.aiAccuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Precisão IA</div>
              <Progress value={performanceMetrics.aiAccuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-secondary">
                {performanceMetrics.predictionReliability}%
              </div>
              <div className="text-sm text-muted-foreground">Confiabilidade</div>
              <Progress value={performanceMetrics.predictionReliability} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-accent">
                {performanceMetrics.automationEfficiency}%
              </div>
              <div className="text-sm text-muted-foreground">Automação</div>
              <Progress value={performanceMetrics.automationEfficiency} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.insightValue}%
              </div>
              <div className="text-sm text-muted-foreground">Valor Insights</div>
              <Progress value={performanceMetrics.insightValue} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.userAdoption}%
              </div>
              <div className="text-sm text-muted-foreground">Adoção</div>
              <Progress value={performanceMetrics.userAdoption} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="analysis">Análises</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map(insight => (
              <Card key={insight.id} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(insight.status)}
                          <Badge variant="outline" className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{insight.confidence}%</div>
                      <div className="text-xs text-muted-foreground">Confiança</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Recomendações:
                    </h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {insight.estimatedSavings}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImplementInsight(insight.title)}
                    >
                      Implementar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predição de Utilização</CardTitle>
                <CardDescription>Comparação entre valores reais e preditos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="atual"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      name="Atual"
                    />
                    <Line
                      type="monotone"
                      dataKey="previsto"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predito"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise Multidimensional</CardTitle>
                <CardDescription>Performance em diferentes aspectos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 150]} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BarChart3 className="w-5 h-5" />
                  Análise de Tendências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Crescimento Sustentado</p>
                  <p className="text-sm text-blue-600">+12% nos últimos 3 meses</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Padrão Sazonal</p>
                  <p className="text-sm text-blue-600">Picos identificados às terças</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Automação</p>
                  <p className="text-sm text-green-600">30% das tarefas podem ser automatizadas</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">Otimização</p>
                  <p className="text-sm text-green-600">Redução de 25% no tempo de processo</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">Gargalo Identificado</p>
                  <p className="text-sm text-orange-600">Processo de aprovação lento</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-800">Anomalia</p>
                  <p className="text-sm text-orange-600">Uso atípico nas manhãs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {[
              {
                title: "Implementar Cache Inteligente",
                description: "IA sugere estratégia de cache baseada em padrões de uso",
                priority: "high",
                effort: "medium",
                impact: "high",
              },
              {
                title: "Otimizar Fluxo de Trabalho",
                description: "Reorganizar processos com base em análise de eficiência",
                priority: "medium",
                effort: "high",
                impact: "high",
              },
              {
                title: "Personalizar Interface",
                description: "Adaptar UI baseado no comportamento do usuário",
                priority: "medium",
                effort: "low",
                impact: "medium",
              },
            ].map((rec, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className="text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">{rec.effort} effort</Badge>
                        <Badge variant={rec.impact === "high" ? "default" : "secondary"}>
                          {rec.impact} impact
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => handleImplementInsight(rec.title)}>Implementar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAIInsights;
