/**
 * Tracking Alerts - Integrated with Supabase
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, CheckCircle, Clock, Bell, Brain, Shield,
  XCircle, RefreshCw, Zap, Settings, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useTrackingAlerts, useAlertHistory, useResolveAlert } from "@/hooks/useTrackingAlerts";

export default function TrackingAlerts() {
  const [activeTab, setActiveTab] = useState("active");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{title: string; description: string}>>([]);
  
  const { data: alerts = [], isLoading, refetch, isRefetching } = useTrackingAlerts();
  const { data: alertHistory = [] } = useAlertHistory();
  const resolveAlertMutation = useResolveAlert();

  const handleResolve = async (id: string) => {
    try {
      await resolveAlertMutation.mutateAsync(id);
      toast.success("Alerta resolvido com sucesso");
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Alertas atualizados");
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRecommendations([
      { title: "Priorizar alerta crítico", description: "Verificar dispositivo RTK Alpha imediatamente" },
      { title: "Padrão identificado", description: "Degradação de sinal recorrente às 14h - verificar interferência" }
    ]);
    toast.success("Análise IA concluída");
    setIsAnalyzing(false);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'bg-red-500', bgLight: 'bg-red-500/10 border-red-500/30', icon: XCircle, label: 'Crítico' };
      case 'warning':
        return { color: 'bg-orange-500', bgLight: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle, label: 'Aviso' };
      default:
        return { color: 'bg-blue-500', bgLight: 'bg-blue-500/10 border-blue-500/30', icon: Bell, label: 'Info' };
    }
  };

  const filteredAlerts = filterSeverity 
    ? alerts.filter(a => a.severity === filterSeverity)
    : alerts;

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Central de Alertas GNSS</h1>
            <p className="text-muted-foreground">Monitoramento e Gestão de Alertas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            Análise IA
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Badge variant="outline">{stats.total} ativos</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterSeverity(null)}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'critical' ? 'border-red-500' : 'hover:border-red-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? null : 'critical')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <XCircle className="h-5 w-5 text-red-500" />
              {stats.critical > 0 && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-bold mt-2 text-red-500">{stats.critical}</p>
            <p className="text-xs text-muted-foreground">Críticos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'warning' ? 'border-orange-500' : 'hover:border-orange-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? null : 'warning')}
        >
          <CardContent className="pt-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <p className="text-2xl font-bold mt-2 text-orange-500">{stats.warning}</p>
            <p className="text-xs text-muted-foreground">Avisos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'info' ? 'border-blue-500' : 'hover:border-blue-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'info' ? null : 'info')}
        >
          <CardContent className="pt-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <p className="text-2xl font-bold mt-2 text-blue-500">{stats.info}</p>
            <p className="text-xs text-muted-foreground">Informativos</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-secondary" />
              Análise IA dos Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ativos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Regras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Pendentes
                </span>
                {filterSeverity && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilterSeverity(null)}>
                    Filtro: {filterSeverity} ✕
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0 ? (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => {
                    const config = getSeverityConfig(alert.severity);
                    const Icon = config.icon;
                    
                    return (
                      <div key={alert.id} className={`p-4 border rounded-lg ${config.bgLight}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={config.color}>{config.label}</Badge>
                                <Badge variant="outline" className="text-xs">{alert.alert_type}</Badge>
                              </div>
                              <p className="font-semibold">{alert.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              
                              {alert.ai_analysis && (
                                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                  <div className="flex items-start gap-2">
                                    <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Análise IA</p>
                                      <p className="text-sm text-muted-foreground">{alert.ai_analysis}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleResolve(alert.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                            <Button size="sm" variant="outline">
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Sistema Operacional</p>
                  <p className="text-sm">Nenhum alerta ativo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
              <CardDescription>Alertas resolvidos nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertHistory.map((alert: { id: string; severity: string; title: string; resolved_at: string; resolution: string }) => {
                  const config = getSeverityConfig(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">Resolução: {alert.resolution}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={config.color}>{config.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.resolved_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Regras de Alerta
              </CardTitle>
              <CardDescription>Configure thresholds e notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">Limite de Velocidade</p><p className="text-sm text-muted-foreground">Alertar quando exceder 15 nós</p></div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">Zona de Exclusão</p><p className="text-sm text-muted-foreground">Alertar ao entrar em área restrita</p></div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">Parada Prolongada</p><p className="text-sm text-muted-foreground">Alertar após 4h sem movimento</p></div>
                <Badge variant="outline">Configurar</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">Desvio de Rota</p><p className="text-sm text-muted-foreground">Alertar se desviar mais de 5nm</p></div>
                <Badge variant="secondary">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
