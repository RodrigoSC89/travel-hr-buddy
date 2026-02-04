/**
 * Central de Comando Aprimorada - Versão Premium
 * PATCH PREMIUM-2.0 - Funcionalidades avançadas com IA
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Compass, Ship, Users, Wrench, AlertTriangle, 
  TrendingUp, Brain, Activity, Shield, FileText,
  Clock, MapPin, Zap, Target, BarChart3,
  CheckCircle, XCircle, RefreshCw, Bell
} from "lucide-react";
import { toast } from "sonner";

// KPI Data
const systemKPIs = [
  { id: "fleet", label: "Frota Ativa", value: "12/14", trend: "+8%", icon: Ship, color: "primary", status: "operational" },
  { id: "crew", label: "Tripulação", value: "247", trend: "+3%", icon: Users, color: "success", status: "operational" },
  { id: "maintenance", label: "OS Abertas", value: "8", trend: "-15%", icon: Wrench, color: "warning", status: "attention" },
  { id: "compliance", label: "Conformidade", value: "97.2%", trend: "+1.2%", icon: Shield, color: "success", status: "operational" },
  { id: "alerts", label: "Alertas Ativos", value: "3", trend: "-40%", icon: AlertTriangle, color: "warning", status: "attention" },
  { id: "efficiency", label: "Eficiência Geral", value: "94.8%", trend: "+2.1%", icon: TrendingUp, color: "success", status: "operational" },
];

const activeOperations = [
  { id: "1", vessel: "MV Atlântico Sul", operation: "Transporte de Carga", status: "em_rota", progress: 67, eta: "2d 4h", location: "Costa Brasileira" },
  { id: "2", vessel: "MV Horizonte", operation: "Manutenção Programada", status: "doca", progress: 45, eta: "5d", location: "Porto de Santos" },
  { id: "3", vessel: "MV Oceano", operation: "Abastecimento", status: "porto", progress: 90, eta: "6h", location: "Porto de Vitória" },
  { id: "4", vessel: "MV Estrela do Mar", operation: "Transporte Offshore", status: "em_rota", progress: 33, eta: "3d 12h", location: "Bacia de Campos" },
];

const criticalAlerts = [
  { id: "1", severity: "high", title: "Certificado SOLAS vencendo", vessel: "MV Atlântico Sul", dueDate: "3 dias", action: "Agendar renovação" },
  { id: "2", severity: "medium", title: "Manutenção preventiva atrasada", vessel: "MV Horizonte", dueDate: "7 dias", action: "Priorizar OS" },
  { id: "3", severity: "low", title: "Treinamento pendente", vessel: "MV Oceano", dueDate: "15 dias", action: "Agendar tripulação" },
];

const aiInsights = [
  { id: "1", type: "optimization", title: "Otimização de Rota Sugerida", description: "Economia potencial de 12% no consumo de combustível para MV Atlântico Sul", confidence: 94 },
  { id: "2", type: "prediction", title: "Previsão de Manutenção", description: "Motor principal do MV Horizonte requer atenção em 30 dias", confidence: 87 },
  { id: "3", type: "compliance", title: "Auditoria ISM Próxima", description: "3 embarcações precisam de revisão documental antes de 60 dias", confidence: 92 },
];

export default function CentralComandoAprimorada() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Dados atualizados com sucesso");
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_rota": return "bg-emerald-500";
      case "doca": return "bg-amber-500";
      case "porto": return "bg-blue-500";
      default: return "bg-muted";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <Compass className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Central de Comando</h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                    <Activity className="h-3 w-3" />
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Visão unificada de operações marítimas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button size="sm" className="gap-2">
                <Brain className="h-4 w-4" />
                Análise IA
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {systemKPIs.map((kpi) => (
            <Card key={kpi.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600">{kpi.trend}</span>
                    </div>
                  </div>
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Operações
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
              <Badge variant="destructive" className="h-5 w-5 p-0 text-[10px]">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Operações Ativas */}
          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Operações em Andamento
                  </CardTitle>
                  <Badge variant="secondary">{activeOperations.length} ativas</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeOperations.map((op) => (
                    <div key={op.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(op.status)}`} />
                          <div>
                            <p className="font-semibold">{op.vessel}</p>
                            <p className="text-sm text-muted-foreground">{op.operation}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{op.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Progresso</span>
                              <span className="font-medium">{op.progress}%</span>
                            </div>
                            <Progress value={op.progress} className="h-2" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">ETA</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {op.eta}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alertas */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-lg border flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Badge variant={getSeverityColor(alert.severity) as "destructive" | "secondary" | "outline"}>
                          {alert.severity === "high" ? "Alto" : alert.severity === "medium" ? "Médio" : "Baixo"}
                        </Badge>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.vessel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Prazo: {alert.dueDate}</span>
                        <Button size="sm" onClick={() => toast.success(`Ação: ${alert.action}`)}>
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA Insights */}
          <TabsContent value="ai">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{insight.title}</p>
                          <Badge variant="outline" className="text-[10px]">{insight.confidence}%</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                          Aplicar sugestão →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Utilização da Frota</p>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">85.7%</p>
                  <Progress value={85.7} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Eficiência Combustível</p>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">92.3%</p>
                  <Progress value={92.3} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Uptime Operacional</p>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold">99.2%</p>
                  <Progress value={99.2} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Taxa de Incidentes</p>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold">0.02%</p>
                  <Progress value={2} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
