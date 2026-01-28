/**
 * useAnomalyDetection Hook
 * Interface simplificada para detecção de anomalias em sensores IoT
 */

import { useState, useCallback } from 'react';
import { 
  anomalyDetectionIoT,
  type SensorReading,
  type AnomalyDetection
} from '@/lib/ai/engines/anomaly-detection-iot';
import { toast } from 'sonner';

interface UseAnomalyDetectionReturn {
  isLoading: boolean;
  anomalies: AnomalyDetection[];
  processReading: (reading: SensorReading) => Promise<AnomalyDetection | null>;
  processBatch: (readings: SensorReading[]) => Promise<AnomalyDetection[]>;
  getCriticalAnomalies: () => AnomalyDetection[];
  clearAnomalies: () => void;
}

export function useAnomalyDetection(): UseAnomalyDetectionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  const processReading = useCallback(async (reading: SensorReading): Promise<AnomalyDetection | null> => {
    setIsLoading(true);
    try {
      const detection = await anomalyDetectionIoT.processReading(reading);
      
      if (detection) {
        setAnomalies(prev => [...prev, detection]);
        
        if (detection.severity === 'critical') {
          toast.error(`🚨 Anomalia crítica: ${reading.sensorType}`, {
            description: detection.description
          });
        } else if (detection.severity === 'alert') {
          toast.warning(`Anomalia: ${reading.sensorType}`);
        }
      }
      
      return detection;
    } catch (error) {
      console.error('[useAnomalyDetection] Error:', error);
      toast.error('Erro na análise de sensor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processBatch = useCallback(async (readings: SensorReading[]): Promise<AnomalyDetection[]> => {
    setIsLoading(true);
    try {
      const detections: AnomalyDetection[] = [];
      
      for (const reading of readings) {
        const detection = await anomalyDetectionIoT.processReading(reading);
        if (detection) detections.push(detection);
      }
      
      setAnomalies(prev => [...prev, ...detections]);
      
      if (detections.length > 0) {
        toast.info(`${detections.length} anomalia(s) detectada(s)`);
      }
      
      return detections;
    } catch (error) {
      console.error('[useAnomalyDetection] Batch error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCriticalAnomalies = useCallback((): AnomalyDetection[] => {
    return anomalies.filter(a => a.severity === 'critical' || a.severity === 'alert');
  }, [anomalies]);

  const clearAnomalies = useCallback(() => {
    setAnomalies([]);
  }, []);

  return {
    isLoading,
    anomalies,
    processReading,
    processBatch,
    getCriticalAnomalies,
    clearAnomalies
  };
}
