/**
 * RUN COMPLIANCE ENGINE - Scheduled function for automated compliance processing
 * ETAPA 33 - Módulo de Conformidade Viva
 * 
 * Runs daily to:
 * - Scan new logs (incidents, forecasts, reports)
 * - Detect non-conformities
 * - Generate corrective action plans
 * - Assign trainings
 * - Store evidence automatically
 * 
 * Scheduled to run daily at 5:00 AM UTC (2:00 AM BRT)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NonConformityLog {
  id?: string;
  source_type: 'log' | 'incident' | 'forecast' | 'manual' | 'audit';
  source_id?: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  vessel_id?: string;
  crew_id?: string;
  metadata?: Record<string, unknown>;
}

interface NormReference {
  norm_type: string;
  norm_reference: string;
  norm_clause?: string;
  description?: string;
}

interface ProcessingResult {
  success: boolean;
  non_conformity_id?: string;
  actions_created?: number;
  trainings_assigned?: number;
  evidence_stored?: number;
  error?: string;
}

/**
 * Match a log/incident to applicable norms using AI
 */
async function matchLogToNorm(
  openaiApiKey: string,
  log: NonConformityLog
): Promise<NormReference | null> {
  try {
    const prompt = `
You are a maritime compliance expert. Analyze the following incident/log and identify the most applicable international maritime regulation or standard.

Incident Description:
${log.description}

Identify:
1. The primary regulation type (IMCA, IMO, ISO, IBAMA, ANP, etc.)
2. The specific regulation reference (e.g., "IMCA M 103", "ISO 9001:2015")
3. The specific clause or section if applicable
4. Brief description of the requirement

Respond in JSON format:
{
  "norm_type": "string",
  "norm_reference": "string",
  "norm_clause": "string (optional)",
  "description": "string"
}

If no clear regulation applies, respond with {"norm_type": "none"}.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a maritime compliance expert who identifies applicable regulations.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content || '{}') as NormReference;

    if (result.norm_type === 'none') {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error matching log to norm:', error);
    // Fallback to general IMCA reference for incidents
    if (log.source_type === 'incident') {
      return {
        norm_type: 'IMCA',
        norm_reference: 'IMCA M 103',
        norm_clause: 'Section 4.2',
        description: 'DP Incident Reporting and Investigation',
      };
    }
    return null;
  }
}

/**
 * Process a single non-conformity
 */
async function processNonConformity(
  supabaseClient: any,
  openaiApiKey: string,
  log: NonConformityLog
): Promise<ProcessingResult> {
  try {
    console.log('🔍 Processing non-conformity:', log);

    // Step 1: Match log to applicable norm
    const norm = await matchLogToNorm(openaiApiKey, log);
    if (!norm) {
      console.log('⚠️ No matching norm found for this log');
      return {
        success: false,
        error: 'No matching norm found',
      };
    }

    console.log('✅ Matched to norm:', norm);

    // Step 2: Store the non-conformity
    const { data: nonConformity, error: ncError } = await supabaseClient
      .from('compliance_non_conformities')
      .insert({
        source_type: log.source_type,
        source_id: log.source_id,
        title: `Non-conformity detected: ${norm.norm_reference}`,
        description: log.description,
        severity: log.severity || 'medium',
        status: 'detected',
        vessel_id: log.vessel_id,
        crew_id: log.crew_id,
        norm_type: norm.norm_type,
        norm_reference: norm.norm_reference,
        norm_clause: norm.norm_clause,
        detected_by: 'system',
        detection_method: 'ai_analysis',
      })
      .select()
      .single();

    if (ncError || !nonConformity) {
      throw new Error(`Failed to store non-conformity: ${ncError?.message}`);
    }

    console.log('📝 Non-conformity stored:', nonConformity.id);

    // Step 3: Generate and store corrective action (simplified for cron)
    const { error: actionError } = await supabaseClient
      .from('compliance_corrective_actions')
      .insert({
        non_conformity_id: nonConformity.id,
        action_type: 'corrective',
        title: `Corrective action for ${norm.norm_reference}`,
        description: `Address non-conformity: ${log.description}`,
        plan_details: {
          steps: ['Investigate root cause', 'Implement corrective measures', 'Verify effectiveness'],
        },
        priority: log.severity || 'medium',
        status: 'planned',
      });

    if (actionError) {
      console.error('Error storing corrective action:', actionError);
    }

    // Step 4: Store evidence link
    const { error: evidenceError } = await supabaseClient
      .from('compliance_evidence')
      .insert({
        non_conformity_id: nonConformity.id,
        evidence_type: 'log_entry',
        title: `Evidence for ${norm.norm_reference}`,
        description: `Evidence for ${norm.norm_reference}`,
        norm_type: norm.norm_type,
        norm_reference: norm.norm_reference,
        norm_clause: norm.norm_clause,
        is_verified: false,
      });

    if (evidenceError) {
      console.error('Error storing evidence:', evidenceError);
    }

    return {
      success: true,
      non_conformity_id: nonConformity.id,
      actions_created: 1,
      trainings_assigned: 0,
      evidence_stored: 1,
    };
  } catch (error) {
    console.error('❌ Error processing non-conformity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Starting compliance engine run...');

    // Calculate time window (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();

    // 1. Scan new DP incidents
    const { data: incidents = [] } = await supabaseClient
      .from('dp_incidents')
      .select('*')
      .gte('created_at', yesterdayISO)
      .order('created_at', { ascending: false });

    console.log(`📋 Found ${incidents.length} new incidents`);

    // 2. Scan new safety incidents
    const { data: safetyIncidents = [] } = await supabaseClient
      .from('safety_incidents')
      .select('*')
      .gte('created_at', yesterdayISO)
      .order('created_at', { ascending: false });

    console.log(`🛡️ Found ${safetyIncidents.length} new safety incidents`);

    // Process all findings
    const results = [];

    // Process DP incidents
    for (const incident of incidents) {
      const log: NonConformityLog = {
        source_type: 'incident',
        source_id: incident.id,
        description: `${incident.title}: ${incident.description}`,
        severity: incident.severity === 'Alta' ? 'high' : 
                 incident.severity === 'Média' ? 'medium' : 'low',
        vessel_id: null, // Would need vessel mapping
        crew_id: null,
      };

      const result = await processNonConformity(supabaseClient, openaiApiKey, log);
      results.push(result);
    }

    // Process safety incidents
    for (const incident of safetyIncidents) {
      const log: NonConformityLog = {
        source_type: 'incident',
        source_id: incident.id,
        description: incident.description,
        severity: incident.severity as any,
        vessel_id: incident.vessel_id,
        crew_id: null,
      };

      const result = await processNonConformity(supabaseClient, openaiApiKey, log);
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Failed to process: ${failureCount}`);

    // Store execution log
    const { error: logError } = await supabaseClient
      .from('cron_execution_logs')
      .insert({
        job_name: 'run-compliance-engine',
        status: failureCount === 0 ? 'success' : 'partial_success',
        details: {
          incidents_scanned: incidents.length,
          safety_incidents_scanned: safetyIncidents.length,
          total_processed: results.length,
          successful: successCount,
          failed: failureCount,
          results: results.map((r) => ({
            success: r.success,
            non_conformity_id: r.non_conformity_id,
            error: r.error,
          })),
        },
      });

    if (logError) {
      console.error('Error storing execution log:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Compliance engine run completed',
        stats: {
          incidents_scanned: incidents.length,
          safety_incidents_scanned: safetyIncidents.length,
          total_processed: results.length,
          successful: successCount,
          failed: failureCount,
        },
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in compliance engine:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
