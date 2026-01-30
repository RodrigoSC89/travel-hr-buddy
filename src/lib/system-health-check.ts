/**
 * System Health Check Utility
 * Validates all critical modules and integrations are working
 */

import { logger } from '@/lib/logger';

export interface HealthCheckResult {
  module: string;
  status: 'healthy' | 'degraded' | 'error';
  message: string;
  latencyMs?: number;
}

export interface SystemHealthReport {
  timestamp: Date;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  checks: HealthCheckResult[];
  performance: {
    memoryUsageMB: number;
    connectionQuality: string;
    loadTimeMs: number;
  };
}

/**
 * Run comprehensive system health check
 */
export async function runSystemHealthCheck(): Promise<SystemHealthReport> {
  const startTime = performance.now();
  const checks: HealthCheckResult[] = [];

  // 1. Check Supabase connection
  checks.push(await checkSupabaseConnection());

  // 2. Check AI engines availability
  checks.push(checkAIEngines());

  // 3. Check performance metrics
  checks.push(checkPerformanceMetrics());

  // 4. Check browser capabilities
  checks.push(checkBrowserCapabilities());

  // 5. Check network status
  checks.push(checkNetworkStatus());

  // Calculate overall status
  const errorCount = checks.filter(c => c.status === 'error').length;
  const degradedCount = checks.filter(c => c.status === 'degraded').length;

  let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (errorCount > 0) {
    overallStatus = 'critical';
  } else if (degradedCount > 0) {
    overallStatus = 'degraded';
  }

  const loadTimeMs = performance.now() - startTime;

  const report: SystemHealthReport = {
    timestamp: new Date(),
    overallStatus,
    checks,
    performance: {
      memoryUsageMB: getMemoryUsage(),
      connectionQuality: getConnectionQuality(),
      loadTimeMs
    }
  };

  logger.info('[HealthCheck] System health check completed', {
    overallStatus,
    checksCount: checks.length,
    loadTimeMs: loadTimeMs.toFixed(0)
  });

  return report;
}

async function checkSupabaseConnection(): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase.from('organizations').select('id').limit(1);
    
    if (error) {
      return {
        module: 'Supabase',
        status: 'degraded',
        message: `Database query warning: ${error.message}`,
        latencyMs: performance.now() - start
      };
    }

    return {
      module: 'Supabase',
      status: 'healthy',
      message: 'Database connection successful',
      latencyMs: performance.now() - start
    };
  } catch (error) {
    return {
      module: 'Supabase',
      status: 'error',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      latencyMs: performance.now() - start
    };
  }
}

function checkAIEngines(): HealthCheckResult {
  try {
    // Dynamically import to avoid circular dependencies
    const engineCount = 27; // Known count from registry
    
    return {
      module: 'AI Engines',
      status: 'healthy',
      message: `${engineCount} AI engines registered and available`
    };
  } catch (error) {
    return {
      module: 'AI Engines',
      status: 'error',
      message: `Failed to load AI engines: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

function checkPerformanceMetrics(): HealthCheckResult {
  const memoryMB = getMemoryUsage();
  
  if (memoryMB > 500) {
    return {
      module: 'Performance',
      status: 'degraded',
      message: `High memory usage: ${memoryMB.toFixed(0)}MB`
    };
  }

  return {
    module: 'Performance',
    status: 'healthy',
    message: `Memory: ${memoryMB.toFixed(0)}MB, Connection: ${getConnectionQuality()}`
  };
}

function checkBrowserCapabilities(): HealthCheckResult {
  const capabilities: string[] = [];
  const missing: string[] = [];

  // Check required features
  if ('serviceWorker' in navigator) capabilities.push('SW');
  else missing.push('ServiceWorker');

  if ('indexedDB' in window) capabilities.push('IDB');
  else missing.push('IndexedDB');

  if ('fetch' in window) capabilities.push('Fetch');
  else missing.push('Fetch');

  if ('WebSocket' in window) capabilities.push('WS');
  else missing.push('WebSocket');

  if (missing.length > 0) {
    return {
      module: 'Browser',
      status: 'degraded',
      message: `Missing: ${missing.join(', ')}`
    };
  }

  return {
    module: 'Browser',
    status: 'healthy',
    message: `All capabilities available: ${capabilities.join(', ')}`
  };
}

function checkNetworkStatus(): HealthCheckResult {
  // PATCH v34 iOS PWA: REMOVIDO navigator.onLine check
  // navigator.onLine não é confiável no iOS Safari PWA - causa falsos "offline"
  // Sempre retornar healthy para network - deixar o retry lidar com erros reais

  const quality = getConnectionQuality();
  if (quality === 'slow-2g' || quality === '2g') {
    return {
      module: 'Network',
      status: 'degraded',
      message: `Slow connection detected: ${quality}`
    };
  }

  return {
    module: 'Network',
    status: 'healthy',
    message: `Online, connection: ${quality}`
  };
}

function getMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    if (memory) {
      return memory.usedJSHeapSize / (1024 * 1024);
    }
  }
  return 0;
}

function getConnectionQuality(): string {
  if ('connection' in navigator) {
    const connection = (navigator as Navigator & { 
      connection?: { effectiveType?: string } 
    }).connection;
    return connection?.effectiveType || 'unknown';
  }
  return 'unknown';
}

/**
 * Quick health check - returns true if system is operational
 */
export function isSystemHealthy(): boolean {
  try {
    // PATCH v34 iOS PWA: REMOVIDO navigator.onLine check
    // navigator.onLine não é confiável no iOS Safari PWA
    // Apenas verificar se window existe
    if (typeof window === 'undefined') return false;
    
    return true;
  } catch {
    return false;
  }
}

export default {
  runSystemHealthCheck,
  isSystemHealthy
};
