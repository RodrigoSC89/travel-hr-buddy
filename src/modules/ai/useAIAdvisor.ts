/**
 * useAIAdvisor Hook
 * React hook for accessing AI advice
 */

import { useState, useCallback, useEffect } from "react";
import { nautilusAI } from "./AdaptiveAI";
import { AIAdvice, AILog } from "@/types/ai";

export const useAIAdvisor = () => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [stats, setStats] = useState(nautilusAI.getStats());

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(nautilusAI.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Get advice for a given context
   */
  const getAdvice = useCallback((context: string): AIAdvice => {
    const newAdvice = nautilusAI.advise(context);
    setAdvice(newAdvice);
    return newAdvice;
  }, []);

  /**
   * Learn from a new log entry
   */
  const learn = useCallback((log: AILog): void => {
    nautilusAI.learn(log);
    setStats(nautilusAI.getStats());
  }, []);

  /**
   * Get all logs
   */
  const getLogs = useCallback((): AILog[] => {
    return nautilusAI.getLogs();
  }, []);

  /**
   * Clear all logs
   */
  const clearLogs = useCallback((): void => {
    nautilusAI.clearLogs();
    setStats(nautilusAI.getStats());
  }, []);

  /**
   * Export logs
   */
  const exportLogs = useCallback((): string => {
    return nautilusAI.exportLogs();
  }, []);

  /**
   * Get model info
   */
  const getModelInfo = useCallback(() => {
    return nautilusAI.getModelInfo();
  }, []);

  return {
    advice,
    stats,
    getAdvice,
    learn,
    getLogs,
    clearLogs,
    exportLogs,
    getModelInfo,
  };
};
