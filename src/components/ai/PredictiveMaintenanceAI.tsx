/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PREDICTIVE MAINTENANCE AI - Manutenção Preditiva com ML
 * Previsão de falhas, alertas automáticos, integração com manutenção
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, AlertTriangle, Wrench, Clock,
  CheckCircle, XCircle, RefreshCw, Sparkles, Ship, Zap, Settings
} from "lucide-react";

interface PredictionResult {
  componentId: string;
  componentName: string;
  vesselName: string;
  failureProbability: number;
  predictedFailureDate: string;
  daysUntilFailure: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  confidence: number;
  historicalData: {
    lastMaintenance: string;
    totalHours: number;
    failureHistory: number;
  };
}

interface MaintenanceAlert {
  id: string;
  type: "predictive" | "scheduled" | "overdue";
  severity: "info" | "warning" | "critical";
  message: string;
  component: string;
  vessel: string;
  createdAt: Date;
}

export const PredictiveMaintenanceAI: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalComponents: 0,
    atRisk: 0,
    preventedFailures: 0,
    accuracy: 0
  });

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate ML prediction analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate predictive data based on patterns
      const mockPredictions: PredictionResult[] = [
        {
          componentId: "comp-001",
          componentName: "Motor Principal BB",
          vesselName: "Navio Atlas",
          failureProbability: 0.78,
          predictedFailureDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilFailure: 15,
          riskLevel: "high",
          recommendedAction: "Agendar manutenção preventiva imediata. Verificar sistema de injeção e filtros.",
          confidence: 0.92,
          historicalData: {
            lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            totalHours: 12500,
            failureHistory: 2
          }
        },
        {
          componentId: "comp-002",
          componentName: "Bomba de Lastro #2",
          vesselName: "Navio Poseidon",
          failureProbability: 0.45,
          predictedFailureDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilFailure: 45,
          riskLevel: "medium",
          recommendedAction: "Programar inspeção para próxima docagem. Monitorar vibração.",
          confidence: 0.85,
          historicalData: {
            lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            totalHours: 8200,
            failureHistory: 1
          }
        },
        {
          componentId: "comp-003",
          componentName: "Gerador Auxiliar",
          vesselName: "Navio Tritão",
          failureProbability: 0.92,
          predictedFailureDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilFailure: 5,
          riskLevel: "critical",
          recommendedAction: "URGENTE: Parar operação e realizar manutenção corretiva. Risco de falha catastrófica.",
          confidence: 0.96,
          historicalData: {
            lastMaintenance: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
            totalHours: 22000,
            failureHistory: 4
          }
        },
        {
          componentId: "comp-004",
          componentName: "Sistema Hidráulico",
          vesselName: "Navio Atlas",
          failureProbability: 0.22,
          predictedFailureDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilFailure: 90,
          riskLevel: "low",
          recommendedAction: "Manutenção pode ser agendada conforme programação normal.",
          confidence: 0.88,
          historicalData: {
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalHours: 5600,
            failureHistory: 0
          }
        }
      ];

      const mockAlerts: MaintenanceAlert[] = [
        {
          id: "alert-001",
          type: "predictive",
          severity: "critical",
          message: "Gerador Auxiliar do Tritão apresenta 92% de probabilidade de falha em 5 dias",
          component: "Gerador Auxiliar",
          vessel: "Navio Tritão",
          createdAt: new Date()
        },
        {
          id: "alert-002",
          type: "predictive",
          severity: "warning",
          message: "Motor Principal BB do Atlas requer atenção - risco elevado detectado",
          component: "Motor Principal BB",
          vessel: "Navio Atlas",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: "alert-003",
          type: "scheduled",
          severity: "info",
          message: "Manutenção preventiva programada para próxima semana",
          component: "Bomba de Lastro #2",
          vessel: "Navio Poseidon",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      setPredictions(mockPredictions);
      setAlerts(mockAlerts);
      setLastAnalysis(new Date());
      setStats({
        totalComponents: 156,
        atRisk: 3,
        preventedFailures: 47,
        accuracy: 94.2
      });
    } catch (error) {
      console.error("Error loading predictions:", error);
      console.error("Error loading predictions:", error);
    } finally {
      setIsAnalyzing(false);
    }
  });

  const getRiskColor = (level: string) => {
    switch (level) {
    case "critical": return "bg-red-500 text-white";
    case "high": return "bg-orange-500 text-white";
    case "medium": return "bg-yellow-500 text-black";
    case "low": return "bg-green-500 text-white";
    default: return "bg-gray-500 text-white";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
    case "critical": return <XCircle className="h-4 w-4" />;
    case "high": return <AlertTriangle className="h-4 w-4" />;
    case "medium": return <Clock className="h-4 w-4" />;
    case "low": return <CheckCircle className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
    }
  };

  const createMaintenanceOrder = async (prediction: PredictionResult) => {
    // Would create a maintenance work order
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Settings className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Componentes Monitorados</p>
                <p className="text-2xl font-bold">{stats.totalComponents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Risco</p>
                <p className="text-2xl font-bold text-orange-500">{stats.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falhas Prevenidas</p>
                <p className="text-2xl font-bold text-green-500">{stats.preventedFailures}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precisão ML</p>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Alertas Preditivos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadPredictions} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    alert.severity === "critical" 
                      ? "bg-red-500/10 border-red-500/30" 
                      : alert.severity === "warning"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded ${
                        alert.severity === "critical" ? "bg-red-500/20" :
                          alert.severity === "warning" ? "bg-yellow-500/20" : "bg-blue-500/20"
                      }`}>
                        {alert.severity === "critical" ? <XCircle className="h-4 w-4 text-red-500" /> :
                          alert.severity === "warning" ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                            <Sparkles className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Ship className="h-3 w-3 mr-1" />
                            {alert.vessel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Wrench className="h-3 w-3 mr-1" />
                            {alert.component}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {predictions.map((prediction, index) => (
          <motion.div
            key={prediction.componentId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {getRiskIcon(prediction.riskLevel)}
                      <span className="ml-1 capitalize">{prediction.riskLevel}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(prediction.confidence * 100)}% confiança
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{prediction.componentName}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Ship className="h-3 w-3" />
                  {prediction.vesselName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Failure Probability */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Probabilidade de Falha</span>
                    <span className="text-sm font-bold">{Math.round(prediction.failureProbability * 100)}%</span>
                  </div>
                  <Progress 
                    value={prediction.failureProbability * 100} 
                    className={`h-2 ${
                      prediction.failureProbability > 0.7 ? "[&>div]:bg-red-500" :
                        prediction.failureProbability > 0.4 ? "[&>div]:bg-yellow-500" :
                          "[&>div]:bg-green-500"
                    }`}
                  />
                </div>

                {/* Time Until Failure */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Tempo estimado</span>
                  </div>
                  <span className={`font-bold ${
                    prediction.daysUntilFailure <= 7 ? "text-red-500" :
                      prediction.daysUntilFailure <= 30 ? "text-yellow-500" :
                        "text-green-500"
                  }`}>
                    {prediction.daysUntilFailure} dias
                  </span>
                </div>

                {/* Historical Data */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Horas Total</p>
                    <p className="text-sm font-bold">{prediction.historicalData.totalHours.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Falhas Anteriores</p>
                    <p className="text-sm font-bold">{prediction.historicalData.failureHistory}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">Última Manutenção</p>
                    <p className="text-sm font-bold">
                      {Math.round((Date.now() - new Date(prediction.historicalData.lastMaintenance).getTime()) / (24 * 60 * 60 * 1000))}d
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Recomendação IA</span>
                  </div>
                  <p className="text-sm">{prediction.recommendedAction}</p>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={prediction.riskLevel === "critical" ? "destructive" : "default"}
                  onClick={() => handlecreateMaintenanceOrder}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  {prediction.riskLevel === "critical" ? "Criar OS Urgente" : "Agendar Manutenção"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analysis Info */}
      {lastAnalysis && (
        <div className="text-center text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 inline mr-1" />
          Última análise ML: {lastAnalysis.toLocaleString("pt-BR")}
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenanceAI;
