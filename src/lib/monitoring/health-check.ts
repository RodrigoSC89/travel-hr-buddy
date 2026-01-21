/**
 * System Health Check
 * PATCH v27: Comprehensive health monitoring for production
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  summary: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTimeMs?: number;
  message?: string;
}

/**
 * Run comprehensive health check
 */
export async function runHealthCheck(): Promise<HealthStatus> {
  const checks: HealthCheck[] = [];
  const startTime = Date.now();

  // Check 1: Supabase connectivity
  const supabaseCheck = await checkSupabaseConnection();
  checks.push(supabaseCheck);

  // Check 2: Auth service
  const authCheck = await checkAuthService();
  checks.push(authCheck);

  // Check 3: Browser APIs
  const browserCheck = checkBrowserAPIs();
  checks.push(browserCheck);

  // Check 4: Local storage
  const storageCheck = checkLocalStorage();
  checks.push(storageCheck);

  // Check 5: Network connectivity
  const networkCheck = await checkNetworkConnectivity();
  checks.push(networkCheck);

  // Determine overall status
  const failedChecks = checks.filter((c) => c.status === 'fail');
  const warnChecks = checks.filter((c) => c.status === 'warn');

  let status: HealthStatus['status'] = 'healthy';
  if (failedChecks.length > 0) {
    status = 'unhealthy';
  } else if (warnChecks.length > 0) {
    status = 'degraded';
  }

  const summary = `${checks.length} checks: ${checks.filter((c) => c.status === 'pass').length} passed, ${warnChecks.length} warnings, ${failedChecks.length} failed`;

  logger.info('Health check completed', { status, summary });

  return {
    status,
    timestamp: new Date(),
    checks,
    summary,
  };
}

/**
 * Check Supabase connection
 */
async function checkSupabaseConnection(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Simple query to verify connectivity
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const responseTimeMs = Date.now() - start;

    if (error) {
      // RLS might block, but connection works
      if (error.code === 'PGRST301') {
        return {
          name: 'Supabase Connection',
          status: 'pass',
          responseTimeMs,
          message: 'Connected (RLS active)',
        };
      }
      
      return {
        name: 'Supabase Connection',
        status: 'fail',
        responseTimeMs,
        message: error.message,
      };
    }

    return {
      name: 'Supabase Connection',
      status: responseTimeMs < 2000 ? 'pass' : 'warn',
      responseTimeMs,
      message: responseTimeMs < 2000 ? 'OK' : 'Slow response',
    };
  } catch (err) {
    return {
      name: 'Supabase Connection',
      status: 'fail',
      responseTimeMs: Date.now() - start,
      message: err instanceof Error ? err.message : 'Connection failed',
    };
  }
}

/**
 * Check auth service
 */
async function checkAuthService(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    const { error } = await supabase.auth.getSession();
    const responseTimeMs = Date.now() - start;

    if (error) {
      return {
        name: 'Auth Service',
        status: 'fail',
        responseTimeMs,
        message: error.message,
      };
    }

    return {
      name: 'Auth Service',
      status: 'pass',
      responseTimeMs,
      message: 'OK',
    };
  } catch (err) {
    return {
      name: 'Auth Service',
      status: 'fail',
      message: err instanceof Error ? err.message : 'Auth check failed',
    };
  }
}

/**
 * Check browser APIs availability
 */
function checkBrowserAPIs(): HealthCheck {
  const issues: string[] = [];

  if (!window.crypto) issues.push('crypto');
  if (!window.localStorage) issues.push('localStorage');
  if (!window.indexedDB) issues.push('indexedDB');
  if (!window.fetch) issues.push('fetch');

  if (issues.length > 0) {
    return {
      name: 'Browser APIs',
      status: 'warn',
      message: `Missing: ${issues.join(', ')}`,
    };
  }

  return {
    name: 'Browser APIs',
    status: 'pass',
    message: 'All required APIs available',
  };
}

/**
 * Check local storage
 */
function checkLocalStorage(): HealthCheck {
  try {
    const testKey = '__health_check_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);

    return {
      name: 'Local Storage',
      status: 'pass',
      message: 'OK',
    };
  } catch {
    return {
      name: 'Local Storage',
      status: 'warn',
      message: 'Storage may be full or blocked',
    };
  }
}

/**
 * Check network connectivity
 */
async function checkNetworkConnectivity(): Promise<HealthCheck> {
  const start = Date.now();
  
  try {
    // Try to fetch a small resource
    const response = await fetch('https://vnbptmixvwropvanyhdb.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE',
      },
    });

    const responseTimeMs = Date.now() - start;

    return {
      name: 'Network Connectivity',
      status: response.ok ? 'pass' : 'warn',
      responseTimeMs,
      message: response.ok ? 'OK' : `Status: ${response.status}`,
    };
  } catch {
    return {
      name: 'Network Connectivity',
      status: 'fail',
      responseTimeMs: Date.now() - start,
      message: 'Network unreachable',
    };
  }
}

/**
 * Schedule periodic health checks
 */
export function scheduleHealthChecks(intervalMs = 5 * 60 * 1000): () => void {
  const intervalId = setInterval(async () => {
    const result = await runHealthCheck();
    
    if (result.status === 'unhealthy') {
      logger.error('System unhealthy', undefined, { checks: result.checks });
    }
  }, intervalMs);

  return () => clearInterval(intervalId);
}
