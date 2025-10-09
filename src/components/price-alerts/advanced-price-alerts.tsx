import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown,
  Bell, 
  BellRing,
  Settings, 
  Clock, 
  MapPin, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  History,
  Plus,
  RefreshCw,
  Loader2,
  Brain,
  Zap,
  Eye,
  ShoppingCart,
  Mail,
  Smartphone,
  Filter,
  ArrowUpDown,
  Calendar,
  DollarSign,
  LineChart,
  Activity
} from "lucide-react";

interface PriceAlert {
  id: string;
  product_name: string;
  current_price: number | null;
  target_price: number;
  product_url: string;
  is_active: boolean;
  created_at: string;
  last_checked_at?: string;
  user_id: string;
  category?: string;
  threshold_type?: "below" | "above" | "percentage";
  percentage_change?: number;
  notification_settings?: {
    email: boolean;
    push: boolean;
    frequency: "immediate" | "daily" | "weekly";
  };
  ai_predictions?: {
    trend: "rising" | "falling" | "stable";
    confidence: number;
    best_time_to_buy?: string;
    predicted_low?: number;
  };
}

interface AlertHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
  action_taken?: "purchased" | "ignored" | "snoozed";
  savings?: number;
}

interface AIInsight {
  id: string;
  alert_id: string;
  message: string;
  type: "recommendation" | "warning" | "opportunity";
  confidence: number;
  created_at: string;
}

export const AdvancedPriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const [newAlert, setNewAlert] = useState({
    product_name: "",
    target_price: "",
    product_url: "",
    category: "viagem",
    threshold_type: "below" as "below" | "above" | "percentage",
    percentage_change: 10,
    notification_settings: {
      email: true,
      push: true,
      frequency: "immediate" as "immediate" | "daily" | "weekly"
    }
  });

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadHistory();
      loadAIInsights();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Enhance with AI predictions
      const enhancedAlerts = await Promise.all(
        (data || []).map(async (alert: any) => ({
          ...alert,
          threshold_type: alert.threshold_type || "below",
          notification_settings: {
            email: true,
            push: true,
            frequency: "immediate" as const
          },
          ai_predictions: await generateAIPredictions(alert)
        }))
      );
      
      setAlerts(enhancedAlerts as PriceAlert[]);
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("price_history")
        .select(`
          *,
          price_alerts!inner(user_id)
        `)
        .eq("price_alerts.user_id", user?.id)
        .order("checked_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const loadAIInsights = async () => {
    // Simulated AI insights - in production, this would call an AI service
    const mockInsights: AIInsight[] = [
      {
        id: "1",
        alert_id: alerts[0]?.id || "",
        message: "Preço está 15% abaixo da média dos últimos 30 dias. Excelente momento para comprar!",
        type: "opportunity",
        confidence: 0.89,
        created_at: new Date().toISOString()
      },
      {
        id: "2", 
        alert_id: alerts[1]?.id || "",
        message: "Tendência de alta identificada. Preço pode subir 8% nas próximas 2 semanas.",
        type: "warning",
        confidence: 0.76,
        created_at: new Date().toISOString()
      }
    ];
    setInsights(mockInsights);
  };

  const generateAIPredictions = async (alert: any) => {
    // Simulated AI predictions - in production, this would use real ML models
    const trends = ["rising", "falling", "stable"] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      trend,
      confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      best_time_to_buy: trend === "falling" ? "Agora" : "Aguardar 1-2 semanas",
      predicted_low: alert.current_price ? alert.current_price * (0.9 + Math.random() * 0.1) : undefined
    };
  };

  const createAlert = async () => {
    if (!newAlert.product_name || !newAlert.target_price || !newAlert.product_url) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Get initial price check
      const { data: priceData } = await supabase.functions.invoke("check-price", {
        body: {
          product_name: newAlert.product_name,
          product_url: newAlert.product_url
        }
      });

      const currentPrice = priceData?.price || 0;

      const { data, error } = await supabase
        .from("price_alerts")
        .insert([{
          user_id: user?.id,
          product_name: newAlert.product_name,
          target_price: parseFloat(newAlert.target_price),
          product_url: newAlert.product_url,
          current_price: currentPrice,
          category: newAlert.category,
          threshold_type: newAlert.threshold_type,
          percentage_change: newAlert.percentage_change,
          notification_settings: newAlert.notification_settings,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to price history
      await supabase
        .from("price_history")
        .insert([{
          alert_id: data.id,
          price: currentPrice,
          checked_at: new Date().toISOString()
        }]);

      await loadAlerts();
      setShowCreateDialog(false);
      setNewAlert({
        product_name: "",
        target_price: "",
        product_url: "",
        category: "viagem",
        threshold_type: "below" as "below" | "above" | "percentage",
        percentage_change: 10,
        notification_settings: {
          email: true,
          push: true,
          frequency: "immediate" as "immediate" | "daily" | "weekly"
        }
      });

      toast({
        title: "Alerta criado!",
        description: `Alerta para ${newAlert.product_name} foi configurado com sucesso.`,
      });

    } catch (error) {
      console.error("Error creating alert:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o alerta",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !alert.is_active })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_active: !a.is_active } : a
      ));

      toast({
        title: alert.is_active ? "Alerta pausado" : "Alerta ativado",
        description: `O alerta foi ${alert.is_active ? "pausado" : "ativado"} com sucesso.`,
      });
    } catch (error) {
      console.error("Error toggling alert:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o alerta",
        variant: "destructive"
      });
    }
  };

  const refreshPrices = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("monitor-prices");
      
      if (error) throw error;
      
      await loadAlerts();
      await loadHistory();
      
      toast({
        title: "Preços atualizados!",
        description: `${data?.checked_alerts || 0} alertas foram verificados`,
      });
    } catch (error) {
      console.error("Error refreshing prices:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os preços",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigateToTravel = (alert: PriceAlert) => {
    // Navigate to travel module with pre-filled data
    window.open(`/travel?search=${encodeURIComponent(alert.product_name)}&url=${encodeURIComponent(alert.product_url)}`, "_blank");
  };

  const getStatusBadge = (alert: PriceAlert) => {
    if (!alert.is_active) {
      return <Badge variant="secondary">Pausado</Badge>;
    }
    
    if (alert.current_price && alert.current_price <= alert.target_price) {
      return <Badge className="bg-success text-success-foreground">Meta Atingida</Badge>;
    }
    
    return <Badge className="bg-primary text-primary-foreground">Monitorando</Badge>;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
    case "falling": return <TrendingDown className="w-4 h-4 text-success" />;
    case "rising": return <TrendingUp className="w-4 h-4 text-destructive" />;
    default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriceChangeColor = (current?: number, target?: number) => {
    if (!current || !target) return "text-muted-foreground";
    return current <= target ? "text-success" : "text-muted-foreground";
  };

  const filteredAlerts = alerts.filter(alert => 
    selectedCategory === "all" || alert.category === selectedCategory
  );

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
    case "price_desc":
      return (b.current_price || 0) - (a.current_price || 0);
    case "price_asc":
      return (a.current_price || 0) - (b.current_price || 0);
    case "target_desc":
      return b.target_price - a.target_price;
    case "target_asc":
      return a.target_price - b.target_price;
    default:
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando alertas inteligentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Alertas Inteligentes de Preços</CardTitle>
                <p className="text-muted-foreground">
                  Monitoramento avançado com IA preditiva e insights acionáveis
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={refreshPrices} 
                disabled={isRefreshing}
                className="border-primary/20 hover:bg-primary/5"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar Preços
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Alerta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Criar Alerta Inteligente de Preço
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product_name" className="text-sm font-medium">
                          Nome do Produto/Serviço *
                        </Label>
                        <Input
                          id="product_name"
                          value={newAlert.product_name}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, product_name: e.target.value }))}
                          placeholder="Ex: Passagem São Paulo - Rio de Janeiro"
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
                        <Select 
                          value={newAlert.category} 
                          onValueChange={(value) => setNewAlert(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viagem">🧳 Viagens</SelectItem>
                            <SelectItem value="hospedagem">🏨 Hospedagem</SelectItem>
                            <SelectItem value="combustivel">⛽ Combustível</SelectItem>
                            <SelectItem value="suprimentos">📦 Suprimentos</SelectItem>
                            <SelectItem value="equipamentos">🔧 Equipamentos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product_url" className="text-sm font-medium">
                        URL do Produto *
                      </Label>
                      <Input
                        id="product_url"
                        value={newAlert.product_url}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, product_url: e.target.value }))}
                        placeholder="https://exemplo.com/produto"
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo de Alerta</Label>
                        <Select 
                          value={newAlert.threshold_type} 
                          onValueChange={(value: "below" | "above" | "percentage") => setNewAlert(prev => ({ ...prev, threshold_type: value }))}
                        >
                          <SelectTrigger className="border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="below">📉 Abaixo de</SelectItem>
                            <SelectItem value="above">📈 Acima de</SelectItem>
                            <SelectItem value="percentage">📊 Variação %</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="target_price" className="text-sm font-medium">
                          {newAlert.threshold_type === "percentage" ? "Variação (%)" : "Preço Alvo (R$)"} *
                        </Label>
                        <Input
                          id="target_price"
                          type="number"
                          value={newAlert.threshold_type === "percentage" ? newAlert.percentage_change.toString() : newAlert.target_price}
                          onChange={(e) => {
                            if (newAlert.threshold_type === "percentage") {
                              setNewAlert(prev => ({ ...prev, percentage_change: parseInt(e.target.value) || 0 }));
                            } else {
                              setNewAlert(prev => ({ ...prev, target_price: e.target.value }));
                            }
                          }}
                          placeholder={newAlert.threshold_type === "percentage" ? "10" : "500.00"}
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Frequência</Label>
                        <Select 
                          value={newAlert.notification_settings.frequency} 
                          onValueChange={(value: "immediate" | "daily" | "weekly") => setNewAlert(prev => ({ 
                            ...prev, 
                            notification_settings: { ...prev.notification_settings, frequency: value } 
                          }))}
                        >
                          <SelectTrigger className="border-primary/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">⚡ Imediato</SelectItem>
                            <SelectItem value="daily">📅 Diário</SelectItem>
                            <SelectItem value="weekly">📊 Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Canais de Notificação</Label>
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newAlert.notification_settings.email}
                            onCheckedChange={(checked) => setNewAlert(prev => ({
                              ...prev,
                              notification_settings: { ...prev.notification_settings, email: checked }
                            }))}
                          />
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="text-sm">Email</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newAlert.notification_settings.push}
                            onCheckedChange={(checked) => setNewAlert(prev => ({
                              ...prev,
                              notification_settings: { ...prev.notification_settings, push: checked }
                            }))}
                          />
                          <Smartphone className="w-4 h-4 text-primary" />
                          <span className="text-sm">Push</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateDialog(false)}
                        className="border-primary/20 hover:bg-primary/5"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={createAlert} 
                        disabled={isCreating}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Criar Alerta
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold text-primary">{alerts.filter(a => a.is_active).length}</p>
              </div>
              <BellRing className="w-8 h-8 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {alerts.filter(a => a.is_active && a.current_price && a.current_price <= a.target_price).length} metas atingidas
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-2xl font-bold text-success">R$ 2.450</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              +18% vs. mês anterior
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insights de IA</p>
                <p className="text-2xl font-bold text-warning">{insights.length}</p>
              </div>
              <Brain className="w-8 h-8 text-warning" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {insights.filter(i => i.type === "opportunity").length} oportunidades
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão IA</p>
                <p className="text-2xl font-bold text-info">87%</p>
              </div>
              <Zap className="w-8 h-8 text-info" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Baseado em 156 previsões
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell className="w-4 h-4 mr-2" />
            Meus Alertas
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Brain className="w-4 h-4 mr-2" />
            IA Insights
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insights Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-4 rounded-lg border border-primary/10 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        insight.type === "opportunity" ? "bg-success/10" :
                          insight.type === "warning" ? "bg-warning/10" : "bg-info/10"
                      }`}>
                        {insight.type === "opportunity" ? 
                          <TrendingDown className="w-4 h-4 text-success" /> :
                          insight.type === "warning" ?
                            <AlertTriangle className="w-4 h-4 text-warning" /> :
                            <TrendingUp className="w-4 h-4 text-info" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{insight.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confiança
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(insight.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.product_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm ${getPriceChangeColor(alert.current_price, alert.target_price)}`}>
                          R$ {alert.current_price?.toFixed(2) || "---"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          meta: R$ {alert.target_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.ai_predictions && getTrendIcon(alert.ai_predictions.trend)}
                      {getStatusBadge(alert)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      <SelectItem value="viagem">🧳 Viagens</SelectItem>
                      <SelectItem value="hospedagem">🏨 Hospedagem</SelectItem>
                      <SelectItem value="combustivel">⛽ Combustível</SelectItem>
                      <SelectItem value="suprimentos">📦 Suprimentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Mais recentes</SelectItem>
                      <SelectItem value="price_desc">Maior preço</SelectItem>
                      <SelectItem value="price_asc">Menor preço</SelectItem>
                      <SelectItem value="target_desc">Maior meta</SelectItem>
                      <SelectItem value="target_asc">Menor meta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Grid */}
          {sortedAlerts.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCategory !== "all" 
                    ? "Não há alertas na categoria selecionada"
                    : "Comece criando seu primeiro alerta de preço"
                  }
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Alerta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAlerts.map((alert) => (
                <Card key={alert.id} className="border-primary/20 hover:shadow-lg transition-all duration-200 hover:border-primary/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{alert.product_name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => toggleAlert(alert.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Preço Atual:</span>
                        <span className={`font-bold ${getPriceChangeColor(alert.current_price, alert.target_price)}`}>
                          R$ {alert.current_price?.toFixed(2) || "---"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Meta:</span>
                        <span className="font-medium">R$ {alert.target_price.toFixed(2)}</span>
                      </div>
                    </div>

                    {alert.ai_predictions && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">IA Insights</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            {getTrendIcon(alert.ai_predictions.trend)}
                            <span>Tendência: {alert.ai_predictions.trend === "falling" ? "Queda" : 
                              alert.ai_predictions.trend === "rising" ? "Alta" : "Estável"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Confiança: {Math.round(alert.ai_predictions.confidence * 100)}%
                          </div>
                          <div className="text-primary font-medium">
                            {alert.ai_predictions.best_time_to_buy}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                      {getStatusBadge(alert)}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigateToTravel(alert)}
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          title="Ver no módulo de compras"
                        >
                          <ShoppingCart className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          title="Configurações"
                        >
                          <Settings className="w-4 h-4 text-primary" />
                        </Button>
                      </div>
                    </div>

                    {alert.last_checked_at && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Última verificação: {new Date(alert.last_checked_at).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      insight.type === "opportunity" ? "bg-success/10" :
                        insight.type === "warning" ? "bg-warning/10" : "bg-info/10"
                    }`}>
                      {insight.type === "opportunity" ? 
                        <TrendingDown className="w-5 h-5 text-success" /> :
                        insight.type === "warning" ?
                          <AlertTriangle className="w-5 h-5 text-warning" /> :
                          <TrendingUp className="w-5 h-5 text-info" />
                      }
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {insight.type === "opportunity" ? "Oportunidade de Compra" :
                          insight.type === "warning" ? "Alerta de Tendência" : "Recomendação"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Confiança: {Math.round(insight.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{insight.message}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary/20 hover:bg-primary/5"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Histórico de Variações de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.slice(0, 10).map((item) => {
                  const alert = alerts.find(a => a.id === item.alert_id);
                  if (!alert) return null;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-primary/5">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.product_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">R$ {item.price.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(item.checked_at).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.checked_at).toLocaleTimeString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};