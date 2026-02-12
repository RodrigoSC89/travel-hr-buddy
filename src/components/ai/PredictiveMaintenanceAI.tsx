/**
 * PREDICTIVE MAINTENANCE AI - Manutenção Preditiva com ML
 * Integrado com dados reais do Supabase
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Brain, AlertTriangle, TrendingUp, Wrench, Clock,
  CheckCircle, RefreshCw, Sparkles, Ship,
  Gauge, Settings
} from "lucide-react";
import { useMaintenancePredictions, useMaintenanceAlerts, useMaintenanceStats } from "@/hooks/usePredictiveData";

export const PredictiveMaintenanceAI: React.FC = () => {
  const { 
    data: predictions = [], 
    isLoading: predictionsLoading, 
    refetch: refetchPredictions 
  } = useMaintenancePredictions();
  
  const { 
    data: alerts = [], 
    isLoading: alertsLoading 
  } = useMaintenanceAlerts();
  
  const { 
    data: stats = { totalComponents: 0, atRisk: 0, preventedFailures: 0, accuracy: 0 },
    isLoading: statsLoading 
  } = useMaintenanceStats();

  const runAnalysis = async () => {
    toast.info("Executando análise preditiva...");
    await refetchPredictions();
    toast.success("Análise concluída!");
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-accent text-accent-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskBorder = (level: string) => {
    switch (level) {
      case "critical": return "border-destructive/50";
      case "high": return "border-warning/50";
      case "medium": return "border-accent/50";
      case "low": return "border-success/50";
      default: return "border-muted";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const isLoading = predictionsLoading || alertsLoading || statsLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manutenção Preditiva IA</h1>
            <p className="text-sm text-muted-foreground">
              Previsão de falhas com Machine Learning
            </p>
          </div>
        </div>

        <Button onClick={runAnalysis} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? "Analisando..." : "Executar Análise"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-2xl font-bold">{stats.totalComponents}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Componentes Monitorados</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {statsLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <span className="text-2xl font-bold text-warning">{stats.atRisk}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Em Risco</p>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="h-5 w-5 text-success" />
              {statsLoading ? (
                <Skeleton className="h-8 w-8" />
              ) : (
                <span className="text-2xl font-bold text-success">{stats.preventedFailures}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Falhas Prevenidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="h-5 w-5 text-primary" />
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Acurácia do Modelo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Predições de Falha
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictionsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`pred-skeleton-${i}`} className="h-24" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Brain className="h-12 w-12 mb-2 opacity-30" />
                <p>Nenhuma predição disponível</p>
                <p className="text-xs">Execute a análise para gerar predições</p>
              </div>
            ) : (
              <div className="space-y-3">
                {predictions.map((pred) => (
                  <motion.div
                    key={pred.componentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border-2 ${getRiskBorder(pred.riskLevel)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{pred.componentName}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Ship className="h-3 w-3" />
                          {pred.vesselName}
                        </p>
                      </div>
                      <Badge className={getRiskColor(pred.riskLevel)}>
                        {pred.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Probabilidade de Falha</span>
                        <span className="font-medium">{(pred.failureProbability * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={pred.failureProbability * 100} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pred.daysUntilFailure} dias
                      </span>
                      <span>Confiança: {(pred.confidence * 100).toFixed(0)}%</span>
                    </div>

                    <p className="mt-2 text-xs bg-muted/50 p-2 rounded">
                      {pred.recommendedAction}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={`alert-skeleton-${i}`} className="h-16" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-2 opacity-30 text-success" />
                <p>Nenhum alerta ativo</p>
                <p className="text-xs">Todos os sistemas operando normalmente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">{alert.type}</Badge>
                          <span>{alert.vessel}</span>
                          <span>•</span>
                          <span>{alert.createdAt.toLocaleTimeString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictiveMaintenanceAI;
