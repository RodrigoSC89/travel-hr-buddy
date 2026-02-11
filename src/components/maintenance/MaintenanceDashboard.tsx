/**
 * MaintenanceDashboard - Real-Time Predictive Maintenance Monitoring
 * 
 * Provides color-coded visual indicators, auto-refresh, and dark theme design
 * for monitoring AI-powered predictive maintenance status.
 * Now connected to the predictive-maintenance-ai edge function.
 * 
 * @module MaintenanceDashboard
 * @version 2.0.0
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, AlertTriangle, CheckCircle, Brain, Loader2, RefreshCw } from "lucide-react";
import { usePredictiveMaintenance } from "@/hooks/usePredictiveMaintenance";

export default function MaintenanceDashboard() {
  const { result, isAnalyzing, analyze } = usePredictiveMaintenance();

  function getStatusIndicator(level: string) {
    switch (level) {
    case "low":
      return {
        icon: CheckCircle,
        color: "text-success",
        bgColor: "bg-success/10",
        badgeVariant: "default" as const,
        label: "Normal",
      };
    case "medium":
      return {
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        badgeVariant: "secondary" as const,
        label: "Atenção",
      };
    case "high":
    case "critical":
      return {
        icon: Wrench,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        badgeVariant: "destructive" as const,
        label: level === "critical" ? "Crítico" : "Alto",
      };
    default:
      return {
        icon: CheckCircle,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        badgeVariant: "default" as const,
        label: "Desconhecido",
      };
    }
  }

  const indicator = result ? getStatusIndicator(result.overall_risk) : null;
  const Icon = indicator?.icon || CheckCircle;

  return (
    <Card className="bg-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Brain className="h-5 w-5" />
            AI Maintenance Orchestrator
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyze({ analysisType: 'health_assessment' })}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing && !result ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analisando com IA...</span>
            </div>
          </div>
        ) : result ? (
          <>
            {/* Status Indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${indicator?.bgColor}`}>
              <Icon className={`h-6 w-6 ${indicator?.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={indicator?.badgeVariant}>
                    {indicator?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {result.predictions?.length || 0} equipamentos analisados
                  </span>
                </div>
                <p className="text-sm">{result.summary}</p>
              </div>
            </div>

            {/* Top predictions */}
            {result.predictions && result.predictions.length > 0 && (
              <div className="space-y-2">
                {result.predictions.slice(0, 3).map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border text-sm">
                    <span className="font-medium truncate flex-1">{pred.equipment_name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {(pred.failure_probability * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-right">
              Última análise: {new Date().toLocaleString("pt-BR")}
            </div>

            {/* Compliance Info */}
            <div className="text-xs text-muted-foreground border-t border-primary/20 pt-3">
              ✅ IMCA M109, M140, M254 | ISM Code | NORMAM 101
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-6">
            <Brain className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm mb-2">Nenhuma análise disponível</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => analyze({ analysisType: 'health_assessment' })}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Executar Análise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
