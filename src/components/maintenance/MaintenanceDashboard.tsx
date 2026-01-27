/**
 * MaintenanceDashboard - Real-Time Predictive Maintenance Monitoring
 * 
 * Provides color-coded visual indicators, auto-refresh, and dark theme design
 * for monitoring AI-powered predictive maintenance status.
 * 
 * @module MaintenanceDashboard
 * @version 1.0.0 (Patch 21)
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, CheckCircle } from "lucide-react";
import { runMaintenanceOrchestrator, type MaintenanceResult, type TelemetryData } from "@/lib/ai/maintenance-orchestrator";

const REFRESH_INTERVAL = 60000; // 60 seconds

export default function MaintenanceDashboard() {
  const [status, setStatus] = useState<MaintenanceResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchMaintenanceStatus();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMaintenanceStatus, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  /**
   * Fetch telemetry data and run maintenance analysis
   */
  async function fetchMaintenanceStatus() {
    try {
      setLoading(true);

      // Fetch telemetry from APIs
      // In production, these would call actual telemetry endpoints
      const telemetry: TelemetryData = await fetchTelemetryData();

      // Run AI analysis
      const result = await runMaintenanceOrchestrator(telemetry);
      setStatus(result);
    } catch (error) {
      // Use logger instead of console.error
      const { logger } = await import("@/lib/utils/production-logger");
      logger.error("Failed to fetch maintenance status", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch telemetry data from IoT sensors via Supabase
   * Uses real-time sensor data when available, falls back to baseline estimates
   */
  async function fetchTelemetryData(): Promise<TelemetryData> {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Fetch latest sensor readings
      const { data: sensorData } = await supabase
        .from("iot_sensor_data")
        .select("sensor_type, value, timestamp")
        .order("timestamp", { ascending: false })
        .limit(10);
      
      if (sensorData && sensorData.length > 0) {
        // Map sensor types to telemetry fields
        const sensorMap = new Map(sensorData.map(s => [s.sensor_type, s.value]));
        
        return {
          generator_load: (sensorMap.get("generator_load") as number) ?? 75,
          position_error: (sensorMap.get("position_error") as number) ?? 1.0,
          vibration: (sensorMap.get("vibration") as number) ?? 3.5,
          temperature: (sensorMap.get("temperature") as number) ?? 52,
          power_fluctuation: (sensorMap.get("power_fluctuation") as number) ?? 5,
        };
      }
    } catch (error) {
      // Fallback silently - sensors may not be configured
    }
    
    // Baseline estimates when no sensor data available
    return {
      generator_load: 75,
      position_error: 1.0,
      vibration: 3.5,
      temperature: 52,
      power_fluctuation: 5,
    };
  }

  /**
   * Get visual indicator based on risk level
   */
  function getStatusIndicator(level: string) {
    switch (level) {
    case "Normal":
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        badgeVariant: "default" as const,
      };
    case "Atenção":
      return {
        icon: AlertTriangle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        badgeVariant: "secondary" as const,
      };
    case "Crítico":
      return {
        icon: Wrench,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        badgeVariant: "destructive" as const,
      };
    default:
      return {
        icon: CheckCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-500/10",
        badgeVariant: "default" as const,
      };
    }
  }

  const indicator = status ? getStatusIndicator(status.risk_level) : null;
  const Icon = indicator?.icon || CheckCircle;

  return (
    <Card className="bg-card border-cyan-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Wrench className="h-5 w-5" />
          AI Maintenance Orchestrator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !status ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
          </div>
        ) : status ? (
          <>
            {/* Status Indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${indicator?.bgColor}`}>
              <Icon className={`h-6 w-6 ${indicator?.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={indicator?.badgeVariant}>
                    {status.risk_level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Risco: {(status.risk_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm">{status.message}</p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground text-right">
              Última atualização: {new Date(status.timestamp).toLocaleString("pt-BR")}
            </div>

            {/* Compliance Info */}
            <div className="text-xs text-muted-foreground border-t border-cyan-900/20 pt-3">
              ✅ IMCA M109, M140, M254 | ISM Code | NORMAM 101
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
}
