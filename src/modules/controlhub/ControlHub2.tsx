/**
 * ControlHub 2.0
 * Predictive Control Console
 * Evolution from reactive panel to predictive decision system
 */

import React, { useEffect, useState } from "react";
import { forecastEngine } from "@/modules/forecast/ForecastEngine";
import { nautilusAI } from "@/modules/ai/AdaptiveAI";
import { ForecastData } from "@/types/forecast";
import { AIAdvice } from "@/types/ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Activity, RefreshCw } from "lucide-react";

export default function ControlHub2() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();

    // Subscribe to real-time forecast updates
    const unsubscribe = forecastEngine.onUpdate((data) => {
      setForecast(data);
      updateAdvice(data);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const forecastData = await forecastEngine.getForecast();
      setForecast(forecastData);
      updateAdvice(forecastData);
    } catch (error) {
      console.error("Failed to load forecast data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdvice = (forecastData: ForecastData) => {
    const context = JSON.stringify(forecastData.forecast);
    const aiAdvice = nautilusAI.advise(context);
    setAdvice(aiAdvice);

    // Learn from the forecast
    nautilusAI.learn({
      timestamp: new Date().toISOString(),
      message: `Forecast processed: ${Object.keys(forecastData.forecast).length} modules`,
      context,
      severity: 'info',
    });
  };

  const handleRefresh = async () => {
    await loadData();
  };

  if (loading && !forecast) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando previsões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">
            ControlHub 2.0 – Console Preditivo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Previsão e Decisão Operacional
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* AI Advisor Card */}
      {advice && (
        <Card className={`border-l-4 ${
          advice.priority === 'critical' ? 'border-l-red-500' :
          advice.priority === 'high' ? 'border-l-orange-500' :
          advice.priority === 'medium' ? 'border-l-yellow-500' :
          'border-l-green-500'
        }`}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-1 ${
                advice.priority === 'critical' ? 'text-red-500' :
                advice.priority === 'high' ? 'text-orange-500' :
                advice.priority === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <div className="flex-1">
                <CardTitle className="text-lg">NautilusAI Advisor</CardTitle>
                <CardDescription>
                  Confiança: {(advice.confidence * 100).toFixed(0)}% • Prioridade: {advice.priority}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-300 font-semibold mb-3">{advice.message}</p>
            {advice.recommendations && advice.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Recomendações:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {advice.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Forecast Data */}
      {forecast && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <CardTitle>Previsões Operacionais</CardTitle>
            </div>
            <CardDescription>
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-4 rounded-lg shadow-md">
              <div className="space-y-3">
                {Object.entries(forecast.forecast).map(([module, status]) => (
                  <div key={module} className="border-b border-gray-800 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-green-400">{module}</p>
                        <p className="text-sm text-gray-400 mt-1">{status}</p>
                      </div>
                      <Activity className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground">DP Reliability</p>
              <p className="text-3xl font-bold text-green-600">98.5%</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">Sistema IA</p>
              <p className="text-3xl font-bold text-blue-600">Online</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-muted-foreground">BridgeLink</p>
              <p className="text-3xl font-bold text-purple-600">Ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-xs text-center text-muted-foreground pt-4 border-t">
        Nautilus One v3.2 • Beta 3.2 • Forecast & IA Adaptativa
      </div>
    </div>
  );
}
