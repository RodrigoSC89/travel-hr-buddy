import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  actionType: "navigate" | "configure" | "learn" | "optimize";
  actionData?: {
    module?: string;
    action?: string;
  };
  benefits: string[];
  estimatedImpact: string;
  timeToImplement: string;
}

interface QuickAction {
  title: string;
  action: string;
  icon: string;
}

interface PersonalizedRecommendationsProps {
  context?: "dashboard" | "hr" | "travel" | "finance" | "general";
  onNavigate?: (module: string) => void;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({ 
  context = "general",
  onNavigate
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, context]);

  const generateRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: {
          userId: user.id,
          context,
          userBehavior: {
            lastLogin: new Date().toISOString(),
            activeModule: context
          },
          preferences: {
            language: "pt-BR",
            notificationsEnabled: true
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setRecommendations(data.recommendations || []);
        setInsights(data.insights || []);
        setQuickActions(data.quickActions || []);
        setLastUpdated(new Date());
        
        toast({
          title: "Recomendações Atualizadas",
          description: `${data.recommendations?.length || 0} recomendações personalizadas geradas`,
        });
      } else {
        throw new Error(data.error || "Erro ao gerar recomendações");
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      
      // Mock recommendations for demonstration
      const mockRecommendations: Recommendation[] = [
        {
          id: "1",
          title: "Configurar Alertas de Certificados",
          description: "Configure alertas automáticos para certificados que expiram em 30 dias para evitar problemas de compliance.",
          category: "Compliance",
          priority: "high",
          actionType: "configure",
          actionData: { module: "hr", action: "certificates" },
          benefits: ["Evita multas", "Melhora compliance", "Reduz riscos"],
          estimatedImpact: "Alto",
          timeToImplement: "15 minutos"
        },
        {
          id: "2",
          title: "Otimizar Gastos com Viagens",
          description: "Baseado no seu histórico, você pode economizar 23% usando nosso sistema de recomendações de voos.",
          category: "Economia",
          priority: "medium",
          actionType: "learn",
          actionData: { module: "travel", action: "flights" },
          benefits: ["Economia de custos", "Melhores opções", "Processo simplificado"],
          estimatedImpact: "Médio",
          timeToImplement: "5 minutos"
        },
        {
          id: "3",
          title: "Automatizar Relatórios Semanais",
          description: "Configure a geração automática de relatórios para economizar 2 horas por semana.",
          category: "Produtividade",
          priority: "medium",
          actionType: "configure",
          actionData: { module: "reports", action: "automation" },
          benefits: ["Economia de tempo", "Relatórios consistentes", "Menos trabalho manual"],
          estimatedImpact: "Alto",
          timeToImplement: "10 minutos"
        }
      ];

      setRecommendations(mockRecommendations);
      setInsights([
        "Você tem usado principalmente os módulos de RH e Viagens",
        "Seus alertas de preço têm 85% de efetividade",
        "Implementar automação pode economizar 5 horas por semana"
      ]);
      setQuickActions([
        { title: "Ver Certificados", action: "navigate_hr", icon: "certificate" },
        { title: "Buscar Voos", action: "navigate_travel", icon: "plane" },
        { title: "Criar Relatório", action: "navigate_reports", icon: "file-text" }
      ]);
      setLastUpdated(new Date());
      
      toast({
        title: "Usando dados simulados",
        description: "Conecte-se à API para obter recomendações reais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    if (recommendation.actionType === "navigate" && recommendation.actionData?.module) {
      onNavigate?.(recommendation.actionData.module);
      toast({
        title: "Navegando",
        description: `Abrindo módulo: ${recommendation.actionData.module}`,
      });
    } else if (recommendation.actionType === "configure") {
      // Handle configuration actions
      toast({
        title: "Configuração",
        description: "Abrindo configurações relevantes",
      });
    }
  };

  const dismissRecommendation = (id: string) => {
    setDismissedRecommendations(prev => [...prev, id]);
    toast({
      title: "Recomendação Dispensada",
      description: "Você pode atualizá-las a qualquer momento",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
    case "alto": return "text-green-600";
    case "médio": return "text-yellow-600";
    default: return "text-blue-600";
    }
  };

  const filteredRecommendations = recommendations.filter(r => !dismissedRecommendations.includes(r.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recomendações Personalizadas
            </CardTitle>
            <Button
              onClick={generateRecommendations}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {lastUpdated.toLocaleString("pt-BR")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Zap className="w-8 h-8 animate-pulse text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Gerando recomendações personalizadas...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations" className="space-y-4">
                {filteredRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma recomendação disponível no momento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRecommendations.map((recommendation) => (
                      <Card key={recommendation.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{recommendation.title}</h3>
                                <Badge className={getPriorityColor(recommendation.priority)}>
                                  {recommendation.priority}
                                </Badge>
                                <Badge variant="outline">
                                  {recommendation.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-4">
                                {recommendation.description}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Impacto</p>
                                  <p className={`text-sm font-semibold ${getImpactColor(recommendation.estimatedImpact)}`}>
                                    {recommendation.estimatedImpact}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Tempo</p>
                                  <p className="text-sm font-semibold">
                                    {recommendation.timeToImplement}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Benefícios</p>
                                  <p className="text-sm">
                                    {recommendation.benefits.length} benefícios
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Benefícios:</p>
                                <div className="flex flex-wrap gap-1">
                                  {recommendation.benefits.map((benefit, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleRecommendationAction(recommendation)}
                                  size="sm"
                                >
                                  {recommendation.actionType === "navigate" ? (
                                    <>
                                      <ArrowRight className="w-4 h-4 mr-2" />
                                      Ir para {recommendation.actionData?.module}
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Implementar
                                    </>
                                  )}
                                </Button>
                                
                                <Button
                                  onClick={() => dismissRecommendation(recommendation.id)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum insight disponível</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                {quickActions.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma ação rápida disponível</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{action.title}</h4>
                              <p className="text-xs text-muted-foreground">Ação rápida</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedRecommendations;