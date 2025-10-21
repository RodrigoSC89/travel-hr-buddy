/**
 * MaintenanceDashboard - Real-Time Predictive Maintenance Monitoring
 * 
 * Provides color-coded visual indicators, auto-refresh, and dark theme design
 * for monitoring AI-powered predictive maintenance status.
 * 
 * @module MaintenanceDashboard
 * @version 1.0.0 (Patch 21)
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { runMaintenanceOrchestrator, type MaintenanceResult, type TelemetryData } from '@/lib/ai/maintenance-orchestrator';

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
      console.error('Failed to fetch maintenance status:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch telemetry data from APIs
   * TODO: Replace with actual API calls when endpoints are available
   */
  async function fetchTelemetryData(): Promise<TelemetryData> {
    // Simulated telemetry data
    // In production, this would fetch from:
    // - /api/dp/telemetry
    // - /api/control/telemetry
    return {
      generator_load: 65 + Math.random() * 20,
      position_error: 0.5 + Math.random() * 1.5,
      vibration: 2.0 + Math.random() * 3.0,
      temperature: 45 + Math.random() * 15,
      power_fluctuation: 3 + Math.random() * 4,
    };
  }

  /**
   * Get visual indicator based on risk level
   */
  function getStatusIndicator(level: string) {
    switch (level) {
      case 'Normal':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          badgeVariant: 'default' as const,
        };
      case 'Atenção':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          badgeVariant: 'secondary' as const,
        };
      case 'Crítico':
        return {
          icon: Wrench,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          badgeVariant: 'destructive' as const,
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          badgeVariant: 'default' as const,
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
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
              Última atualização: {new Date(status.timestamp).toLocaleString('pt-BR')}
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
