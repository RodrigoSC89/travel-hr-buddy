import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Bell,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIAnalytics {
  accuracy: number;
  totalPredictions: number;
  successfulActions: number;
  processingTime: number;
  userSatisfaction: number;
  categories: {
    name: string;
    value: number;
    color: string;
  }[];
  trends: {
    period: string;
    accuracy: number;
    volume: number;
  }[];
  insights: string[];
}

export const AIAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock analytics data for demonstration
      const mockAnalytics: AIAnalytics = {
        accuracy: 94.2,
        totalPredictions: 15847,
        successfulActions: 14932,
        processingTime: 1.3,
        userSatisfaction: 4.7,
        categories: [
          { name: "Processamento de Documentos", value: 35, color: "hsl(var(--primary))" },
          { name: "Notificações Inteligentes", value: 28, color: "hsl(var(--secondary))" },
          { name: "Recomendações", value: 22, color: "hsl(var(--accent))" },
          { name: "Análise Preditiva", value: 15, color: "hsl(var(--muted))" }
        ],
        trends: [
          { period: "Jan", accuracy: 89.2, volume: 1250 },
          { period: "Fev", accuracy: 91.5, volume: 1380 },
          { period: "Mar", accuracy: 93.1, volume: 1520 },
          { period: "Abr", accuracy: 94.2, volume: 1680 },
          { period: "Mai", accuracy: 94.8, volume: 1750 }
        ],
        insights: [
          "Precisão da IA aumentou 5.6% nos últimos 3 meses",
          "Tempo de processamento reduziu em 23% com otimizações recentes",
          "Satisfação do usuário mantém-se acima de 4.5/5.0",
          "Pico de uso ocorre entre 9h-11h nos dias úteis",
          "Funcionalidades mais utilizadas: Documentos (35%) e Notificações (28%)"
        ]
      };

      setAnalytics(mockAnalytics);
      setLastUpdated(new Date());
      
      toast({
        title: "Analytics Carregadas",
        description: "Dados de IA atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar analytics de IA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return "text-green-600";
    if (accuracy >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (value: number, threshold: number) => {
    return value >= threshold ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-600" />
    );
  };

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Carregando analytics de IA...</p>
            <Button onClick={loadAnalytics} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Carregar Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics de IA</h2>
          <p className="text-muted-foreground">
            Monitoramento de performance e insights do sistema inteligente
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
            </span>
          )}
          <Button onClick={loadAnalytics} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4 text-primary" />
              Precisão Geral
              {getStatusIcon(analytics.accuracy, 90)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(analytics.accuracy)}`}>
              {analytics.accuracy}%
            </div>
            <Progress value={analytics.accuracy} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Meta: 90%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="w-4 h-4 text-info" />
              Total de Predições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {analytics.totalPredictions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-warning" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {analytics.processingTime}s
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Users className="w-4 h-4 text-success" />
              Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {analytics.userSatisfaction}/5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avaliação média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Uso por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.value}%</span>
                      </div>
                      <Progress value={category.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {((analytics.successfulActions / analytics.totalPredictions) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.successfulActions.toLocaleString()} de {analytics.totalPredictions.toLocaleString()} ações
                    </p>
                  </div>
                  <Progress 
                    value={(analytics.successfulActions / analytics.totalPredictions) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{trend.period}</p>
                      <p className="text-sm text-muted-foreground">
                        {trend.volume} predições
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getAccuracyColor(trend.accuracy)}`}>
                        {trend.accuracy}%
                      </p>
                      <p className="text-xs text-muted-foreground">precisão</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Insights Automatizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalyticsDashboard;