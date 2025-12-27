/**
 * Hook for Autonomous Executor
 * Provides React integration with the AI Ops autonomous execution system
 */

import { useState, useEffect, useCallback } from "react";
import {
  autonomousExecutor,
  type ExecutionRule,
  type ExecutionLog
} from "@/lib/autonomy/AutonomousExecutor";

export interface UseAutonomousExecutorReturn {
  rules: ExecutionRule[];
  logs: ExecutionLog[];
  statistics: {
    totalExecutions: number;
    successRate: number;
    failedCount: number;
    pendingCount: number;
    rulesActive: number;
    isMonitoring: boolean;
  };
  isMonitoring: boolean;
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;
  toggleRule: (ruleId: string) => boolean;
  executePending: (logId: string) => Promise<boolean>;
  rollback: (logId: string) => Promise<boolean>;
  addRule: (rule: ExecutionRule) => void;
  updateRule: (ruleId: string, updates: Partial<ExecutionRule>) => void;
  deleteRule: (ruleId: string) => void;
  refresh: () => void;
}

export function useAutonomousExecutor(): UseAutonomousExecutorReturn {
  const [rules, setRules] = useState<ExecutionRule[]>([]);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [statistics, setStatistics] = useState(autonomousExecutor.getStatistics());
  const [isMonitoring, setIsMonitoring] = useState(false);

  const refresh = useCallback(() => {
    setRules(autonomousExecutor.getRules());
    setLogs(autonomousExecutor.getLogs());
    const stats = autonomousExecutor.getStatistics();
    setStatistics(stats);
    setIsMonitoring(stats.isMonitoring);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const startMonitoring = useCallback((intervalMs?: number) => {
    autonomousExecutor.startMonitoring(intervalMs);
    refresh();
  }, [refresh]);

  const stopMonitoring = useCallback(() => {
    autonomousExecutor.stopMonitoring();
    refresh();
  }, [refresh]);

  const toggleRule = useCallback((ruleId: string): boolean => {
    const result = autonomousExecutor.toggleRule(ruleId);
    refresh();
    return result;
  }, [refresh]);

  const executePending = useCallback(async (logId: string): Promise<boolean> => {
    const result = await autonomousExecutor.executePending(logId);
    refresh();
    return result;
  }, [refresh]);

  const rollback = useCallback(async (logId: string): Promise<boolean> => {
    const result = await autonomousExecutor.rollback(logId);
    refresh();
    return result;
  }, [refresh]);

  const addRule = useCallback((rule: ExecutionRule) => {
    autonomousExecutor.addRule(rule);
    refresh();
  }, [refresh]);

  const updateRule = useCallback((ruleId: string, updates: Partial<ExecutionRule>) => {
    autonomousExecutor.updateRule(ruleId, updates);
    refresh();
  }, [refresh]);

  const deleteRule = useCallback((ruleId: string) => {
    autonomousExecutor.deleteRule(ruleId);
    refresh();
  }, [refresh]);

  return {
    rules,
    logs,
    statistics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    toggleRule,
    executePending,
    rollback,
    addRule,
    updateRule,
    deleteRule,
    refresh
  };
}
