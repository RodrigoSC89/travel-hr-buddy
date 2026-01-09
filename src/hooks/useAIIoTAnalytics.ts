import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SensorData {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  location: string;
  timestamp?: string;
}

interface Anomaly {
  sensorId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface MaintenancePrediction {
  equipment: string;
  failureProbability: number;
  estimatedTimeToFailure: string;
  recommendedAction: string;
}

interface Alert {
  id: string;
  sensorId: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  suggestedAction: string;
  timestamp: string;
}

interface AnalyticsResult {
  anomalies?: Anomaly[];
  predictions?: MaintenancePrediction[];
  alerts?: Alert[];
  optimizations?: Array<{
    area: string;
    currentValue: number;
    recommendedValue: number;
    estimatedSavings: string;
  }>;
  analysis?: string;
}

export function useAIIoTAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectAnomalies = useCallback(async (
    sensorData: SensorData[],
    historicalData?: Record<string, unknown>
  ): Promise<AnalyticsResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-iot-analytics', {
        body: { action: 'anomaly_detection', sensorData, historicalData }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to detect anomalies');

      const result = data.result as AnalyticsResult;
      if (result.anomalies && result.anomalies.length > 0) {
        toast.warning(`${result.anomalies.length} anomalies detected`);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Anomaly detection failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictMaintenance = useCallback(async (
    sensorData: SensorData[]
  ): Promise<AnalyticsResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-iot-analytics', {
        body: { action: 'predictive_maintenance', sensorData }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to predict maintenance');

      toast.success('Maintenance predictions generated');
      return data.result as AnalyticsResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Prediction failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateAlerts = useCallback(async (
    sensorData: SensorData[],
    alertThresholds?: Record<string, { min: number; max: number }>
  ): Promise<Alert[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-iot-analytics', {
        body: { action: 'generate_alerts', sensorData, alertThresholds }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to generate alerts');

      const result = data.result as AnalyticsResult;
      return result.alerts || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeOperations = useCallback(async (
    sensorData: SensorData[]
  ): Promise<AnalyticsResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-iot-analytics', {
        body: { action: 'optimize_operations', sensorData }
      });

      if (fnError) throw new Error(fnError.message);
      if (!data.success) throw new Error(data.error || 'Failed to optimize');

      toast.success('Optimization recommendations ready');
      return data.result as AnalyticsResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Optimization failed: ${message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    detectAnomalies,
    predictMaintenance,
    generateAlerts,
    optimizeOperations,
    isLoading,
    error
  };
}
