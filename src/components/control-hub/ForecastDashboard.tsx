// @ts-nocheck
/**
 * ForecastDashboard Component
 * Real-time AI predictive failure forecast dashboard
 * @module ForecastDashboard
 */

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gauge, TrendingUp, AlertTriangle, Loader } from "lucide-react";
import { runForecastAnalysis } from "@/lib/ai/forecast-engine";
import { logger } from "@/lib/logger";

interface ForecastState {
  level: string;
  value: number;
  message?: string;
  status?: string;
}

export default function ForecastDashboard() {
  const [forecast, setForecast] = useState<ForecastState>({ 
    level: "Carregando", 
    value: 0,
    status: "loading"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load forecast data immediately on mount
    loadForecast();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadForecast();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadForecast = async () => {
    try {
      const result = await runForecastAnalysis();
      
      if (result.status === "success" && result.level) {
        setForecast({
          level: result.level,
          value: result.value || 0,
          message: result.message,
          status: "success"
        });
      } else if (result.status === "no-data") {
        setForecast({
          level: "Sem Dados",
          value: 0,
          message: result.message || "Aguardando dados de telemetria",
          status: "no-data"
        });
      } else {
        setForecast({
          level: "Erro",
          value: 0,
          message: result.message || "Erro ao carregar previsão",
          status: "error"
        });
      }
    } catch (error) {
      logger.error("❌ Error loading forecast:", error);
      setForecast({
        level: "Erro",
        value: 0,
        message: "Falha ao conectar com serviço de previsão",
        status: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = () => {
    switch (forecast.level) {
      case "OK":
        return "text-green-400";
      case "Risco":
        return "text-yellow-400";
      case "Crítico":
        return "text-red-500";
      case "Sem Dados":
        return "text-gray-400";
      case "Erro":
        return "text-orange-400";
      default:
        return "text-blue-400";
    }
  };

  const getLevelIcon = () => {
    switch (forecast.level) {
      case "OK":
        return "🟢";
      case "Risco":
        return "🟡";
      case "Crítico":
        return "🔴";
      case "Sem Dados":
        return "⚪";
      case "Erro":
        return "⚠️";
      default:
        return "⏳";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Forecast Global — AI Predictive Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-3 text-gray-400">Carregando previsões...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Risk Level Display */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getLevelIcon()}</span>
                <div>
                  <p className="text-sm text-gray-400">Status Atual</p>
                  <p className={`text-xl font-bold ${getLevelColor()}`}>
                    {forecast.level}
                  </p>
                </div>
              </div>
              
              {forecast.status === "success" && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Probabilidade</p>
                  <p className={`text-2xl font-bold ${getLevelColor()}`}>
                    {(forecast.value * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className={`text-sm ${getLevelColor()}`}>
                {forecast.message || "Análise em andamento..."}
              </p>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-300">
                <p className="font-semibold mb-1">Previsão Preditiva de Falhas</p>
                <p className="text-blue-400/80">
                  Sistema baseado em ONNX ML • Atualização a cada 60s • Dados de telemetria DP
                </p>
              </div>
            </div>

            {/* Alert for Critical Status */}
            {forecast.level === "Crítico" && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800/30 rounded-lg animate-pulse">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="text-sm text-red-300">
                  <p className="font-semibold">Alerta Crítico Ativo</p>
                  <p className="text-red-400/80">
                    Protocolo DP ativado. Verifique sistemas de posicionamento dinâmico.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
