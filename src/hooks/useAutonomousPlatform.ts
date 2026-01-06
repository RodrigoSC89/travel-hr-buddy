/**
 * useAutonomousPlatform Hook
 * React interface for the Nautilus Autonomous Platform
 */

import { useState, useEffect, useCallback } from 'react';
import { autonomousEngine, type SystemStatus, type AutonomousConfig } from '@/lib/ai/autonomous/autonomous-engine';
import { agentOrchestrator, type AIAgent, type Decision } from '@/lib/ai/autonomous/agent-orchestrator';
import { vesselDigitalTwin, type VesselState, type Anomaly, type VesselPrediction } from '@/lib/ai/autonomous/digital-twin';

export interface UseAutonomousPlatformReturn {
  // Status
  status: SystemStatus;
  isRunning: boolean;
  isPaused: boolean;
  
  // State
  vesselState: VesselState | null;
  agents: AIAgent[];
  decisions: Decision[];
  pendingDecisions: Decision[];
  anomalies: Anomaly[];
  prediction: VesselPrediction | null;
  
  // Config
  config: AutonomousConfig;
  
  // Actions
  initialize: (vesselId: string, vesselName: string) => Promise<void>;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  approveDecision: (decisionId: string) => Promise<void>;
  rejectDecision: (decisionId: string, reason: string) => Promise<void>;
  updateConfig: (config: Partial<AutonomousConfig>) => void;
}

export function useAutonomousPlatform(): UseAutonomousPlatformReturn {
  const [status, setStatus] = useState<SystemStatus>(autonomousEngine.getStatus());
  const [vesselState, setVesselState] = useState<VesselState | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [prediction, setPrediction] = useState<VesselPrediction | null>(null);
  const [config, setConfig] = useState<AutonomousConfig>(autonomousEngine.getConfig());

  // Setup event listeners
  useEffect(() => {
    const handleStateUpdate = (state: unknown) => {
      setVesselState(state as VesselState);
    };

    const handleDecision = (decision: unknown) => {
      setDecisions(prev => [decision as Decision, ...prev].slice(0, 100));
    };

    const handleAnomalies = (newAnomalies: unknown) => {
      setAnomalies(prev => [...(newAnomalies as Anomaly[]), ...prev].slice(0, 50));
    };

    const handleStatusChange = () => {
      setStatus(autonomousEngine.getStatus());
    };

    const handleTick = () => {
      setStatus(autonomousEngine.getStatus());
      setAgents(agentOrchestrator.getAgents());
      setPrediction(vesselDigitalTwin.getLatestPrediction());
    };

    const handleConfigUpdate = (newConfig: unknown) => {
      setConfig(newConfig as AutonomousConfig);
    };

    // Subscribe to events
    autonomousEngine.on('state-update', handleStateUpdate);
    autonomousEngine.on('decision', handleDecision);
    autonomousEngine.on('decision-executed', handleDecision);
    autonomousEngine.on('decision-pending', handleDecision);
    autonomousEngine.on('anomalies', handleAnomalies);
    autonomousEngine.on('started', handleStatusChange);
    autonomousEngine.on('stopped', handleStatusChange);
    autonomousEngine.on('paused', handleStatusChange);
    autonomousEngine.on('resumed', handleStatusChange);
    autonomousEngine.on('tick', handleTick);
    autonomousEngine.on('config-updated', handleConfigUpdate);

    // Initial state
    setAgents(agentOrchestrator.getAgents());

    return () => {
      autonomousEngine.off('state-update', handleStateUpdate);
      autonomousEngine.off('decision', handleDecision);
      autonomousEngine.off('decision-executed', handleDecision);
      autonomousEngine.off('decision-pending', handleDecision);
      autonomousEngine.off('anomalies', handleAnomalies);
      autonomousEngine.off('started', handleStatusChange);
      autonomousEngine.off('stopped', handleStatusChange);
      autonomousEngine.off('paused', handleStatusChange);
      autonomousEngine.off('resumed', handleStatusChange);
      autonomousEngine.off('tick', handleTick);
      autonomousEngine.off('config-updated', handleConfigUpdate);
    };
  }, []);

  const initialize = useCallback(async (vesselId: string, vesselName: string) => {
    await autonomousEngine.initialize(vesselId, vesselName);
    setVesselState(vesselDigitalTwin.getState());
    setAgents(agentOrchestrator.getAgents());
  }, []);

  const start = useCallback(() => {
    autonomousEngine.start();
  }, []);

  const pause = useCallback(() => {
    autonomousEngine.pause();
  }, []);

  const resume = useCallback(() => {
    autonomousEngine.resume();
  }, []);

  const stop = useCallback(() => {
    autonomousEngine.stop();
  }, []);

  const approveDecision = useCallback(async (decisionId: string) => {
    await agentOrchestrator.approveDecision(decisionId);
    setDecisions(agentOrchestrator.getDecisionLog());
  }, []);

  const rejectDecision = useCallback(async (decisionId: string, reason: string) => {
    await agentOrchestrator.rejectDecision(decisionId, reason);
    setDecisions(agentOrchestrator.getDecisionLog());
  }, []);

  const updateConfig = useCallback((newConfig: Partial<AutonomousConfig>) => {
    autonomousEngine.updateConfig(newConfig);
  }, []);

  const pendingDecisions = decisions.filter(d => d.status === 'pending');

  return {
    status,
    isRunning: status.engineStatus === 'running',
    isPaused: status.engineStatus === 'paused',
    vesselState,
    agents,
    decisions,
    pendingDecisions,
    anomalies,
    prediction,
    config,
    initialize,
    start,
    pause,
    resume,
    stop,
    approveDecision,
    rejectDecision,
    updateConfig
  };
}
