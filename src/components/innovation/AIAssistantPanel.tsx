import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Lightbulb,
  Zap
} from "lucide-react";

interface AITask {
  id: string;
  title: string;
  status: "analyzing" | "completed" | "failed";
  progress: number;
  module: string;
  result?: string;
  estimatedTime?: string;
}

interface AIInsight {
  id: string;
  type: "optimization" | "risk" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionable: boolean;
}

export const AIAssistantPanel = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const activeTasks: AITask[] = [
    {
      id: "1",
      title: "Análise de Otimização de Rotas",
      status: "analyzing",
      progress: 67,
      module: "Logística",
      estimatedTime: "2min restantes"
    },
    {
      id: "2",
      title: "Previsão de Demanda Q1 2025",
      status: "completed",
      progress: 100,
      module: "Analytics",
      result: "Aumento de 23% previsto"
    },
    {
      id: "3",
      title: "Auditoria de Certificações",
      status: "analyzing",
      progress: 34,
      module: "RH Marítimo",
      estimatedTime: "5min restantes"
    }
  ];

  const insights: AIInsight[] = [
    {
      id: "1",
      type: "optimization",
      title: "Redução de Custos Portuários",
      description: "Alterando horários de atracação em 3 portos, economia estimada de R$ 45k/mês",
      confidence: 89,
      impact: "high",
      actionable: true
    },
    {
      id: "2",
      type: "risk",
      title: "Risco de Atraso - Rota Santos",
      description: "Condições climáticas adversas detectadas. Sugerido adiamento de 6h",
      confidence: 94,
      impact: "medium",
      actionable: true
    },
    {
      id: "3",
      type: "opportunity",
      title: "Nova Janela de Mercado",
      description: "Demanda elevada para cargas especiais no Q4. Potencial revenue +15%",
      confidence: 76,
      impact: "high",
      actionable: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "analyzing": return <Clock className="h-4 w-4 text-warning animate-pulse" />;
    case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
    case "failed": return <AlertTriangle className="h-4 w-4 text-danger" />;
    default: return <Clock className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
    case "optimization": return <TrendingUp className="h-4 w-4 text-success" />;
    case "risk": return <AlertTriangle className="h-4 w-4 text-danger" />;
    case "opportunity": return <Lightbulb className="h-4 w-4 text-warning" />;
    default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "high": return "bg-danger text-danger-foreground";
    case "medium": return "bg-warning text-warning-foreground";
    case "low": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setAiInsights(data || []);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async () => {
    if (query.trim()) {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke("smart-insights-generator", {
          body: { 
            query: query,
            context: "ai_assistant_query"
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Análise concluída!",
          description: "Nova análise foi gerada com base em sua consulta.",
        });
        
        setQuery("");
        fetchAIInsights(); // Refresh insights
      } catch (error) {
        toast({
          title: "Erro na análise",
          description: "Não foi possível processar sua consulta.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Status Overview */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Central de Inteligência Artificial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground">Análises Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Insights Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">97.3%</div>
              <div className="text-sm text-muted-foreground">Precisão Média</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">2.1s</div>
              <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Query Interface */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Consulta Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: 'Analisar eficiência da frota no último trimestre'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleQuery()}
              disabled={isProcessing}
            />
            <Button 
              onClick={handleQuery} 
              disabled={!query.trim() || isProcessing}
              className="min-w-24"
            >
              {isProcessing ? (
                <div className="animate-spin">
                  <Zap className="h-4 w-4" />
                </div>
              ) : (
                "Analisar"
              )}
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Exemplos de consultas:</p>
            <ul className="mt-2 space-y-1">
              <li>• "Comparar custos operacionais dos últimos 6 meses"</li>
              <li>• "Identificar gargalos na logística portuária"</li>
              <li>• "Prever demanda para o próximo trimestre"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Active AI Tasks */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análises em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h4 className="font-semibold">{task.title}</h4>
                  </div>
                  <Badge variant="outline">{task.module}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                  
                  {task.estimatedTime && (
                    <div className="text-sm text-muted-foreground">
                      ⏱️ {task.estimatedTime}
                    </div>
                  )}
                  
                  {task.result && (
                    <div className="text-sm font-medium text-success">
                      ✅ {task.result}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confiança
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={insight.type === "risk" ? "destructive" : insight.type === "optimization" ? "default" : "secondary"}
                    >
                      {insight.type}
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="outline" className="text-success border-success">
                        Acionável
                      </Badge>
                    )}
                  </div>
                  
                  {insight.actionable && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ignorar
                      </Button>
                      <Button size="sm">
                        Aplicar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-success">R$ 2.3M</div>
              <div className="text-sm text-muted-foreground">Economia Gerada (YTD)</div>
            </div>
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Otimizações Aplicadas</div>
            </div>
            <div className="text-center border rounded-lg p-4">
              <div className="text-2xl font-bold text-warning">98.7%</div>
              <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};