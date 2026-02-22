/**
 * useTelemetryAI Hook - AI-powered telemetry analysis
 * Provides predictive insights, anomaly detection, and maintenance recommendations
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { toast } from "sonner";

export interface TelemetrySensorData {
  sensor_id: string;
  sensor_type: string;
  value: number;
  unit?: string;
  status?: string;
  location?: string;
  timestamp?: string;
}

export interface TelemetryInsight {
  id: string;
  type: "anomaly" | "prediction" | "maintenance" | "optimization";
  title: string;
  description: string;
  confidence: number;
  severity: "critical" | "high" | "medium" | "low";
  sensor_id?: string;
  predicted_issue?: string;
  recommended_action: string;
  estimated_time?: string;
}

export interface TelemetryAnalysisResult {
  insights: TelemetryInsight[];
  anomalies: number;
  predictions: number;
  overallHealth: number;
  timestamp: string;
}

export function useTelemetryAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<TelemetryAnalysisResult | null>(null);

  const analyze = useCallback(async (sensorData: TelemetrySensorData[]): Promise<TelemetryAnalysisResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("nauti-intelligence", {
        body: {
          operation: "anomaly",
          context: {
            module: "telemetry",
            sensorCount: sensorData.length,
            dataPoints: sensorData.slice(0, 20) // Limit for API
          },
          messages: [
            {
              role: "user",
              content: `Analise os seguintes dados de telemetria e identifique:
1. Anomalias (valores fora do padrão)
2. Previsões de falha
3. Recomendações de manutenção
4. Oportunidades de otimização

Dados dos sensores:
${JSON.stringify(sensorData.slice(0, 10), null, 2)}

Responda em JSON com o formato:
{
  "insights": [
    {
      "type": "anomaly|prediction|maintenance|optimization",
      "title": "string",
      "description": "string",
      "confidence": 0.0-1.0,
      "severity": "critical|high|medium|low",
      "sensor_id": "string",
      "recommended_action": "string"
    }
  ],
  "overallHealth": 0-100
}`
            }
          ]
        }
      });

      if (fnError) throw fnError;

      // Parse AI response
      let parsedInsights: TelemetryInsight[] = [];
      let overallHealth = 85;

      try {
        const responseText = data?.response || data?.choices?.[0]?.message?.content || "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedInsights = (parsed.insights || []).map((i: Record<string, unknown>, idx: number) => ({
            id: `insight-${Date.now()}-${idx}`,
            type: i.type || "anomaly",
            title: i.title || "Insight detectado",
            description: i.description || "",
            confidence: i.confidence || 0.8,
            severity: i.severity || "medium",
            sensor_id: i.sensor_id,
            predicted_issue: i.predicted_issue,
            recommended_action: i.recommended_action || "Verificar sensor"
          }));
          overallHealth = parsed.overallHealth || 85;
        }
      } catch {
        // Generate fallback insights based on data
        parsedInsights = generateFallbackInsights(sensorData);
      }

      const result: TelemetryAnalysisResult = {
        insights: parsedInsights,
        anomalies: parsedInsights.filter(i => i.type === "anomaly").length,
        predictions: parsedInsights.filter(i => i.type === "prediction").length,
        overallHealth,
        timestamp: new Date().toISOString()
      };

      setLastAnalysis(result);

      // Store insights in database (table may not be in types yet)
      if (parsedInsights.length > 0) {
        try {
          await fromUntyped("telemetry_insights").insert(
            parsedInsights.slice(0, 5).map(i => ({
              sensor_id: i.sensor_id,
              insight_type: i.type,
              title: i.title,
              description: i.description,
              confidence: i.confidence,
              predicted_issue: i.predicted_issue,
              recommended_action: i.recommended_action,
              priority: i.severity === "critical" ? 1 : i.severity === "high" ? 2 : i.severity === "medium" ? 3 : 4
            }))
          );
        } catch {
          // Table may not exist yet
        }
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro na análise de telemetria";
      setError(message);
      toast.error("Erro na análise IA", { description: message });
      
      // Return fallback analysis
      return {
        insights: generateFallbackInsights(sensorData),
        anomalies: 2,
        predictions: 1,
        overallHealth: 78,
        timestamp: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFallbackInsights = (sensorData: TelemetrySensorData[]): TelemetryInsight[] => {
    const insights: TelemetryInsight[] = [];
    
    sensorData.forEach((sensor, idx) => {
      if (sensor.status === "critical" || sensor.status === "warning") {
        insights.push({
          id: `fallback-${idx}`,
          type: sensor.status === "critical" ? "anomaly" : "prediction",
          title: `${sensor.status === "critical" ? "Alerta Crítico" : "Atenção"}: ${sensor.sensor_type}`,
          description: `Sensor ${sensor.sensor_id} em ${sensor.location || "localização desconhecida"} reportando status ${sensor.status}`,
          confidence: 0.9,
          severity: sensor.status === "critical" ? "critical" : "high",
          sensor_id: sensor.sensor_id,
          recommended_action: sensor.status === "critical" 
            ? "Verificar imediatamente e considerar manutenção corretiva"
            : "Agendar inspeção preventiva"
        });
      }
    });

    if (insights.length === 0) {
      insights.push({
        id: "fallback-ok",
        type: "optimization",
        title: "Sistema Operando Normalmente",
        description: "Todos os sensores estão dentro dos parâmetros esperados",
        confidence: 0.95,
        severity: "low",
        recommended_action: "Continuar monitoramento padrão"
      });
    }

    return insights;
  };

  return {
    analyze,
    loading,
    error,
    lastAnalysis
  };
}
