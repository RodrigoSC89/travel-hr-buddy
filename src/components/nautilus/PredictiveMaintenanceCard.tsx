/**
import { useEffect, useState } from "react";;
 * Predictive Maintenance Card - AI-powered maintenance predictions
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNautilusPredictions, Prediction } from "@/hooks/useNautilusPredictions";
import { motion } from "framer-motion";
import {
  Wrench, AlertTriangle, CheckCircle, Clock, Brain,
  RefreshCw, ChevronRight, Loader2, TrendingUp
} from "lucide-react";

interface PredictiveMaintenanceCardProps {
  vesselId?: string;
  maintenanceData?: Record<string, any>;
}

export const PredictiveMaintenanceCard: React.FC<PredictiveMaintenanceCardProps> = ({
  vesselId,
  maintenanceData
}) => {
  const { isLoading, getPredictions } = useNautilusPredictions();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [overallRisk, setOverallRisk] = useState<string>("low");

  const fetchPredictions = async () => {
    const data = maintenanceData || {
      vesselId,
      engineHours: 12500,
      lastMaintenance: "2024-11-15",
      components: [
        { name: "Motor Principal", hours: 8500, lastService: "2024-10-01" },
        { name: "Sistema Hidráulico", hours: 6200, lastService: "2024-09-15" },
        { name: "Gerador Auxiliar", hours: 4800, lastService: "2024-11-01" },
      ],
      alerts: ["Vibração elevada no eixo principal", "Temperatura do óleo acima do normal"]
    };

    const result = await getPredictions("maintenance", data);
    if (result) {
      setPredictions(result.predictions);
      setSummary(result.summary);
      setOverallRisk(result.overallRisk);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [vesselId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "text-red-500 bg-red-100 dark:bg-red-900/30";
    case "high": return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
    case "medium": return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
    default: return "text-green-500 bg-green-100 dark:bg-green-900/30";
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return colors[risk] || colors.low;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Manutenção Preditiva
            </CardTitle>
            <CardDescription>
              Análise inteligente de falhas e manutenções
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getRiskBadge(overallRisk)} text-white`}>
              Risco: {overallRisk}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={fetchPredictions}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && predictions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Analisando dados...</p>
            </div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma predição de manutenção disponível</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchPredictions}>
              Analisar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            {summary && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <TrendingUp className="h-4 w-4 inline-block mr-2 text-primary" />
                {summary}
              </div>
            )}

            {/* Predictions List */}
            <div className="space-y-3">
              {predictions.slice(0, 5).map((prediction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(prediction.severity)}`}>
                      {prediction.severity === "critical" || prediction.severity === "high" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Wrench className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{prediction.title}</h4>
                        {prediction.probability && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(prediction.probability * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {prediction.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {prediction.recommendedAction}
                        </span>
                        {prediction.deadline && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {prediction.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {predictions.length > 5 && (
              <Button variant="outline" className="w-full" size="sm">
                Ver todas as {predictions.length} predições
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
