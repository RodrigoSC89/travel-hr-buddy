/**
 * useIoTSimulator Hook - Control IoT sensor simulation via edge function
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/supabase/edge-function-helper";

interface SimulatorConfig {
  intervalMs: number;
  bulkCount: number;
  anomalyChance: number;
}

interface UseIoTSimulatorReturn {
  isRunning: boolean;
  lastResult: any;
  error: string | null;
  totalSent: number;
  anomaliesGenerated: number;
  start: (config?: Partial<SimulatorConfig>) => void;
  stop: () => void;
  sendBurst: (count?: number) => Promise<void>;
}

const DEFAULT_CONFIG: SimulatorConfig = {
  intervalMs: 3000,
  bulkCount: 5,
  anomalyChance: 0.08,
};

export function useIoTSimulator(): UseIoTSimulatorReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalSent, setTotalSent] = useState(0);
  const [anomaliesGenerated, setAnomaliesGenerated] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<SimulatorConfig>(DEFAULT_CONFIG);

  const sendReading = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('iot-sensor-simulator', {
        body: {},
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      setLastResult(data);
      setTotalSent(prev => prev + 1);
      if (data?.data?.is_anomaly) {
        setAnomaliesGenerated(prev => prev + 1);
      }
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send sensor reading';
      setError(errorMessage);
      logger.error('[IoT Simulator] Error:', err);
    }
  }, []);

  const sendBurst = useCallback(async (count: number = 10) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('iot-sensor-simulator', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Use query params for bulk operation
      const response = await fetch(
        `${getEdgeFunctionUrl('iot-sensor-simulator')}?action=bulk&count=${count}&anomaly=${configRef.current.anomalyChance}`,
        {
          method: 'POST',
          headers: getEdgeFunctionHeaders(),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Bulk insert failed');
      }

      setLastResult(result);
      setTotalSent(prev => prev + (result.data?.length || count));
      setAnomaliesGenerated(prev => prev + (result.anomalies || 0));
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send burst';
      setError(errorMessage);
      logger.error('[IoT Simulator] Burst error:', err);
    }
  }, []);

  const start = useCallback((config?: Partial<SimulatorConfig>) => {
    if (config) {
      configRef.current = { ...configRef.current, ...config };
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsRunning(true);
    sendReading(); // Send immediately

    intervalRef.current = setInterval(sendReading, configRef.current.intervalMs);
  }, [sendReading]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    lastResult,
    error,
    totalSent,
    anomaliesGenerated,
    start,
    stop,
    sendBurst,
  };
}
