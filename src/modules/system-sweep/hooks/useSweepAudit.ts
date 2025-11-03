/**
 * PATCH 596 - System Sweep Hook
 * React hook for running system sweep audits
 */

import { useState, useCallback } from "react";
import { SystemSweepEngine } from "../services/SystemSweepEngine";
import { ConsoleErrorAuditor } from "../services/ConsoleErrorAuditor";
import type { SweepAuditResult } from "../types";
import { logger } from "@/lib/logger";

export function useSweepAudit() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SweepAuditResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const runSweep = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      // Start capturing console errors
      ConsoleErrorAuditor.startCapture();

      // Wait a bit to capture runtime errors
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Run the sweep
      const engine = SystemSweepEngine.getInstance();
      const auditResult = await engine.runFullSweep();
      
      setResult(auditResult);
      logger.info("[System Sweep] Audit completed successfully");
      
      return auditResult;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Unknown error");
      setError(errorObj);
      logger.error("[System Sweep] Audit failed:", err);
      throw errorObj;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const autoFix = useCallback(async () => {
    try {
      const engine = SystemSweepEngine.getInstance();
      const fixResult = await engine.autoFix();
      logger.info("[System Sweep] Auto-fix completed:", fixResult);
      return fixResult;
    } catch (err) {
      logger.error("[System Sweep] Auto-fix failed:", err);
      throw err;
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    ConsoleErrorAuditor.clearCapture();
  }, []);

  return {
    isRunning,
    result,
    error,
    runSweep,
    autoFix,
    clearResult
  };
}
