/**
 * ETAPA 33: Live Compliance Module - Edge Function
 * Automated daily processing of compliance workflow
 * Schedule: Daily at 5:00 AM UTC via cron.yaml
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// Types
// =====================================================

interface NonConformity {
  source_type: 'dp_incident' | 'safety_log' | 'forecast' | 'manual';
  source_id?: string;
  vessel_id?: string;
  vessel_name?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tenant_id: string;
}

interface MatchedNorm {
  norm_type: string;
  clause: string;
  description: string;
  confidence: number;
}

// =====================================================
// AI Functions
// =====================================================

async function matchNormsWithAI(description: string): Promise<MatchedNorm[]> {
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not configured');
      return [];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a maritime compliance expert. Analyze incident descriptions and identify applicable maritime regulations from these frameworks:
- IMCA (International Marine Contractors Association) - M103, M117, M179, M220
- ISO (International Organization for Standardization) - ISO 9001, ISO 14001, ISO 45001
- ANP (Brazilian National Petroleum Agency)
- IBAMA (Brazilian Environmental Agency)
- IMO (International Maritime Organization) - SOLAS, MARPOL

Return a JSON object with a "norms" array. Each norm should have: norm_type, clause, description, confidence (0-1).
Return empty array if no clear matches.`,
          },
          {
            role: 'user',
            content: `Analyze this maritime incident and identify applicable regulations:\n\n${description}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.norms || [];
  } catch (error) {
    console.error('Error matching norms with AI:', error);
    return [];
  }
}

async function generateCorrectiveActionPlan(description: string): Promise<any[]> {
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not configured');
      return [];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a maritime safety expert. Generate corrective action plans for compliance issues. 
Each action should have: title, description, action_type (immediate/preventive/corrective/monitoring), priority (critical/high/medium/low), resources_required, estimated_hours.
Return a JSON object with an "actions" array.`,
          },
          {
            role: 'user',
            content: `Generate a corrective action plan for this maritime compliance issue:\n\n${description}`,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    return result.actions || [];
  } catch (error) {
    console.error('Error generating action plan:', error);
    return [];
  }
}

// =====================================================
// Compliance Processing
// =====================================================

async function processIncident(
  supabaseClient: any,
  incident: any,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Create non-conformity record
    const nonConformity: NonConformity = {
      source_type: 'dp_incident',
      source_id: incident.id,
      vessel_id: incident.vessel_id,
      vessel_name: incident.vessel_name,
      description: incident.description,
      severity: incident.severity || 'medium',
      tenant_id: tenantId,
    };

    const { data: nc, error: ncError } = await supabaseClient
      .from('compliance_non_conformities')
      .insert({
        ...nonConformity,
        status: 'open',
      })
      .select()
      .single();

    if (ncError || !nc) {
      console.error('Error creating non-conformity:', ncError);
      return { success: false, error: ncError?.message };
    }

    console.log(`Created non-conformity ${nc.id} for incident ${incident.id}`);

    // Step 2: Match to norms using AI
    const matchedNorms = await matchNormsWithAI(incident.description);
    
    if (matchedNorms.length > 0) {
      await supabaseClient
        .from('compliance_non_conformities')
        .update({
          matched_norms: matchedNorms,
          ai_analysis: `Matched to ${matchedNorms.length} norm(s)`,
        })
        .eq('id', nc.id);
      
      console.log(`Matched ${matchedNorms.length} norms for non-conformity ${nc.id}`);
    }

    // Step 3: Generate corrective actions
    const actions = await generateCorrectiveActionPlan(incident.description);
    
    if (actions.length > 0) {
      const correctiveActions = actions.map((action: any) => ({
        non_conformity_id: nc.id,
        title: action.title,
        description: action.description,
        action_type: action.action_type || 'corrective',
        priority: action.priority || 'medium',
        status: 'pending',
        resources_required: action.resources_required,
        estimated_hours: action.estimated_hours,
        tenant_id: tenantId,
      }));

      await supabaseClient
        .from('compliance_corrective_actions')
        .insert(correctiveActions);
      
      console.log(`Created ${actions.length} corrective actions for non-conformity ${nc.id}`);
    }

    // Step 4: Create evidence link
    await supabaseClient
      .from('compliance_evidence')
      .insert({
        non_conformity_id: nc.id,
        evidence_type: 'log',
        title: 'DP Incident Reference',
        description: `Auto-linked evidence from DP incident ${incident.id}`,
        tenant_id: tenantId,
      });

    // Step 5: Mark incident as processed
    await supabaseClient
      .from('dp_incidents')
      .update({ compliance_processed: true })
      .eq('id', incident.id);

    return { success: true };
  } catch (error) {
    console.error('Error processing incident:', error);
    return { success: false, error: String(error) };
  }
}

async function batchProcessIncidents(supabaseClient: any): Promise<any> {
  try {
    // Get all tenants
    const { data: tenants } = await supabaseClient
      .from('profiles')
      .select('tenant_id')
      .not('tenant_id', 'is', null);

    if (!tenants || tenants.length === 0) {
      return { message: 'No tenants found', processed: 0, errors: 0 };
    }

    const uniqueTenants = [...new Set(tenants.map(t => t.tenant_id))];
    
    let totalProcessed = 0;
    let totalErrors = 0;

    // Process incidents for each tenant
    for (const tenantId of uniqueTenants) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Get unprocessed DP incidents from last 24 hours
      const { data: incidents } = await supabaseClient
        .from('dp_incidents')
        .select('id, vessel_id, vessel_name, description, severity, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', yesterday.toISOString())
        .or('compliance_processed.is.null,compliance_processed.eq.false')
        .limit(50); // Process max 50 incidents per tenant per run

      if (incidents && incidents.length > 0) {
        console.log(`Processing ${incidents.length} incidents for tenant ${tenantId}`);

        for (const incident of incidents) {
          const result = await processIncident(supabaseClient, incident, tenantId);
          
          if (result.success) {
            totalProcessed++;
          } else {
            totalErrors++;
          }
        }
      }
    }

    return {
      message: 'Batch processing complete',
      processed: totalProcessed,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in batch processing:', error);
    return {
      message: 'Batch processing failed',
      error: String(error),
      processed: 0,
      errors: 1,
    };
  }
}

// =====================================================
// Main Handler
// =====================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting compliance engine batch processing...');
    const result = await batchProcessIncidents(supabaseClient);
    console.log('Batch processing result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in compliance engine:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        processed: 0,
        errors: 1,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
