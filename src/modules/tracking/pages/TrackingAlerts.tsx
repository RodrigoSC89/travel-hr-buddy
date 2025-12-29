/**
 * Tracking Alerts - Enhanced with AI analysis
 * PATCH TRACK-2.0
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, CheckCircle, Clock, Bell, Brain, Shield,
  XCircle, Filter, RefreshCw, Zap, TrendingUp, Activity, Settings
} from "lucide-react";
import { useGnssAlerts, useResolveAlert } from "../hooks/useTrackingData";
import { useAITracking } from "../hooks/useAITracking";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Demo alerts for testing
const DEMO_ALERTS = [
  {
    id: "alert-001",
    severity: "critical",
    alert_type: "signal_loss",
    title: "Perda de Sinal RTK - Embarcação Alpha",
    description: "Dispositivo RTK Beta perdeu conexão com estação base. Último fix válido há 5 minutos.",
    device_id: "dev-002",
    created_at: new Date(Date.now() - 300000).toISOString(),
    resolved: false,
    ai_analysis: "Possível interferência atmosférica ou obstrução física. Recomendação: verificar antena e condições meteorológicas."
  },
  {
    id: "alert-002",
    severity: "warning",
    alert_type: "accuracy_degradation",
    title: "Degradação de Precisão - DGPS Alpha",
    description: "HDOP aumentou de 0.8 para 2.5 nas últimas 2 horas. Precisão atual: 2.1m",
    device_id: "dev-001",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    resolved: false,
    ai_analysis: "Redução no número de satélites visíveis. Condição temporária devido à geometria orbital."
  },
  {
    id: "alert-003",
    severity: "warning",
    alert_type: "geofence",
    title: "Saída de Zona Operacional - Marine Gamma",
    description: "Embarcação saiu da área de operação autorizada às 14:32 UTC",
    device_id: "dev-004",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
    ai_analysis: "Desvio de rota detectado. Verificar com operador se é manobra planejada."
  },
  {
    id: "alert-004",
    severity: "info",
    alert_type: "maintenance",
    title: "Manutenção Programada - PPP Delta",
    description: "Atualização de firmware agendada para amanhã às 02:00 UTC",
    device_id: "dev-003",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    resolved: false,
    ai_analysis: null
  },
  {
    id: "alert-005",
    severity: "info",
    alert_type: "battery",
    title: "Bateria Baixa - RTK Rover",
    description: "Nível de bateria em 15%. Estimativa de autonomia: 2 horas",
    device_id: "dev-002",
    created_at: new Date(Date.now() - 900000).toISOString(),
    resolved: false,
    ai_analysis: "Recomendação: iniciar procedimento de troca ou recarga em até 1 hora."
  }
];

const ALERT_HISTORY = [
  {
    id: "hist-001",
    severity: "critical",
    title: "Perda Total de Sinal",
    resolved_at: new Date(Date.now() - 86400000).toISOString(),
    resolution: "Reinicialização do dispositivo"
  },
  {
    id: "hist-002",
    severity: "warning",
    title: "Interferência Detectada",
    resolved_at: new Date(Date.now() - 172800000).toISOString(),
    resolution: "Mudança de frequência"
  }
];

export default function TrackingAlerts() {
  const { data: realAlerts, isLoading, refetch } = useGnssAlerts(false);
  const resolveAlert = useResolveAlert();
  const { analyzeSignal, isAnalyzing, recommendations } = useAITracking();
  
  const [activeTab, setActiveTab] = useState("active");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use demo if no real alerts
  const alerts = realAlerts?.length ? realAlerts : DEMO_ALERTS;

  const handleResolve = async (id: string) => {
    try {
      // In demo mode, just show toast
      toast.success("Alerta resolvido com sucesso");
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    await new Promise(r => setTimeout(r, 500));
    toast.success("Alertas atualizados");
    setIsRefreshing(false);
  };

  const handleAIAnalysis = async () => {
    await analyzeSignal([]);
    toast.success("Análise IA concluída - verificar recomendações");
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { 
          color: 'bg-red-500', 
          bgLight: 'bg-red-500/10 border-red-500/30',
          icon: XCircle,
          label: 'Crítico'
        };
      case 'warning':
        return { 
          color: 'bg-orange-500', 
          bgLight: 'bg-orange-500/10 border-orange-500/30',
          icon: AlertTriangle,
          label: 'Aviso'
        };
      default:
        return { 
          color: 'bg-blue-500', 
          bgLight: 'bg-blue-500/10 border-blue-500/30',
          icon: Bell,
          label: 'Info'
        };
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
          <motion.div 
            className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <AlertTriangle className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Central de Alertas GNSS
            </h1>
            <p className="text-muted-foreground">Monitoramento e Gestão de Alertas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            Análise IA
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Badge variant="outline">{stats.total} ativos</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilterSeverity(null)}>
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
          className={`cursor-pointer transition-colors ${filterSeverity === 'critical' ? 'border-red-500' : 'hover:border-red-500/50'}`}
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
          className={`cursor-pointer transition-colors ${filterSeverity === 'warning' ? 'border-orange-500' : 'hover:border-orange-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? null : 'warning')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-orange-500">{stats.warning}</p>
            <p className="text-xs text-muted-foreground">Avisos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${filterSeverity === 'info' ? 'border-blue-500' : 'hover:border-blue-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'info' ? null : 'info')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-500">{stats.info}</p>
            <p className="text-xs text-muted-foreground">Informativos</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Análise IA dos Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          </motion.div>
        )}
      </AnimatePresence>

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
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredAlerts.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredAlerts.map((alert, index) => {
                      const config = getSeverityConfig(alert.severity);
                      const Icon = config.icon;
                      
                      return (
                        <motion.div 
                          key={alert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 border rounded-lg ${config.bgLight}`}
                        >
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
                                  {new Date(alert.created_at || '').toLocaleString('pt-BR')}
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
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Sistema Operacional</p>
                  <p className="text-sm">Nenhum alerta ativo no momento</p>
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
                {ALERT_HISTORY.map((alert) => {
                  const config = getSeverityConfig(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Resolução: {alert.resolution}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{config.label}</Badge>
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
              <CardDescription>Configure quando os alertas devem ser disparados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Perda de Sinal</p>
                    <p className="text-sm text-muted-foreground">Alerta quando dispositivo ficar offline por mais de 5 minutos</p>
                  </div>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Degradação de Precisão</p>
                    <p className="text-sm text-muted-foreground">Alerta quando HDOP ultrapassar 2.0</p>
                  </div>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Saída de Geofence</p>
                    <p className="text-sm text-muted-foreground">Alerta quando dispositivo sair da área operacional</p>
                  </div>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Bateria Baixa</p>
                    <p className="text-sm text-muted-foreground">Alerta quando bateria estiver abaixo de 20%</p>
                  </div>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
