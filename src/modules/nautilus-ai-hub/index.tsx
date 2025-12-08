/**
 * Nautilus AI Hub - Módulo Unificado de Inteligência Artificial
 * PATCH UNIFY-2.0 - Fusão dos módulos de IA e Analytics
 * 
 * Módulos fundidos:
 * - ai-insights → Nautilus AI Hub
 * - ai-dashboard → Nautilus AI Hub
 * - predictive-insights → Nautilus AI Hub
 * - predictive-analytics → Nautilus AI Hub
 * - advanced-analytics → Nautilus AI Hub
 * - business-insights → Nautilus AI Hub
 * - ai-adoption → Nautilus AI Hub
 * - workflow-suggestions → Nautilus AI Hub
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Lightbulb, 
  Activity,
  Zap,
  MessageSquare,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Send,
  Bot
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { toast } from "sonner";

interface AIInsight {
  id: string;
  title: string;
  description: string;
  category: "operational" | "predictive" | "optimization" | "risk";
  priority: "high" | "medium" | "low";
  confidence: number;
  actionable: boolean;
  timestamp: Date;
}

interface AIMetric {
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  unit: string;
}

interface WorkflowSuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: "low" | "medium" | "high";
  status: "pending" | "accepted" | "rejected";
}

const NautilusAIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { invoke, isLoading } = useNautilusEnhancementAI();

  // Mock data - em produção viria do Supabase
  const [insights] = useState<AIInsight[]>([
    {
      id: "1",
      title: "Otimização de Rota Detectada",
      description: "A rota atual pode ser otimizada economizando 15% de combustível com desvio de 12nm",
      category: "optimization",
      priority: "high",
      confidence: 94,
      actionable: true,
      timestamp: new Date()
    },
    {
      id: "2",
      title: "Manutenção Preventiva Recomendada",
      description: "Motor principal mostra padrões que indicam necessidade de manutenção em 7 dias",
      category: "predictive",
      priority: "medium",
      confidence: 87,
      actionable: true,
      timestamp: new Date()
    },
    {
      id: "3",
      title: "Risco de Atraso em Porto",
      description: "Condições meteorológicas podem causar atraso de 4-6 horas no porto de destino",
      category: "risk",
      priority: "medium",
      confidence: 78,
      actionable: false,
      timestamp: new Date()
    }
  ]);

  const [metrics] = useState<AIMetric[]>([
    { name: "Taxa de Adoção IA", value: 78, change: 12, trend: "up", unit: "%" },
    { name: "Precisão Preditiva", value: 92, change: 3, trend: "up", unit: "%" },
    { name: "Insights Gerados", value: 234, change: 45, trend: "up", unit: "" },
    { name: "Tempo Médio Resposta", value: 1.2, change: -0.3, trend: "down", unit: "s" }
  ]);

  const [suggestions] = useState<WorkflowSuggestion[]>([
    {
      id: "1",
      title: "Automatizar Checklist Diário",
      description: "Implementar preenchimento automático baseado em sensores IoT",
      impact: "Redução de 2h/dia em tarefas manuais",
      effort: "medium",
      status: "pending"
    },
    {
      id: "2",
      title: "Alertas Inteligentes de Combustível",
      description: "Notificações automáticas quando consumo desvia do esperado",
      impact: "Economia de 8% em combustível",
      effort: "low",
      status: "accepted"
    }
  ]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);

    try {
      const response = await invoke("audit_analyze", userMessage, {
        context: "Nautilus AI Hub - Assistente de Inteligência Artificial Marítima"
      });

      if (response?.response) {
        setChatMessages(prev => [...prev, { role: "assistant", content: typeof response.response === 'string' ? response.response : JSON.stringify(response.response) }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Analisei sua solicitação. Com base nos dados disponíveis, posso ajudar com insights operacionais, previsões de manutenção, otimização de rotas e análise de riscos. Como posso ajudá-lo especificamente?"
        }]);
      }
    } catch (error) {
      toast.error("Erro ao processar consulta");
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "operational": return <Activity className="h-4 w-4" />;
      case "predictive": return <TrendingUp className="h-4 w-4" />;
      case "optimization": return <Zap className="h-4 w-4" />;
      case "risk": return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nautilus AI Hub</h1>
            <p className="text-muted-foreground">Centro de Inteligência Artificial Integrada</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          IA Online
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Preditivo
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <Zap className="h-4 w-4" />
            Automação
          </TabsTrigger>
          <TabsTrigger value="assistant" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Assistente
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{metric.name}</span>
                    <Badge 
                      variant="outline" 
                      className={metric.trend === "up" ? "text-green-400" : metric.trend === "down" ? "text-red-400" : "text-muted-foreground"}
                    >
                      {metric.trend === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(metric.change)}{metric.unit}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {metric.value}{metric.unit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos e Análises */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Atividade IA (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-10">{day}</span>
                      <Progress value={40 + Math.random() * 50} className="flex-1" />
                      <span className="text-sm text-foreground w-12">{Math.floor(20 + Math.random() * 30)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Performance por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Manutenção Preditiva", accuracy: 94, insights: 45 },
                    { name: "Otimização de Rotas", accuracy: 89, insights: 32 },
                    { name: "Análise de Riscos", accuracy: 86, insights: 28 },
                    { name: "Gestão de Tripulação", accuracy: 82, insights: 21 }
                  ].map((module) => (
                    <div key={module.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{module.name}</p>
                        <p className="text-xs text-muted-foreground">{module.insights} insights</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={module.accuracy} className="w-20" />
                        <span className="text-sm text-foreground">{module.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Insights Ativos</h2>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Novos Insights
            </Button>
          </div>

          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Brain className="h-3 w-3" />
                            {insight.confidence}% confiança
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Button size="sm">
                        Aplicar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Previsões de Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { component: "Motor Principal", days: 7, probability: 85, status: "warning" },
                    { component: "Sistema Hidráulico", days: 21, probability: 62, status: "info" },
                    { component: "Gerador Auxiliar", days: 45, probability: 45, status: "success" }
                  ].map((pred) => (
                    <div key={pred.component} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{pred.component}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {pred.days} dias estimados
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={pred.status === "warning" ? "destructive" : pred.status === "info" ? "secondary" : "default"}>
                          {pred.probability}% probabilidade
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Previsões Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Consumo de Combustível", prediction: "+3.2%", confidence: 91 },
                    { metric: "Tempo de Viagem", prediction: "+2h", confidence: 87 },
                    { metric: "Custo Operacional", prediction: "+5.4%", confidence: 83 }
                  ].map((pred) => (
                    <div key={pred.metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">{pred.metric}</p>
                        <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{pred.prediction}</p>
                        <p className="text-xs text-muted-foreground">{pred.confidence}% confiança</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sugestões de Automação</h2>
            <Badge variant="outline">{suggestions.length} sugestões ativas</Badge>
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{suggestion.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="gap-1">
                          <Target className="h-3 w-3" />
                          {suggestion.impact}
                        </Badge>
                        <Badge variant="secondary">
                          Esforço: {suggestion.effort}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {suggestion.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline">Rejeitar</Button>
                          <Button size="sm">Aceitar</Button>
                        </>
                      ) : (
                        <Badge className={suggestion.status === "accepted" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {suggestion.status === "accepted" ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Aceito</>
                          ) : (
                            "Rejeitado"
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Assistant Tab */}
        <TabsContent value="assistant" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente IA Nautilus
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Olá! Sou o assistente IA do Nautilus.</p>
                      <p className="text-sm">Posso ajudar com análises, previsões e insights operacionais.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">Processando</div>
                          <Sparkles className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <Button 
                  onClick={handleChatSubmit} 
                  disabled={isProcessing || !chatInput.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NautilusAIHub;
