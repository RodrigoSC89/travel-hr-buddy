/**
 * PATCH OPS-V7 — System Health Check
 * 
 * Verifica saúde de todas as integrações e serviços
 * Endpoint: /api/health ou componente SystemHealthDashboard
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { IntegrationStatus, IntegrationHealthCheck } from "@/types/integration-status";

export interface SystemHealth {
  overall: IntegrationStatus;
  timestamp: Date;
  checks: IntegrationHealthCheck[];
  summary: {
    total: number;
    connected: number;
    degraded: number;
    disconnected: number;
    notConfigured: number;
    error: number;
  };
}

/**
 * Verifica conexão com Supabase
 */
async function checkSupabase(): Promise<IntegrationHealthCheck> {
  const startTime = Date.now();
  
  try {
    const { error } = await supabase.from('vessels').select('id').limit(1);
    const latencyMs = Date.now() - startTime;
    
    if (error) {
      return {
        name: 'Supabase Database',
        status: 'ERROR',
        lastCheck: new Date(),
        latencyMs,
        errorMessage: error.message,
      };
    }
    
    return {
      name: 'Supabase Database',
      status: latencyMs > 2000 ? 'DEGRADED' : 'CONNECTED',
      lastCheck: new Date(),
      latencyMs,
    };
  } catch (error) {
    return {
      name: 'Supabase Database',
      status: 'DISCONNECTED',
      lastCheck: new Date(),
      latencyMs: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica conexão com Edge Functions
 */
async function checkEdgeFunctions(): Promise<IntegrationHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Tentar chamar uma edge function de health
    const { error } = await supabase.functions.invoke('health-check', {
      body: { ping: true },
    });
    
    const latencyMs = Date.now() - startTime;
    
    // Se a função não existe, ainda assim Supabase Functions está ok
    if (error && error.message?.includes('not found')) {
      return {
        name: 'Edge Functions',
        status: 'CONNECTED',
        lastCheck: new Date(),
        latencyMs,
      };
    }
    
    if (error) {
      return {
        name: 'Edge Functions',
        status: 'DEGRADED',
        lastCheck: new Date(),
        latencyMs,
        errorMessage: error.message,
      };
    }
    
    return {
      name: 'Edge Functions',
      status: latencyMs > 3000 ? 'DEGRADED' : 'CONNECTED',
      lastCheck: new Date(),
      latencyMs,
    };
  } catch (error) {
    return {
      name: 'Edge Functions',
      status: 'DISCONNECTED',
      lastCheck: new Date(),
      latencyMs: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica configuração de AIS
 */
function checkAISConfig(): IntegrationHealthCheck {
  const apiKey = import.meta.env.VITE_MARINE_TRAFFIC_API_KEY;
  
  return {
    name: 'AIS (MarineTraffic)',
    status: apiKey ? 'CONNECTED' : 'NOT_CONFIGURED',
    lastCheck: new Date(),
    errorMessage: apiKey ? undefined : 'VITE_MARINE_TRAFFIC_API_KEY não configurada',
  };
}

/**
 * Verifica configuração de Weather
 */
async function checkWeather(): Promise<IntegrationHealthCheck> {
  const startTime = Date.now();
  
  try {
    // OpenMeteo não requer API key
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-23.5&longitude=-46.6&current_weather=true',
      { signal: AbortSignal.timeout(5000) }
    );
    
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        name: 'Weather (OpenMeteo)',
        status: 'ERROR',
        lastCheck: new Date(),
        latencyMs,
        errorMessage: `HTTP ${response.status}`,
      };
    }
    
    return {
      name: 'Weather (OpenMeteo)',
      status: latencyMs > 2000 ? 'DEGRADED' : 'CONNECTED',
      lastCheck: new Date(),
      latencyMs,
    };
  } catch (error) {
    return {
      name: 'Weather (OpenMeteo)',
      status: 'DISCONNECTED',
      lastCheck: new Date(),
      latencyMs: Date.now() - startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica configuração de Satellite/DGNSS
 */
function checkSatelliteConfig(): IntegrationHealthCheck {
  const apiKey = import.meta.env.VITE_N2YO_API_KEY;
  
  return {
    name: 'Satellite (N2YO)',
    status: apiKey ? 'CONNECTED' : 'NOT_CONFIGURED',
    lastCheck: new Date(),
    errorMessage: apiKey ? undefined : 'VITE_N2YO_API_KEY não configurada',
  };
}

/**
 * Executa health check completo do sistema
 */
export async function performHealthCheck(): Promise<SystemHealth> {
  logger.info('Iniciando health check do sistema...');
  
  const checks: IntegrationHealthCheck[] = [];
  
  // Executar checks em paralelo
  const [supabaseCheck, edgeFunctionsCheck, weatherCheck] = await Promise.all([
    checkSupabase(),
    checkEdgeFunctions(),
    checkWeather(),
  ]);
  
  // Checks síncronos (configuração)
  const aisCheck = checkAISConfig();
  const satelliteCheck = checkSatelliteConfig();
  
  checks.push(supabaseCheck, edgeFunctionsCheck, aisCheck, weatherCheck, satelliteCheck);
  
  // Calcular resumo
  const summary = {
    total: checks.length,
    connected: checks.filter(c => c.status === 'CONNECTED').length,
    degraded: checks.filter(c => c.status === 'DEGRADED').length,
    disconnected: checks.filter(c => c.status === 'DISCONNECTED').length,
    notConfigured: checks.filter(c => c.status === 'NOT_CONFIGURED').length,
    error: checks.filter(c => c.status === 'ERROR').length,
  };
  
  // Determinar status geral
  let overall: IntegrationStatus = 'CONNECTED';
  
  if (summary.error > 0 || summary.disconnected > 0) {
    // Se Supabase está fora, é crítico
    if (supabaseCheck.status === 'DISCONNECTED' || supabaseCheck.status === 'ERROR') {
      overall = 'ERROR';
    } else {
      overall = 'DEGRADED';
    }
  } else if (summary.degraded > 0 || summary.notConfigured > 0) {
    overall = 'DEGRADED';
  }
  
  const health: SystemHealth = {
    overall,
    timestamp: new Date(),
    checks,
    summary,
  };
  
  logger.info('Health check concluído', { overall, summary });
  
  return health;
}

/**
 * Hook para usar em componentes
 */
export function useSystemHealth() {
  // Retorna função para executar health check sob demanda
  return {
    performHealthCheck,
  };
}
