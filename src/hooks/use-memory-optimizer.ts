/**
 * useMemoryOptimizer Hook - PATCH 850
 * React hook for memory status monitoring
 */

import { useState, useEffect, useCallback } from "react";
import { memoryOptimizer } from "@/lib/performance/memory-optimizer";

export function useMemoryOptimizer() {
  const [stats, setStats] = useState(memoryOptimizer.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(memoryOptimizer.getStats());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const performCleanup = useCallback(async () => {
    await memoryOptimizer.performCleanup();
    setStats(memoryOptimizer.getStats());
  }, []);

  return {
    ...stats,
    performCleanup,
    isHighMemory: memoryOptimizer.isHighMemory(),
    isCriticalMemory: memoryOptimizer.isCriticalMemory(),
  };
}
