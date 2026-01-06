/**
 * Hook for Scenario Simulator (Monte Carlo)
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

import { useState, useCallback } from 'react';
import { 
  scenarioSimulator, 
  type ScenarioInput, 
  type ScenarioOutput,
  type ScenarioVariable 
} from '@/lib/ai/scenario-simulator';
import { toast } from 'sonner';

export interface UseScenarioSimulatorReturn {
  isSimulating: boolean;
  result: ScenarioOutput | null;
  history: ScenarioOutput[];
  simulate: (input: ScenarioInput) => Promise<ScenarioOutput>;
  clearHistory: () => void;
  setSimulationCount: (count: number) => void;
  createVariable: (params: Partial<ScenarioVariable>) => ScenarioVariable;
}

export function useScenarioSimulator(): UseScenarioSimulatorReturn {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioOutput | null>(null);
  const [history, setHistory] = useState<ScenarioOutput[]>([]);

  const simulate = useCallback(async (input: ScenarioInput): Promise<ScenarioOutput> => {
    setIsSimulating(true);
    
    try {
      toast.info('Iniciando simulação Monte Carlo...', {
        description: `${10000} iterações`
      });
      
      const output = await scenarioSimulator.simulate(input);
      
      setResult(output);
      setHistory(prev => [...prev, output]);
      
      toast.success('Simulação concluída', {
        description: `Confiança: ${(output.confidence * 100).toFixed(0)}%`
      });
      
      return output;
    } catch (error) {
      toast.error('Erro na simulação', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    } finally {
      setIsSimulating(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setResult(null);
  }, []);

  const setSimulationCount = useCallback((count: number) => {
    scenarioSimulator.setSimulationCount(count);
  }, []);

  const createVariable = useCallback((params: Partial<ScenarioVariable>): ScenarioVariable => {
    return {
      name: params.name || 'variable',
      currentValue: params.currentValue || 100,
      proposedValue: params.proposedValue || params.currentValue || 100,
      unit: params.unit || 'units',
      distribution: params.distribution || 'normal',
      stdDev: params.stdDev,
      min: params.min,
      max: params.max
    };
  }, []);

  return {
    isSimulating,
    result,
    history,
    simulate,
    clearHistory,
    setSimulationCount,
    createVariable
  };
}
