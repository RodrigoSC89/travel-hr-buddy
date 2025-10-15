// ✅ Supabase Edge Function — System Validation
// Validates system health, connectivity, and database checks

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: unknown;
  timestamp: string;
}

interface SystemValidationReport {
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied: admin only' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Run validation checks
    const results: ValidationResult[] = [];

    // 1. Database connectivity check
    try {
      const startTime = Date.now();
      const { count, error } = await supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const responseTime = Date.now() - startTime;

      if (error) {
        results.push({
          category: 'Database',
          name: 'Connection Test',
          status: 'failed',
          message: `Database query failed: ${error.message}`,
          details: { error: error.message, responseTime },
          timestamp: new Date().toISOString(),
        });
      } else if (responseTime > 2000) {
        results.push({
          category: 'Database',
          name: 'Connection Test',
          status: 'warning',
          message: `Database responding slowly (${responseTime}ms)`,
          details: { responseTime, recordCount: count },
          timestamp: new Date().toISOString(),
        });
      } else {
        results.push({
          category: 'Database',
          name: 'Connection Test',
          status: 'passed',
          message: `Database connection healthy (${responseTime}ms)`,
          details: { responseTime, recordCount: count },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.push({
        category: 'Database',
        name: 'Connection Test',
        status: 'failed',
        message: `Database check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Check key tables exist and are accessible
    const tablesToCheck = ['profiles', 'workflows', 'documents', 'assistant_logs'];
    
    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabaseClient
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          results.push({
            category: 'Database',
            name: `Table: ${table}`,
            status: 'warning',
            message: `Table access warning: ${error.message}`,
            details: { error: error.message },
            timestamp: new Date().toISOString(),
          });
        } else {
          results.push({
            category: 'Database',
            name: `Table: ${table}`,
            status: 'passed',
            message: `Table accessible (${count || 0} records)`,
            details: { recordCount: count },
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        results.push({
          category: 'Database',
          name: `Table: ${table}`,
          status: 'failed',
          message: `Table check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 3. Check storage buckets
    try {
      const { data: buckets, error } = await supabaseClient.storage.listBuckets();

      if (error) {
        results.push({
          category: 'Storage',
          name: 'Bucket Access',
          status: 'failed',
          message: `Storage access failed: ${error.message}`,
          details: { error: error.message },
          timestamp: new Date().toISOString(),
        });
      } else {
        results.push({
          category: 'Storage',
          name: 'Bucket Access',
          status: 'passed',
          message: `Storage accessible (${buckets?.length || 0} buckets)`,
          details: { bucketCount: buckets?.length || 0 },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.push({
        category: 'Storage',
        name: 'Bucket Access',
        status: 'warning',
        message: `Storage check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 4. Check environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ANON_KEY',
    ];

    for (const envVar of requiredEnvVars) {
      const value = Deno.env.get(envVar);
      if (!value) {
        results.push({
          category: 'Configuration',
          name: `Env: ${envVar}`,
          status: 'failed',
          message: `Required environment variable not set`,
          timestamp: new Date().toISOString(),
        });
      } else {
        results.push({
          category: 'Configuration',
          name: `Env: ${envVar}`,
          status: 'passed',
          message: `Environment variable configured`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Generate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      warnings: results.filter(r => r.status === 'warning').length,
    };

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (summary.failed > 0) {
      overallStatus = 'critical';
    } else if (summary.warnings > 2) {
      overallStatus = 'degraded';
    }

    const report: SystemValidationReport = {
      timestamp: new Date().toISOString(),
      overallStatus,
      results,
      summary,
    };

    return new Response(
      JSON.stringify(report),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in system-validation:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
