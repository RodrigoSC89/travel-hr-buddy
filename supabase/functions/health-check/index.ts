import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  const startTime = Date.now();
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};

  // Database check
  try {
    const dbStart = Date.now();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    await supabase.from('profiles').select('id').limit(1);
    checks.database = { status: 'healthy', latency_ms: Date.now() - dbStart };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    checks.database = { status: 'unhealthy', error: message };
  }

  // Storage check
  try {
    const storageStart = Date.now();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );
    
    await supabase.storage.listBuckets();
    checks.storage = { status: 'healthy', latency_ms: Date.now() - storageStart };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    checks.storage = { status: 'unhealthy', error: message };
  }

  // Edge functions check (self-check)
  checks.edge_functions = { status: 'healthy', latency_ms: 0 };

  // AI services check
  const aiKey = Deno.env.get('OPENAI_API_KEY');
  checks.ai_services = { 
    status: aiKey ? 'configured' : 'not_configured',
    latency_ms: 0 
  };

  const overallStatus = Object.values(checks).every(c => 
    c.status === 'healthy' || c.status === 'configured'
  ) ? 'healthy' : 'degraded';

  return jsonResponse({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '4.0.0',
    uptime_check_ms: Date.now() - startTime,
    services: checks
  });
});
