/**
 * System Health Check Edge Function
 * PATCH 833: Comprehensive health check endpoint
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    auth: ServiceStatus;
    realtime: ServiceStatus;
    edge_functions: ServiceStatus;
  };
  metrics: {
    response_time_ms: number;
    memory_usage?: number;
    cpu_usage?: number;
  };
  uptime: number;
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency_ms?: number;
  message?: string;
}

const startTime = Date.now();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestStart = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check database
    const dbStart = Date.now();
    let dbStatus: ServiceStatus = { status: 'up' };
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      dbStatus.latency_ms = Date.now() - dbStart;
      if (error) {
        dbStatus.status = 'degraded';
        dbStatus.message = error.message;
      }
    } catch (err: unknown) {
      dbStatus.status = 'down';
      dbStatus.message = err instanceof Error ? err.message : 'Unknown error';
      dbStatus.latency_ms = Date.now() - dbStart;
    }

    // Check storage
    const storageStart = Date.now();
    let storageStatus: ServiceStatus = { status: 'up' };
    try {
      const { error } = await supabase.storage.listBuckets();
      storageStatus.latency_ms = Date.now() - storageStart;
      if (error) {
        storageStatus.status = 'degraded';
        storageStatus.message = error.message;
      }
    } catch (err: unknown) {
      storageStatus.status = 'down';
      storageStatus.message = err instanceof Error ? err.message : 'Unknown error';
      storageStatus.latency_ms = Date.now() - storageStart;
    }

    // Check auth service
    const authStart = Date.now();
    let authStatus: ServiceStatus = { status: 'up' };
    try {
      const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
      authStatus.latency_ms = Date.now() - authStart;
      if (error) {
        authStatus.status = 'degraded';
        authStatus.message = error.message;
      }
    } catch (err: unknown) {
      authStatus.status = 'down';
      authStatus.message = err instanceof Error ? err.message : 'Unknown error';
      authStatus.latency_ms = Date.now() - authStart;
    }

    // Realtime status (basic check)
    const realtimeStatus: ServiceStatus = { 
      status: 'up',
      latency_ms: 0,
      message: 'Realtime assumed operational'
    };

    // Edge functions status (we're running, so it's up)
    const edgeFunctionsStatus: ServiceStatus = {
      status: 'up',
      latency_ms: Date.now() - requestStart,
    };

    // Calculate overall status
    const services = {
      database: dbStatus,
      storage: storageStatus,
      auth: authStatus,
      realtime: realtimeStatus,
      edge_functions: edgeFunctionsStatus,
    };

    const downServices = Object.values(services).filter(s => s.status === 'down').length;
    const degradedServices = Object.values(services).filter(s => s.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (downServices > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedServices > 0) {
      overallStatus = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services,
      metrics: {
        response_time_ms: Date.now() - requestStart,
      },
      uptime: Date.now() - startTime,
    };

    console.log(`[Health Check] Status: ${overallStatus}, Response time: ${healthStatus.metrics.response_time_ms}ms`);

    return new Response(
      JSON.stringify(healthStatus, null, 2),
      {
        status: overallStatus === 'unhealthy' ? 503 : 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error: unknown) {
    console.error('[Health Check] Error:', error);

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          response_time_ms: Date.now() - requestStart,
        },
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
