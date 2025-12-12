/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 479: Enhanced Sonar AI Dashboard
 * Real-time dashboard with AI classification and risk alerts
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radar,
  Brain,
  AlertTriangle,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
} from "lucide-react";
import {
  enhancedSonarAIService,
  type SonarEvent,
  type SonarRisk,
  type SpectrogramData,
} from "../services/enhanced-ai-service";
import { toast } from "sonner";

export const SonarAIDashboard: React.FC = () => {
  const [events, setEvents] = useState<SonarEvent[]>([]);
  const [risks, setRisks] = useState<SonarRisk[]>([]);
  const [statistics, setStatistics] = useState<unknown>(null);
  const [spectrogramData, setSpectrogramData] = useState<SpectrogramData | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<SonarRisk | null>(null);

  useEffect(() => {
    loadData();
    generateDemoSpectrogram();
  }, []);

  const loadData = async () => {
    const [eventsData, risksData, stats] = await Promise.all([
      enhancedSonarAIService.getRecentEvents(20),
      enhancedSonarAIService.getActiveRisks(),
      enhancedSonarAIService.getRiskStatistics(),
    ]);

    setEvents(eventsData);
    setRisks(risksData);
    setStatistics(stats);
  };

  const generateDemoSpectrogram = () => {
    const demoData = enhancedSonarAIService.generateSpectrogram([], 80);
    setSpectrogramData(demoData);
  };

  const performAIScan = async () => {
    setScanning(true);
    try {
      // Simulate sonar scan with AI classification
      const mockPing = {
        frequency: Math.random() * 300,
        amplitude: -80 + Math.random() * 50,
        duration: Math.random() * 5,
      };

      // AI Classification
      const classification = await enhancedSonarAIService.classifySignal(
        mockPing.frequency,
        mockPing.amplitude,
        mockPing.duration
      );

      // Create sonar event
      const event: SonarEvent = {
        vessel_id: null,
        event_type: "detection",
        detection_type: classification.detectionType,
        confidence_score: classification.confidence * 100,
        distance_meters: 500 + Math.random() * 4500,
        depth_meters: 10 + Math.random() * 90,
        bearing_degrees: Math.random() * 360,
        frequency_khz: mockPing.frequency,
        amplitude_db: mockPing.amplitude,
        classification: classification.classification,
        ai_model_version: "v1.0.0-onnx",
      };

      const eventId = await enhancedSonarAIService.saveSonarEvent(event);

      if (eventId) {
        // Assess risk
        const risk = enhancedSonarAIService.assessRisk(event);
        risk.event_id = eventId;

        await enhancedSonarAIService.saveSonarRisk(risk);

        toast.success(`Detecção classificada: ${classification.classification}`);
        
        // Reload data
        await loadData();
      }
    } catch (error) {
      console.error("Error performing AI scan:", error);
      toast.error("Erro ao executar scan AI");
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledgeRisk = async (riskId: string) => {
    const success = await enhancedSonarAIService.updateRiskStatus(riskId, "acknowledged");
    if (success) {
      toast.success("Risco reconhecido");
      await loadData();
    }
  };

  const handleResolveRisk = async (riskId: string) => {
    const success = await enhancedSonarAIService.updateRiskStatus(
      riskId,
      "resolved",
      "Risco mitigado através de manobra evasiva"
    );
    if (success) {
      toast.success("Risco resolvido");
      await loadData();
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const colors = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return colors[level as keyof typeof colors] || "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Sonar AI Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Análise AI em tempo real com classificação ONNX
          </p>
        </div>
        <Button onClick={performAIScan} disabled={scanning}>
          {scanning ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              Escaneando...
            </>
          ) : (
            <>
              <Radar className="h-4 w-4 mr-2" />
              Executar Scan AI
            </>
          )}
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Riscos Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {statistics.byLevel.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">Ação imediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Altos</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {statistics.byLevel.high || 0}
              </div>
              <p className="text-xs text-muted-foreground">Monitorar de perto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Detecções</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">Últimas 24h</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alertas de Risco
          </TabsTrigger>
          <TabsTrigger value="events">
            <Radar className="h-4 w-4 mr-2" />
            Detecções
          </TabsTrigger>
          <TabsTrigger value="spectrogram">
            <Activity className="h-4 w-4 mr-2" />
            Espectrograma
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Risco Ativos</CardTitle>
              <CardDescription>
                Riscos identificados pelo sistema AI que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {risks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum risco ativo no momento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {risks.map((risk) => (
                      <Card key={risk.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(risk.risk_level)}`} />
                            <div>
                              <Badge variant={getRiskLevelBadge(risk.risk_level) as unknown}>
                                {risk.risk_level.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="ml-2">
                                {risk.risk_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            Score: {risk.risk_score}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Descrição:</strong> {risk.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <strong>Ação Recomendada:</strong> {risk.recommended_action}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlehandleAcknowledgeRisk}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Reconhecer
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlehandleResolveRisk}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detecções Recentes</CardTitle>
              <CardDescription>
                Eventos detectados e classificados pelo sistema AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Radar className="h-12 w-12 mx-auto mb-4" />
                    <p>Nenhuma detecção recente</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="border rounded-lg p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{event.classification}</div>
                          <Badge variant="outline">
                            {(event.confidence_score).toFixed(0)}% confiança
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>Distância: {(event.distance_meters / 1000).toFixed(2)} km</div>
                          <div>Profundidade: {event.depth_meters.toFixed(0)} m</div>
                          <div>Azimute: {event.bearing_degrees.toFixed(0)}°</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(event.detected_at || "").toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spectrogram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizador de Espectrograma</CardTitle>
              <CardDescription>
                Análise de frequência em tempo real dos sinais sonar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-950 rounded-lg p-4 relative overflow-hidden">
                {spectrogramData ? (
                  <div className="text-white/70 text-center space-y-2">
                    <Activity className="h-16 w-16 mx-auto animate-pulse" />
                    <p className="text-sm">Espectrograma Simulado</p>
                    <p className="text-xs">
                      {spectrogramData.frequencies.length} frequências × {spectrogramData.timeSteps.length} passos
                    </p>
                    <div className="mt-4 text-xs text-left max-w-md mx-auto">
                      <p className="mb-2">• Faixa de frequência: 0-{spectrogramData.frequencies[spectrogramData.frequencies.length - 1]} kHz</p>
                      <p className="mb-2">• Resolução temporal: {spectrogramData.timeSteps.length} amostras</p>
                      <p>• Processamento: Transformada de Fourier em tempo real</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <p>Carregando dados de espectrograma...</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>Nota:</strong> Visualização simulada. Em produção, este painel mostraria
                  um espectrograma real com análise de frequência usando bibliotecas de visualização
                  como D3.js ou Canvas API.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
