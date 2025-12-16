import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Cloud,
  Wind,
  Waves,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Thermometer,
  Eye,
  Ship,
  Target,
  Bell,
  FileText,
  RefreshCw,
  Calendar,
  MapPin,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface EnvironmentalCondition {
  parameter: string;
  value: number;
  unit: string;
  direction?: number;
  asogLimit: { green: number; yellow: number; red: number };
  trend: "increasing" | "decreasing" | "stable";
  forecast: number[];
}

interface OperationalAlert {
  id: string;
  timestamp: string;
  type: "warning" | "critical" | "info";
  parameter: string;
  message: string;
  suggestedAction: string;
  acknowledged: boolean;
}

interface ASOGProfile {
  id: string;
  name: string;
  operationType: string;
  limits: {
    windSpeed: { green: number; yellow: number; red: number };
    waveHeight: { green: number; yellow: number; red: number };
    current: { green: number; yellow: number; red: number };
    visibility: { green: number; yellow: number; red: number };
  };
}

const mockConditions: EnvironmentalCondition[] = [
  {
    parameter: "Vento",
    value: 18,
    unit: "kn",
    direction: 185,
    asogLimit: { green: 20, yellow: 25, red: 30 },
    trend: "increasing",
    forecast: [18, 20, 22, 24, 23, 21, 19]
  },
  {
    parameter: "Altura de Onda (Hs)",
    value: 1.8,
    unit: "m",
    asogLimit: { green: 2.0, yellow: 2.5, red: 3.0 },
    trend: "stable",
    forecast: [1.8, 1.9, 2.0, 2.1, 2.0, 1.9, 1.8]
  },
  {
    parameter: "Corrente",
    value: 1.4,
    unit: "kn",
    direction: 210,
    asogLimit: { green: 1.3, yellow: 1.8, red: 2.2 },
    trend: "increasing",
    forecast: [1.4, 1.5, 1.6, 1.5, 1.4, 1.3, 1.2]
  },
  {
    parameter: "Visibilidade",
    value: 8,
    unit: "nm",
    asogLimit: { green: 5, yellow: 3, red: 1 },
    trend: "stable",
    forecast: [8, 7, 6, 5, 6, 7, 8]
  },
  {
    parameter: "Período de Onda",
    value: 8.5,
    unit: "s",
    asogLimit: { green: 12, yellow: 14, red: 16 },
    trend: "decreasing",
    forecast: [8.5, 8.0, 7.5, 7.0, 7.5, 8.0, 8.5]
  }
];

const mockAlerts: OperationalAlert[] = [
  {
    id: "ALT-001",
    timestamp: new Date().toISOString(),
    type: "warning",
    parameter: "Corrente",
    message: "Corrente excedendo limite verde do ASOG (1.3 kn → 1.4 kn atual)",
    suggestedAction: "Considerar migração para modo TAM ou ajuste de ganho",
    acknowledged: false
  },
  {
    id: "ALT-002",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "info",
    parameter: "Vento",
    message: "Previsão indica vento acima de 20kn nas próximas 4 horas",
    suggestedAction: "Monitorar condições e preparar contingência",
    acknowledged: true
  }
];

const mockASOGProfiles: ASOGProfile[] = [
  {
    id: "ASOG-001",
    name: "Operação Padrão",
    operationType: "Standard DP Operations",
    limits: {
      windSpeed: { green: 25, yellow: 30, red: 35 },
      waveHeight: { green: 2.5, yellow: 3.0, red: 3.5 },
      current: { green: 1.5, yellow: 2.0, red: 2.5 },
      visibility: { green: 3, yellow: 2, red: 1 }
    }
  },
  {
    id: "ASOG-002",
    name: "Operação ROV",
    operationType: "ROV Operations",
    limits: {
      windSpeed: { green: 20, yellow: 25, red: 30 },
      waveHeight: { green: 2.0, yellow: 2.5, red: 3.0 },
      current: { green: 1.3, yellow: 1.8, red: 2.2 },
      visibility: { green: 5, yellow: 3, red: 1 }
    }
  },
  {
    id: "ASOG-003",
    name: "SIMOPS",
    operationType: "Simultaneous Operations",
    limits: {
      windSpeed: { green: 18, yellow: 22, red: 28 },
      waveHeight: { green: 1.8, yellow: 2.2, red: 2.8 },
      current: { green: 1.2, yellow: 1.5, red: 2.0 },
      visibility: { green: 5, yellow: 3, red: 2 }
    }
  }
];

export const OperationalWindowMonitor: React.FC = () => {
  const [conditions, setConditions] = useState<EnvironmentalCondition[]>(mockConditions);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(mockAlerts);
  const [selectedProfile, setSelectedProfile] = useState<ASOGProfile>(mockASOGProfiles[1]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("realtime");

  useEffect(() => {
    const interval = setInterval(() => {
      setConditions(prev => prev.map(c => ({
        ...c,
        value: c.value + (Math.random() - 0.5) * 0.2
      })));
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, limits: { green: number; yellow: number; red: number }, isInverse = false) => {
    if (isInverse) {
      if (value >= limits.green) return "green";
      if (value >= limits.yellow) return "yellow";
      return "red";
    }
    if (value <= limits.green) return "green";
    if (value <= limits.yellow) return "yellow";
    return "red";
  };

  const getConditionStatus = (condition: EnvironmentalCondition) => {
    const isInverse = condition.parameter === "Visibilidade";
    return getStatusColor(condition.value, condition.asogLimit, isInverse);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success("Alerta reconhecido e registrado no logbook");
  };

  const handleRefresh = () => {
    toast.success("Atualizando dados meteorológicos...");
    setLastUpdate(new Date());
  };

  const getOverallStatus = () => {
    const statuses = conditions.map(c => getConditionStatus(c));
    if (statuses.includes("red")) return "critical";
    if (statuses.includes("yellow")) return "warning";
    return "normal";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "decreasing": return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const overallStatus = getOverallStatus();
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${overallStatus === "critical" ? "bg-red-500/20" : overallStatus === "warning" ? "bg-yellow-500/20" : "bg-green-500/20"}`}>
            <Cloud className={`h-8 w-8 ${overallStatus === "critical" ? "text-red-500" : overallStatus === "warning" ? "text-yellow-500" : "text-green-500"}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Janela Operacional Inteligente</h2>
            <p className="text-muted-foreground">Monitoramento em tempo real + ASOG Compliance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Atualizado: {lastUpdate.toLocaleTimeString("pt-BR")}
          </Badge>
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              {unacknowledgedAlerts.length} Alertas
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card className={`border-2 ${overallStatus === "critical" ? "border-red-500 bg-red-500/5" : overallStatus === "warning" ? "border-yellow-500 bg-yellow-500/5" : "border-green-500 bg-green-500/5"}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {overallStatus === "normal" ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <AlertTriangle className={`h-12 w-12 ${overallStatus === "critical" ? "text-red-500" : "text-yellow-500"}`} />
              )}
              <div>
                <h3 className="text-xl font-bold">
                  {overallStatus === "normal" ? "Condições Operacionais Normais" :
                   overallStatus === "warning" ? "Atenção: Condições Próximas ao Limite" :
                   "ALERTA: Condições Fora do ASOG"}
                </h3>
                <p className="text-muted-foreground">
                  Perfil ASOG ativo: <span className="font-medium">{selectedProfile.name}</span> ({selectedProfile.operationType})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={selectedProfile.id}
                onChange={(e) => setSelectedProfile(mockASOGProfiles.find(p => p.id === e.target.value) || mockASOGProfiles[0])}
              >
                {mockASOGProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>{profile.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="realtime" className="flex items-center gap-2"><Activity className="w-4 h-4" />Tempo Real</TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Previsão 24h</TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2"><Bell className="w-4 h-4" />Alertas {unacknowledgedAlerts.length > 0 && `(${unacknowledgedAlerts.length})`}</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conditions.map((condition, index) => {
              const status = getConditionStatus(condition);
              const isInverse = condition.parameter === "Visibilidade";
              const percentage = isInverse
                ? Math.min(100, (condition.value / condition.asogLimit.green) * 100)
                : Math.min(100, (condition.value / condition.asogLimit.red) * 100);

              return (
                <Card key={index} className={`border-l-4 ${status === "green" ? "border-l-green-500" : status === "yellow" ? "border-l-yellow-500" : "border-l-red-500"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{condition.parameter}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(condition.trend)}
                        <Badge variant={status === "green" ? "default" : status === "yellow" ? "secondary" : "destructive"} className={status === "green" ? "bg-green-500" : status === "yellow" ? "bg-yellow-500 text-black" : ""}>
                          {status === "green" ? "OK" : status === "yellow" ? "Atenção" : "Crítico"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{condition.value.toFixed(1)}</span>
                        <span className="text-muted-foreground">{condition.unit}</span>
                        {condition.direction !== undefined && (
                          <span className="text-sm text-muted-foreground ml-2">({condition.direction}°)</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Limite ASOG</span>
                          <span>{isInverse ? `>${condition.asogLimit.green}` : `<${condition.asogLimit.green}`} {condition.unit}</span>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div className="absolute inset-0 flex">
                            <div className="bg-green-500 h-full" style={{ width: `${(condition.asogLimit.green / condition.asogLimit.red) * 100}%` }} />
                            <div className="bg-yellow-500 h-full" style={{ width: `${((condition.asogLimit.yellow - condition.asogLimit.green) / condition.asogLimit.red) * 100}%` }} />
                            <div className="bg-red-500 h-full flex-1" />
                          </div>
                          <div
                            className="absolute top-0 w-1 h-full bg-foreground"
                            style={{ left: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Meteorológica - Próximas 24 horas</CardTitle>
              <CardDescription>Análise de tendências e impacto no ASOG</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {conditions.map((condition, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{condition.parameter}</span>
                      <span className="text-sm text-muted-foreground">
                        {condition.trend === "increasing" ? "📈 Tendência de aumento" :
                         condition.trend === "decreasing" ? "📉 Tendência de queda" : "➡️ Estável"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {condition.forecast.map((value, i) => {
                        const isInverse = condition.parameter === "Visibilidade";
                        const status = getStatusColor(value, condition.asogLimit, isInverse);
                        return (
                          <div key={i} className="flex-1 text-center">
                            <div className={`h-16 rounded flex items-end justify-center pb-1 ${status === "green" ? "bg-green-500/20" : status === "yellow" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
                              <span className="text-xs font-medium">{value.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">+{(i + 1) * 4}h</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <p className="font-medium text-yellow-600">Previsão de Janela Operacional Restrita</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Com base nas previsões, recomenda-se concluir operações críticas nas próximas 8 horas.
                    Vento previsto acima de 22kn a partir de T+16h pode impactar operações ROV.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${alert.type === "critical" ? "border-l-red-500 bg-red-500/5" : alert.type === "warning" ? "border-l-yellow-500 bg-yellow-500/5" : "border-l-blue-500 bg-blue-500/5"}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {alert.type === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                        ) : alert.type === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                        ) : (
                          <Activity className="h-5 w-5 text-blue-500 mt-1" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={alert.type === "critical" ? "destructive" : alert.type === "warning" ? "secondary" : "default"}>
                              {alert.parameter}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString("pt-BR")}
                            </span>
                            {alert.acknowledged && <Badge variant="outline" className="text-green-500 border-green-500">Reconhecido</Badge>}
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Ação sugerida:</strong> {alert.suggestedAction}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />Reconhecer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Violações ASOG</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">02/12/2024 - Corrente acima do limite</p>
                      <p className="text-sm text-muted-foreground">1.6 kn (limite: 1.3 kn) - Duração: 45 min</p>
                    </div>
                    <Badge variant="outline">Resolvido</Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">28/11/2024 - Vento acima do limite amarelo</p>
                      <p className="text-sm text-muted-foreground">24 kn (limite: 20 kn) - Duração: 2h</p>
                    </div>
                    <Badge variant="outline">Resolvido</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationalWindowMonitor;
