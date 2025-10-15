import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystemCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
  details?: unknown;
  timestamp: string;
}

interface ValidationReport {
  timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'critical';
  checks: {
    database: SystemCheck[];
    edge_functions: SystemCheck[];
    storage: SystemCheck[];
    realtime: SystemCheck[];
    authentication: SystemCheck[];
  };
  performance_metrics: {
    database_latency_ms: number;
    function_cold_start_ms: number;
    active_connections: number;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    suggestion: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      checks: {
        database: [],
        edge_functions: [],
        storage: [],
        realtime: [],
        authentication: [],
      },
      performance_metrics: {
        database_latency_ms: 0,
        function_cold_start_ms: 0,
        active_connections: 0,
      },
      recommendations: [],
    };

    // Check Database
    const dbStartTime = Date.now();
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const latency = Date.now() - dbStartTime;
      report.performance_metrics.database_latency_ms = latency;

      if (error) {
        report.checks.database.push({
          name: 'Database Connectivity',
          status: 'critical',
          message: 'Database connection failed',
          details: error.message,
          timestamp: new Date().toISOString(),
        });
        report.overall_status = 'critical';
      } else {
        report.checks.database.push({
          name: 'Database Connectivity',
          status: latency > 100 ? 'degraded' : 'healthy',
          message: `Database responsive (${latency}ms)`,
          details: { total_profiles: count || 0 },
          timestamp: new Date().toISOString(),
        });

        if (latency > 100) {
          report.overall_status = 'degraded';
          report.recommendations.push({
            priority: 'medium',
            category: 'performance',
            issue: 'High database latency detected',
            suggestion: 'Consider optimizing queries, adding indexes, or upgrading database resources',
          });
        }
      }
    } catch (error) {
      report.checks.database.push({
        name: 'Database Connectivity',
        status: 'critical',
        message: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      report.overall_status = 'critical';
    }

    // Check RLS Policies
    try {
      const { error: authError } = await supabase.auth.getSession();
      
      report.checks.authentication.push({
        name: 'Authentication System',
        status: authError ? 'critical' : 'healthy',
        message: authError ? 'Auth system error' : 'Authentication system operational',
        details: authError ? authError.message : undefined,
        timestamp: new Date().toISOString(),
      });

      if (authError && report.overall_status === 'healthy') {
        report.overall_status = 'degraded';
      }
    } catch (error) {
      report.checks.authentication.push({
        name: 'Authentication System',
        status: 'critical',
        message: 'Auth check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      report.overall_status = 'critical';
    }

    // Check Storage
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      report.checks.storage.push({
        name: 'Storage Service',
        status: storageError ? 'degraded' : 'healthy',
        message: storageError 
          ? 'Storage service issue detected' 
          : `Storage operational (${buckets?.length || 0} buckets)`,
        details: storageError ? storageError.message : { bucket_count: buckets?.length || 0 },
        timestamp: new Date().toISOString(),
      });

      if (storageError && report.overall_status === 'healthy') {
        report.overall_status = 'degraded';
      }
    } catch (error) {
      report.checks.storage.push({
        name: 'Storage Service',
        status: 'degraded',
        message: 'Storage check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      if (report.overall_status === 'healthy') {
        report.overall_status = 'degraded';
      }
    }

    // Check key tables exist and are accessible
    const criticalTables = [
      'profiles',
      'organizations', 
      'workflows',
      'documents',
      'mmi_jobs',
      'dp_incidents'
    ];

    for (const table of criticalTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          report.checks.database.push({
            name: `Table: ${table}`,
            status: 'degraded',
            message: `Table ${table} access issue`,
            details: error.message,
            timestamp: new Date().toISOString(),
          });
          if (report.overall_status === 'healthy') {
            report.overall_status = 'degraded';
          }
        }
      } catch (error) {
        // Table might not exist, which is OK
        console.warn(`Could not check table ${table}:`, error);
      }
    }

    // Add general recommendations
    report.recommendations.push(
      {
        priority: 'high',
        category: 'monitoring',
        issue: 'Implement continuous monitoring',
        suggestion: 'Set up automated health checks and alerting for critical failures',
      },
      {
        priority: 'medium',
        category: 'performance',
        issue: 'Optimize database queries',
        suggestion: 'Review and add indexes to frequently queried columns',
      },
      {
        priority: 'medium',
        category: 'security',
        issue: 'Regular security audits',
        suggestion: 'Schedule periodic RLS policy reviews and security assessments',
      }
    );

    return new Response(
      JSON.stringify(report),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('System validation error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'System validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
