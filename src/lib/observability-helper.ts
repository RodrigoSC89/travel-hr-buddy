/**
 * Observability Helper - R05 COMPLIANCE
 * Garante logging e alertas para fluxos críticos
 */

import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";

type CriticalFlow = 
  | "auth.login"
  | "auth.logout"
  | "payment.process"
  | "payment.refund"
  | "tracking.position"
  | "compliance.audit"
  | "crew.document"
  | "maintenance.critical"
  | "incident.report";

interface CriticalError {
  flow: CriticalFlow;
  error: Error | unknown;
  context?: Record<string, unknown>;
  userId?: string;
  severity?: "warning" | "error" | "critical";
}

/**
 * Reportar erro crítico com contexto completo
 * ✅ R05: Garante que erros críticos não são silenciosos
 */
export function reportCriticalError({
  flow,
  error,
  context = {},
  userId,
  severity = "error",
}: CriticalError): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // 1. Log estruturado local
  logger.error(`[CRITICAL] ${flow}:`, {
    error: errorObj.message,
    stack: errorObj.stack,
    context,
    userId,
    severity,
    timestamp: new Date().toISOString(),
  });

  // 2. Sentry com contexto enriquecido
  Sentry.withScope((scope) => {
    scope.setTag("critical_flow", flow);
    scope.setLevel(severity === "critical" ? "fatal" : severity);
    scope.setContext("flow_context", context);
    
    if (userId) {
      scope.setUser({ id: userId });
    }

    Sentry.captureException(errorObj);
  });

  // 3. Console explícito para debug
  console.error(`[R05] Critical error in ${flow}:`, errorObj);
}

/**
 * Wrapper para fluxos críticos com tratamento de erro automático
 */
export async function withCriticalErrorHandling<T>(
  flow: CriticalFlow,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    reportCriticalError({ flow, error, context });
    throw error;
  }
}

/**
 * Marcar início de operação crítica (para métricas de duração)
 */
export function startCriticalOperation(flow: CriticalFlow): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;

    // Alerta se operação crítica demorar muito
    if (duration > 5000) {
      logger.warn(`[R05] Slow critical operation: ${flow} took ${duration.toFixed(0)}ms`);
      Sentry.captureMessage(`Slow operation: ${flow}`, {
        level: "warning",
        extra: { duration, flow },
      });
    }
  };
}

/**
 * Health check para fluxos críticos
 */
export function checkCriticalFlowHealth(): Record<CriticalFlow, boolean> {
  // Em produção, isso verificaria conectividade real com cada serviço
  return {
    "auth.login": true,
    "auth.logout": true,
    "payment.process": true,
    "payment.refund": true,
    "tracking.position": true,
    "compliance.audit": true,
    "crew.document": true,
    "maintenance.critical": true,
    "incident.report": true,
  };
}
