/**
 * useDigitalTwin Hook
 * React interface for Digital Twin Engine
 */
import { useState, useCallback } from 'react';
import { 
  digitalTwinEngine,
  type VesselDigitalTwin,
  type SimulationScenario,
  type SimulationResult
} from '@/lib/ai/engines/digital-twin-engine';

export interface UseDigitalTwinReturn {
  isSimulating: boolean;
  twin: VesselDigitalTwin | null;
  simulationResult: SimulationResult | null;
  syncTwin: (vesselId: string, vesselName: string, imoNumber: string, vesselType: string, sensorData?: Partial<VesselDigitalTwin>) => VesselDigitalTwin;
  getTwin: (vesselId: string) => VesselDigitalTwin | undefined;
  runSimulation: (vesselId: string, scenario: SimulationScenario) => SimulationResult;
  predictFailures: (vesselId: string, horizonDays?: number) => ReturnType<typeof digitalTwinEngine.predictFailures>;
}

export function useDigitalTwin(): UseDigitalTwinReturn {
  const [isSimulating, setIsSimulating] = useState(false);
  const [twin, setTwin] = useState<VesselDigitalTwin | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const syncTwin = useCallback((
    vesselId: string, 
    vesselName: string, 
    imoNumber: string, 
    vesselType: string,
    sensorData: Partial<VesselDigitalTwin> = {}
  ): VesselDigitalTwin => {
    const newTwin = digitalTwinEngine.syncTwin(vesselId, vesselName, imoNumber, vesselType, sensorData);
    setTwin(newTwin);
    return newTwin;
  }, []);

  const getTwin = useCallback((vesselId: string): VesselDigitalTwin | undefined => {
    const existingTwin = digitalTwinEngine.getTwin(vesselId);
    if (existingTwin) {
      setTwin(existingTwin);
    }
    return existingTwin;
  }, []);

  const runSimulation = useCallback((vesselId: string, scenario: SimulationScenario): SimulationResult => {
    setIsSimulating(true);
    try {
      const result = digitalTwinEngine.runSimulation(vesselId, scenario);
      setSimulationResult(result);
      return result;
    } finally {
      setIsSimulating(false);
    }
  }, []);

  const predictFailures = useCallback((vesselId: string, horizonDays: number = 30) => {
    return digitalTwinEngine.predictFailures(vesselId, horizonDays);
  }, []);

  return {
    isSimulating,
    twin,
    simulationResult,
    syncTwin,
    getTwin,
    runSimulation,
    predictFailures
  };
}
