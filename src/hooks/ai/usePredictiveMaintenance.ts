/**
 * usePredictiveMaintenance Hook
 * Interface para o engine de manutenção preditiva ONNX
 */

import { useState, useCallback } from 'react';
import { 
  predictiveMaintenanceONNX, 
  type EquipmentTelemetry, 
  type FailurePrediction,
  type MaintenanceSchedule 
} from '@/lib/ai/engines/predictive-maintenance-onnx';
import { toast } from 'sonner';

interface UsePredictiveMaintenanceReturn {
  isLoading: boolean;
  predictions: FailurePrediction[];
  schedule: MaintenanceSchedule[];
  predictFailure: (telemetry: EquipmentTelemetry) => Promise<FailurePrediction | null>;
  batchPredict: (telemetryList: EquipmentTelemetry[]) => Promise<FailurePrediction[]>;
  generateSchedule: (predictions: FailurePrediction[], constraints?: { maxConcurrentMaintenance?: number; preferredDays?: number[]; budgetLimit?: number }) => MaintenanceSchedule[];
  clearPredictions: () => void;
}

export function usePredictiveMaintenance(): UsePredictiveMaintenanceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<FailurePrediction[]>([]);
  const [schedule, setSchedule] = useState<MaintenanceSchedule[]>([]);

  const predictFailure = useCallback(async (telemetry: EquipmentTelemetry): Promise<FailurePrediction | null> => {
    setIsLoading(true);
    try {
      const prediction = await predictiveMaintenanceONNX.predictFailure(telemetry);
      setPredictions(prev => [...prev, prediction]);
      
      if (prediction.riskLevel === 'critical') {
        toast.error(`⚠️ Risco crítico detectado: ${prediction.equipmentId}`, {
          description: prediction.recommendedActions[0] || 'Ação imediata necessária'
        });
      } else if (prediction.riskLevel === 'high') {
        toast.warning(`Risco alto: ${prediction.equipmentId}`);
      }
      
      return prediction;
    } catch (error) {
      console.error('[usePredictiveMaintenance] Error:', error);
      toast.error('Erro ao analisar equipamento');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const batchPredict = useCallback(async (telemetryList: EquipmentTelemetry[]): Promise<FailurePrediction[]> => {
    setIsLoading(true);
    try {
      const results: FailurePrediction[] = [];
      for (const telemetry of telemetryList) {
        const prediction = await predictiveMaintenanceONNX.predictFailure(telemetry);
        results.push(prediction);
      }
      setPredictions(results);
      
      const criticalCount = results.filter(p => p.riskLevel === 'critical').length;
      const highCount = results.filter(p => p.riskLevel === 'high').length;
      
      if (criticalCount > 0) {
        toast.error(`${criticalCount} equipamento(s) em risco crítico!`);
      }
      if (highCount > 0) {
        toast.warning(`${highCount} equipamento(s) em risco alto`);
      }
      
      return results;
    } catch (error) {
      console.error('[usePredictiveMaintenance] Batch error:', error);
      toast.error('Erro na análise em lote');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateSchedule = useCallback((
    predictionList: FailurePrediction[], 
    constraints?: { maxConcurrentMaintenance?: number; preferredDays?: number[]; budgetLimit?: number }
  ): MaintenanceSchedule[] => {
    const scheduleResult = predictiveMaintenanceONNX.generateMaintenanceSchedule(
      predictionList, 
      constraints
    );
    setSchedule(scheduleResult);
    toast.success(`Cronograma gerado: ${scheduleResult.length} manutenções`);
    return scheduleResult;
  }, []);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    setSchedule([]);
  }, []);

  return {
    isLoading,
    predictions,
    schedule,
    predictFailure,
    batchPredict,
    generateSchedule,
    clearPredictions
  };
}
