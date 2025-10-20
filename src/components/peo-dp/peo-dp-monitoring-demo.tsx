/**
 * PEO-DP Monitoring Demo Component
 * Demonstrates the use of the PEO-DP AI real-time monitoring system
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  StopCircle, 
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Ship,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { PEOdpCore } from "@/modules/peodp_ai";
import type { DPEvent, AuditResult, MonitoringSession } from "@/modules/peodp_ai";

export const PeoDpMonitoringDemo: React.FC = () => {
  const [peodp] = useState(() => new PEOdpCore());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [events, setEvents] = useState<DPEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<MonitoringSession | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    criticos: 0,
    normais: 0,
    por_tipo: {} as Record<string, number>
  });

  // Monitoring loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isMonitoring) {
      intervalId = setInterval(() => {
        try {
          peodp.executar_ciclo();
          const newEvents = peodp.getRealtime().getEventos();
          const stats = peodp.getRealtime().getEstatisticas();
          const session = peodp.getRealtime().getSession();
          
          setEvents(newEvents);
          setStatistics(stats);
          setCurrentSession(session);
        } catch (error) {
          console.error("Monitoring cycle error:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMonitoring, peodp]);

  const handleStartMonitoring = () => {
    try {
      peodp.iniciar_monitoramento_tempo_real("PSV Atlantic Explorer");
      setIsMonitoring(true);
      toast.success("Monitoramento iniciado");
    } catch (error) {
      toast.error("Erro ao iniciar monitoramento");
      console.error(error);
    }
  };

  const handleStopMonitoring = () => {
    try {
      const session = peodp.parar_monitoramento();
      setIsMonitoring(false);
      setCurrentSession(session);
      toast.success("Monitoramento encerrado");
    } catch (error) {
      toast.error("Erro ao encerrar monitoramento");
      console.error(error);
    }
  };

  const handleRunAudit = () => {
    try {
      const result = peodp.iniciar_auditoria("NORMAM-101");
      setAuditResult(result);
      toast.success("Auditoria concluída");
    } catch (error) {
      toast.error("Erro ao executar auditoria");
      console.error(error);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "green": return "bg-green-100 text-green-800 border-green-200";
      case "yellow": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "red": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType === "System Normal") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧭 PEO-DP Intelligent System</h1>
          <p className="text-muted-foreground">
            Monitoramento em Tempo Real e Auditoria de Conformidade DP
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Radio className="h-4 w-4 mr-2" />
          Versão 2.0
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Painel de Controle
          </CardTitle>
          <CardDescription>
            Iniciar monitoramento ou executar auditoria manual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {!isMonitoring ? (
              <Button onClick={handleStartMonitoring} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Monitoramento
              </Button>
            ) : (
              <Button onClick={handleStopMonitoring} variant="destructive" className="flex-1">
                <StopCircle className="h-4 w-4 mr-2" />
                Parar Monitoramento
              </Button>
            )}
            
            <Button onClick={handleRunAudit} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Executar Auditoria
            </Button>
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium text-green-800">
                Monitoramento Ativo - {events.length} eventos capturados
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">
            <Radio className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    {currentSession.vessel.name}
                  </span>
                  <Badge variant="outline">{currentSession.vessel.dp_class}</Badge>
                </CardTitle>
                <CardDescription>
                  Session ID: {currentSession.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
                    <div className="text-sm text-muted-foreground">Total Eventos</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{statistics.normais}</div>
                    <div className="text-sm text-muted-foreground">Normais</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{statistics.criticos}</div>
                    <div className="text-sm text-muted-foreground">Críticos</div>
                  </div>
                </div>

                {/* Recent Events */}
                <div>
                  <h3 className="font-semibold mb-3">Eventos Recentes</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {events.slice(-10).reverse().map((event, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          event.evento === "System Normal" ? "bg-green-50" : "bg-orange-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getEventIcon(event.evento)}
                          <div>
                            <p className="font-medium text-sm">{event.evento}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.data).toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={event.evento === "System Normal" ? "default" : "destructive"}>
                          {event.evento === "System Normal" ? "Normal" : "Atenção"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!currentSession && !isMonitoring && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Inicie o monitoramento para visualizar eventos em tempo real</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          {auditResult ? (
            <Card className={`border-2 ${getStatusColor(auditResult.status)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{auditResult.profile}</span>
                  <Badge className={getStatusColor(auditResult.status)}>
                    {auditResult.status.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Auditoria realizada em {new Date(auditResult.timestamp).toLocaleString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Conformidade</span>
                    <span className="text-sm font-bold">{auditResult.compliance_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={auditResult.compliance_percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{auditResult.compliant_rules}</div>
                    <div className="text-sm text-muted-foreground">Regras Atendidas</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{auditResult.non_compliant_rules}</div>
                    <div className="text-sm text-muted-foreground">Violações</div>
                  </div>
                </div>

                {auditResult.violations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Violações Detectadas</h3>
                    <div className="space-y-2">
                      {auditResult.violations.slice(0, 5).map((violation, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {violation.rule_id}
                                </Badge>
                                <Badge
                                  variant={violation.severity === "critical" ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {violation.severity}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">{violation.category}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {violation.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {auditResult.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Recomendações</h3>
                    <div className="space-y-2">
                      {auditResult.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Execute uma auditoria para visualizar resultados de conformidade</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Eventos</CardTitle>
              <CardDescription>
                Análise dos tipos de eventos capturados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(statistics.por_tipo).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(statistics.por_tipo)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tipo, count]) => {
                      const percentage = ((count / statistics.total) * 100).toFixed(1);
                      return (
                        <div key={tipo}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{tipo}</span>
                            <span className="text-sm text-muted-foreground">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum dado estatístico disponível ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
