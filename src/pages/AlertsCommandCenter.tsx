/**
 * ALERTS COMMAND CENTER - Unified Alert Management System
 * Fusion of: Price Alerts + Intelligent Alerts
 * 
 * Features:
 * - Overview Dashboard with unified KPIs
 * - Price Alerts with AI predictions
 * - Intelligent Alerts with real-time monitoring
 * - Analytics and insights
 * - Configuration and settings
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsRealData } from "@/hooks/useAlertsRealData";
import type { SmartAlert as AlertType, SystemHealth as HealthType } from "@/hooks/useAlertsRealData";

// Price Alerts Components
import { PriceAlertsDashboard } from "@/components/price-alerts/price-alerts-dashboard-integrated";
import { PriceAnalyticsDashboard } from "@/components/price-alerts/price-analytics-dashboard";
import { AIPricePredictor } from "@/components/price-alerts/ai-price-predictor";
import { PriceRangeConfig } from "@/components/price-alerts/components/price-range-config";
import { EnhancedHistoryStats } from "@/components/price-alerts/components/enhanced-history-stats";

import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Shield,
  Thermometer,
  Fuel,
  Ship,
  Users,
  MapPin,
  BarChart3,
  Settings,
  History,
  DollarSign,
  Sparkles,
  AlertCircle,
  Gauge
} from "lucide-react";

// Re-export types from hook for local use (avoid conflicts)
type LocalSmartAlert = AlertType;
type LocalSystemHealth = HealthType;

interface AIInsight {
  id: string;
  insight_type: "predictive" | "diagnostic" | "prescriptive";
  title: string;
  description: string;
  confidence_score: number;
  business_impact: "high" | "medium" | "low";
  data_sources: string[];
  recommendations: string[];
  timeline: string;
  cost_benefit: {
    potential_savings: number;
    implementation_cost: number;
    roi_percentage: number;
  };
}

const AlertsCommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [filterType, setFilterType] = useState("all");

  // Use real data hook instead of mock
  const {
    alerts: smartAlerts,
    systemHealth,
    isLoading: loading,
    error,
    refetch,
    acknowledgeAlert,
    resolveAlert,
    exportAlerts,
    stats
  } = useAlertsRealData();

  // AI Insights (can be extended to fetch from real source later)
  React.useEffect(() => {
    setAiInsights([
      {
        id: "1",
        insight_type: "predictive",
        title: "Previsão de Demanda de Combustível",
        description: "Baseado em padrões históricos, prevê-se aumento de 18% no consumo nos próximos 15 dias.",
        confidence_score: 89,
        business_impact: "high",
        data_sources: ["Consumo histórico", "Previsão meteorológica", "Rotas planejadas"],
        recommendations: [
          "Negociar contratos de combustível com fornecedores",
          "Otimizar rotas para reduzir consumo"
        ],
        timeline: "15 dias",
        cost_benefit: { potential_savings: 45000, implementation_cost: 8000, roi_percentage: 462 }
      },
      {
        id: "2",
        insight_type: "prescriptive",
        title: "Tendência de Preços - VLSFO Global",
        description: "Análise preditiva indica queda de 8% nos preços nas próximas 2 semanas.",
        confidence_score: 85,
        business_impact: "high",
        data_sources: ["Mercado global", "Tendências OPEC", "Dados históricos"],
        recommendations: [
          "Aguardar compra para período de baixa",
          "Manter estoque mínimo operacional"
        ],
        timeline: "14 dias",
        cost_benefit: { potential_savings: 32000, implementation_cost: 0, roi_percentage: 100 }
      },
      {
        id: "3",
        insight_type: "diagnostic",
        title: "Análise de Padrões de Manutenção",
        description: "Manutenção preditiva pode reduzir custos de reparo em 35%.",
        confidence_score: 87,
        business_impact: "high",
        data_sources: ["Histórico de manutenção", "Sensores IoT", "Relatórios de inspeção"],
        recommendations: [
          "Instalar sensores IoT adicionais",
          "Implementar algoritmo de manutenção preditiva"
        ],
        timeline: "60 dias",
        cost_benefit: { potential_savings: 75000, implementation_cost: 25000, roi_percentage: 200 }
      }
    ]);
  }, []);

  const getAlertIcon = (type: LocalSmartAlert["type"]) => {
    switch (type) {
      case "critical": return AlertTriangle;
      case "warning": return Bell;
      case "info": return Activity;
      case "success": return CheckCircle;
      default: return Bell;
    }
  };

  const getAlertColor = (type: LocalSmartAlert["type"]) => {
    switch (type) {
      case "critical": return "border-destructive bg-destructive/10";
      case "warning": return "border-yellow-500 bg-yellow-500/10";
      case "info": return "border-blue-500 bg-blue-500/10";
      case "success": return "border-green-500 bg-green-500/10";
      default: return "border-muted bg-muted/10";
    }
  };

  const getCategoryIcon = (category: LocalSmartAlert["category"]) => {
    switch (category) {
      case "maintenance": return Ship;
      case "safety": return Shield;
      case "efficiency": return TrendingUp;
      case "compliance": return CheckCircle;
      case "crew": return Users;
      case "weather": return Thermometer;
      case "price": return DollarSign;
      default: return Activity;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const [selectedAlert, setSelectedAlert] = useState<LocalSmartAlert | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const filteredAlerts = smartAlerts.filter(alert => 
    filterType === "all" || alert.category === filterType
  );

  const handleViewDetails = (alert: LocalSmartAlert) => {
    setSelectedAlert(alert);
    setShowDetailsDialog(true);
  };

  const handleResolveAlert = (alert: LocalSmartAlert) => {
    resolveAlert(alert.id);
  };

  const handleAcknowledgeAlert = (alert: LocalSmartAlert) => {
    acknowledgeAlert(alert.id);
  };

  const criticalAlerts = stats.critical;
  const warningAlerts = stats.warning;
  const priceAlerts = smartAlerts.filter(alert => alert.category === "price").length;

  if (loading) {
    return (
      <ModulePageWrapper gradient="orange">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Bell}
        title="Alerts Command Center"
        description="Sistema unificado de alertas inteligentes, monitoramento de preços e insights preditivos"
        gradient="orange"
        badges={[
          { icon: Brain, label: "IA Preditiva" },
          { icon: Zap, label: "Tempo Real" },
          { icon: Target, label: "Alertas Precisos" },
          { icon: DollarSign, label: "Preços" }
        ]}
      />

      {/* Critical Alerts Banner */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <Alert className="border-destructive/50 bg-destructive/10 mb-6">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Atenção:</strong> {criticalAlerts} alerta(s) crítico(s), {warningAlerts} aviso(s) e {priceAlerts} alerta(s) de preço ativos.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Gauge className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="intelligent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            Inteligentes
          </TabsTrigger>
          <TabsTrigger value="price-alerts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-2" />
            Preços
          </TabsTrigger>
          <TabsTrigger value="ai-predictor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Brain className="w-4 h-4 mr-2" />
            IA Preditiva
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health Overview */}
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status do Sistema de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className={`text-3xl font-bold ${getHealthColor(systemHealth.overall_score)}`}>
                      {systemHealth.overall_score}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score Geral</div>
                    <Progress value={systemHealth.overall_score} className="h-2 mt-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getHealthColor(systemHealth.price_monitoring)}`}>
                      {systemHealth.price_monitoring}%
                    </div>
                    <div className="text-sm text-muted-foreground">Monit. Preços</div>
                    <Progress value={systemHealth.price_monitoring} className="h-2 mt-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getHealthColor(systemHealth.safety_compliance)}`}>
                      {systemHealth.safety_compliance}%
                    </div>
                    <div className="text-sm text-muted-foreground">Segurança</div>
                    <Progress value={systemHealth.safety_compliance} className="h-2 mt-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getHealthColor(systemHealth.fleet_efficiency)}`}>
                      {systemHealth.fleet_efficiency}%
                    </div>
                    <div className="text-sm text-muted-foreground">Eficiência</div>
                    <Progress value={systemHealth.fleet_efficiency} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                    <p className="text-3xl font-bold text-destructive">{criticalAlerts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avisos</p>
                    <p className="text-3xl font-bold text-yellow-600">{warningAlerts}</p>
                  </div>
                  <Bell className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Alertas de Preço</p>
                    <p className="text-3xl font-bold text-blue-600">{priceAlerts}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Insights IA</p>
                    <p className="text-3xl font-bold text-green-600">{aiInsights.length}</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Alertas Recentes
              </CardTitle>
              <CardDescription>Últimos alertas de todas as categorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {smartAlerts.slice(0, 5).map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  const CategoryIcon = getCategoryIcon(alert.category);
                  
                  return (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertIcon className="h-5 w-5 mt-0.5" />
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {alert.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                IA: {alert.ai_confidence}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>
                          {alert.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Insights de IA
              </CardTitle>
              <CardDescription>Análises preditivas e recomendações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {aiInsights.map((insight) => (
                  <Card key={insight.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <Badge variant="outline" className="mb-2">{insight.insight_type}</Badge>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confiança: {insight.confidence_score}%</span>
                        <Badge variant="secondary" className="text-green-600">
                          ROI: {insight.cost_benefit.roi_percentage}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligent Alerts Tab */}
        <TabsContent value="intelligent" className="space-y-6">
          {/* Alert Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterType === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Todos
                </Button>
                <Button 
                  variant={filterType === "maintenance" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("maintenance")}
                >
                  <Ship className="h-4 w-4 mr-1" />
                  Manutenção
                </Button>
                <Button 
                  variant={filterType === "safety" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("safety")}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Segurança
                </Button>
                <Button 
                  variant={filterType === "efficiency" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("efficiency")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Eficiência
                </Button>
                <Button 
                  variant={filterType === "crew" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("crew")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Tripulação
                </Button>
                <Button 
                  variant={filterType === "weather" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("weather")}
                >
                  <Thermometer className="h-4 w-4 mr-1" />
                  Clima
                </Button>
                <Button 
                  variant={filterType === "price" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterType("price")}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Preços
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Smart Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              const CategoryIcon = getCategoryIcon(alert.category);
              
              return (
                <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertIcon className="h-5 w-5" />
                          <h3 className="font-semibold">{alert.title}</h3>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{alert.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="outline">
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {alert.category}
                          </Badge>
                          {alert.vessel_name && (
                            <Badge variant="secondary">
                              <Ship className="h-3 w-3 mr-1" />
                              {alert.vessel_name}
                            </Badge>
                          )}
                          <Badge variant="outline">
                            <Brain className="h-3 w-3 mr-1" />
                            Confiança: {alert.ai_confidence}%
                          </Badge>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium mb-2">Ações Recomendadas:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {alert.recommended_actions.map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          <strong>Impacto:</strong> {alert.impact_assessment}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <Badge variant={alert.priority === "high" ? "destructive" : alert.priority === "medium" ? "secondary" : "outline"}>
                          {alert.priority}
                        </Badge>
                        <Badge variant="outline">{alert.status}</Badge>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(alert)}>Detalhes</Button>
                          {alert.status === "new" && (
                            <Button size="sm" variant="secondary" onClick={() => handleAcknowledgeAlert(alert)}>Reconhecer</Button>
                          )}
                          {alert.status !== "resolved" && (
                            <Button size="sm" onClick={() => handleResolveAlert(alert)}>Resolver</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="price-alerts">
          <PriceAlertsDashboard />
        </TabsContent>

        {/* AI Predictor Tab */}
        <TabsContent value="ai-predictor">
          <AIPricePredictor />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PriceAnalyticsDashboard />
          <EnhancedHistoryStats />
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config">
          <PriceRangeConfig />
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && React.createElement(getAlertIcon(selectedAlert.type), { className: "h-5 w-5" })}
              {selectedAlert?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <Badge variant="outline" className="capitalize">{selectedAlert.category}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Prioridade</p>
                  <Badge variant={selectedAlert.priority === "high" ? "destructive" : "secondary"}>
                    {selectedAlert.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">{selectedAlert.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Confiança IA</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedAlert.ai_confidence} className="h-2 w-20" />
                    <span className="text-sm font-medium">{selectedAlert.ai_confidence}%</span>
                  </div>
                </div>
              </div>

              {selectedAlert.vessel_name && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Embarcação</p>
                  <p className="font-medium">{selectedAlert.vessel_name}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Ações Recomendadas:</p>
                <ul className="space-y-2">
                  {selectedAlert.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Avaliação de Impacto:</p>
                <p className="text-sm text-muted-foreground">{selectedAlert.impact_assessment}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                Criado em: {new Date(selectedAlert.created_at).toLocaleString('pt-BR')}
                {selectedAlert.resolved_at && (
                  <> • Resolvido em: {new Date(selectedAlert.resolved_at).toLocaleString('pt-BR')}</>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            {selectedAlert?.status !== "resolved" && (
              <Button onClick={() => { if (selectedAlert) { handleResolveAlert(selectedAlert); setShowDetailsDialog(false); } }}>
                Resolver Alerta
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ModulePageWrapper>
  );
};

export default AlertsCommandCenter;
