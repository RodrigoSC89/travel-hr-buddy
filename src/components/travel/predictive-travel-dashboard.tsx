import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  DollarSign,
  Target,
  Calendar,
  Plane,
  Hotel,
  Bell,
  BarChart3,
  Lightbulb,
  Zap
} from "lucide-react";

interface PredictionData {
  current_avg_price: number;
  predicted_price: number;
  price_trend: "rising" | "falling" | "stable";
  confidence_score: number;
  best_booking_window_start: string;
  best_booking_window_end: string;
  recommendation: string;
  demand_level: string;
}

interface PriceAlert {
  id: string;
  type: string;
  route_or_destination: string;
  target_price: number;
  current_price: number;
  alert_type: string;
  status: string;
  travel_date: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  recommendation_type: string;
  priority: string;
  estimated_savings: number;
  action_deadline: string;
  is_active?: boolean;
}

export const PredictiveTravelDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchRoute, setSearchRoute] = useState("GRU-SDU");
  const [searchType, setSearchType] = useState("flight");

  // Estados para criar alertas
  const [newAlert, setNewAlert] = useState({
    route: "",
    targetPrice: "",
    travelDate: "",
    type: "flight"
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      await Promise.all([
        loadRecommendations(),
        loadAlerts()
      ]);
    } catch (error) {
      // Error loading user data
    }
  };

  const loadRecommendations = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "get_recommendations",
          data: { userId: userData.user.id }
        }
      });

      if (error) throw error;
      setRecommendations(data.data || []);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("travel_price_alerts")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const generatePrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "generate_predictions",
          type: searchType,
          route: searchRoute
        }
      });

      if (error) throw error;
      
      setPredictions(data.data);
      toast({
        title: "Análise Concluída",
        description: `Predições geradas para ${searchType === "flight" ? "voos" : "hotéis"} - ${searchRoute}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar predições. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar alertas.",
          variant: "destructive"
        });
        return;
      }

      if (!newAlert.route || !newAlert.targetPrice) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha rota e preço alvo.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "create_price_alert",
          data: {
            userId: userData.user.id,
            type: newAlert.type,
            route: newAlert.route,
            targetPrice: parseFloat(newAlert.targetPrice),
            currentPrice: predictions?.current_avg_price || 0,
            alertType: "price_drop",
            travelDate: newAlert.travelDate || null
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Alerta Criado",
        description: "Você será notificado quando o preço atingir o valor desejado."
      });

      setNewAlert({ route: "", targetPrice: "", travelDate: "", type: "flight" });
      loadAlerts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar alerta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "rising": return <TrendingUp className="h-4 w-4 text-red-500" />;
    case "falling": return <TrendingDown className="h-4 w-4 text-green-500" />;
    default: return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
    case "rising": return "text-red-600";
    case "falling": return "text-green-600";
    default: return "text-yellow-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 border-red-200";
    case "high": return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const statsData = [
    {
      title: "Alertas Ativos",
      value: alerts.length.toString(),
      icon: Bell,
      variant: "default" as const
    },
    {
      title: "Recomendações",
      value: recommendations.filter(r => r.is_active !== false).length.toString(),
      icon: Lightbulb,
      variant: "success" as const
    },
    {
      title: "Economia Potencial",
      value: formatCurrency(recommendations.reduce((acc, r) => acc + (r.estimated_savings || 0), 0)),
      icon: DollarSign,
      variant: "ocean" as const
    },
    {
      title: "Precisão IA",
      value: predictions ? `${Math.round(predictions.confidence_score * 100)}%` : "0%",
      icon: Target,
      variant: "warning" as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Análise Preditiva de Viagens
          </h1>
          <p className="text-muted-foreground mt-1">
            IA avançada para otimizar suas compras de viagens
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Tab: Predições */}
        <TabsContent value="predictions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Buscar Predições */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Gerar Análise Preditiva</CardTitle>
                <CardDescription>
                  Análise de preços com IA para sua rota
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search-type">Tipo</Label>
                  <select
                    id="search-type"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="flight">Voos</option>
                    <option value="hotel">Hotéis</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="search-route">
                    {searchType === "flight" ? "Rota (ex: GRU-SDU)" : "Destino (ex: Rio de Janeiro)"}
                  </Label>
                  <Input
                    id="search-route"
                    value={searchRoute}
                    onChange={(e) => setSearchRoute(e.target.value)}
                    placeholder={searchType === "flight" ? "GRU-SDU" : "Rio de Janeiro"}
                  />
                </div>
                <Button
                  onClick={generatePrediction}
                  disabled={loading || !searchRoute}
                  className="w-full gradient-ocean"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-100 mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Gerar Predição
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados da Predição */}
            <div className="lg:col-span-2 space-y-6">
              {predictions ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getTrendIcon(predictions.price_trend)}
                        Análise de Preços - {searchRoute}
                      </CardTitle>
                      <CardDescription>
                        Predição gerada com {Math.round(predictions.confidence_score * 100)}% de confiança
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(predictions.current_avg_price)}
                          </div>
                          <div className="text-sm text-muted-foreground">Preço Atual Médio</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className={`text-2xl font-bold ${getTrendColor(predictions.price_trend)}`}>
                            {formatCurrency(predictions.predicted_price)}
                          </div>
                          <div className="text-sm text-muted-foreground">Preço Previsto</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          🤖 Recomendação da IA
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          {predictions.recommendation}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant={predictions.price_trend === "rising" ? "destructive" : predictions.price_trend === "falling" ? "default" : "secondary"}>
                          Tendência: {predictions.price_trend === "rising" ? "Alta" : predictions.price_trend === "falling" ? "Baixa" : "Estável"}
                        </Badge>
                        <Badge variant="outline">
                          Demanda: {predictions.demand_level}
                        </Badge>
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          Melhor período: {formatDate(predictions.best_booking_window_start)} - {formatDate(predictions.best_booking_window_end)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gere sua primeira predição</h3>
                    <p className="text-muted-foreground">
                      Escolha uma rota e tipo de viagem para começar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Alerta de Preço</CardTitle>
                <CardDescription>
                  Seja notificado quando o preço atingir seu valor alvo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo</Label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="flight">Voo</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
                <div>
                  <Label>Rota/Destino</Label>
                  <Input
                    value={newAlert.route}
                    onChange={(e) => setNewAlert({ ...newAlert, route: e.target.value })}
                    placeholder="GRU-SDU ou Rio de Janeiro"
                  />
                </div>
                <div>
                  <Label>Preço Alvo (R$)</Label>
                  <Input
                    type="number"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                    placeholder="300"
                  />
                </div>
                <div>
                  <Label>Data da Viagem (opcional)</Label>
                  <Input
                    type="date"
                    value={newAlert.travelDate}
                    onChange={(e) => setNewAlert({ ...newAlert, travelDate: e.target.value })}
                  />
                </div>
                <Button onClick={createAlert} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Criar Alerta
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Seus Alertas Ativos</CardTitle>
                  <CardDescription>
                    {alerts.length} alertas monitorando preços
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {alert.type === "flight" ? (
                              <Plane className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Hotel className="h-4 w-4 text-green-500" />
                            )}
                            <div>
                              <div className="font-medium">{alert.route_or_destination}</div>
                              <div className="text-sm text-muted-foreground">
                                Alvo: {formatCurrency(alert.target_price)}
                                {alert.travel_date && ` • ${formatDate(alert.travel_date)}`}
                              </div>
                            </div>
                          </div>
                          <Badge variant={alert.status === "active" ? "default" : "secondary"}>
                            {alert.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum alerta ativo</h3>
                      <p className="text-muted-foreground">
                        Crie seu primeiro alerta para ser notificado sobre oportunidades de preços
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Recomendações */}
        <TabsContent value="recommendations">
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          {rec.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {rec.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority === "urgent" ? "Urgente" : 
                            rec.priority === "high" ? "Alta" :
                              rec.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                        {rec.estimated_savings && (
                          <div className="text-sm font-medium text-green-600">
                            Economia: {formatCurrency(rec.estimated_savings)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {rec.action_deadline && (
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Prazo para ação: {formatDate(rec.action_deadline)}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação disponível</h3>
                  <p className="text-muted-foreground">
                    Execute algumas análises preditivas para receber recomendações personalizadas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Insights de Economia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica Semanal:</strong> Terças e quartas-feiras têm preços 12% menores em média para voos domésticos.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sazonalidade:</strong> Hotéis no Rio ficam 25% mais caros durante eventos como Rock in Rio e Carnaval.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Antecedência:</strong> Reservar voos com 3-6 semanas de antecedência pode economizar até 30%.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Estatísticas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Predições Geradas</span>
                  <span className="font-medium">1.2k+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Economia Total dos Usuários</span>
                  <span className="font-medium text-green-600">R$ 157.5k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precisão Média da IA</span>
                  <span className="font-medium">87.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Alertas Enviados</span>
                  <span className="font-medium">3.4k+</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};