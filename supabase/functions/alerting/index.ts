// @ts-nocheck
// ============================================================================
// Supabase Edge Function: alerting
// Purpose: Serverless alerting system for ControlHub observability
// Schedule: Can be triggered manually or via cron
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alert {
  id: string;
  timestamp: string;
  severity: string;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting alerting system...');

    // Fetch recent alerts from database
    // Note: This assumes an 'alerts' table exists in Supabase
    // If not, this will gracefully handle the error
    let alerts: Alert[] = [];
    
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('⚠️  Alerts table not found or error fetching:', error.message);
        // Return empty alerts if table doesn't exist yet
        alerts = [];
      } else {
        alerts = data || [];
      }
    } catch (err) {
      console.warn('⚠️  Error querying alerts table:', err);
      alerts = [];
    }

    console.log(`📊 Found ${alerts.length} alerts`);

    // Prepare response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      alerts_count: alerts.length,
      alerts: alerts,
      message: alerts.length > 0 
        ? `Retrieved ${alerts.length} alerts` 
        : 'No alerts found',
    };

    console.log('✅ Alerting system completed successfully');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in alerting:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
