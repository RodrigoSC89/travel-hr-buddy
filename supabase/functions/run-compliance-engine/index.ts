/**
 * ETAPA 33 - Run Compliance Engine (Cron Job)
 * 
 * Scheduled to run daily at 5:00 AM UTC
 * Processes incidents from the last 24 hours through the compliance engine
 * 
 * Features:
 * - Scans new DP incidents, safety logs, and forecasts
 * - Processes each through AI-powered compliance workflow
 * - Logs execution results for monitoring
 * - Error handling and graceful degradation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessResult {
  source_type: string;
  source_id: string;
  success: boolean;
  error?: string;
  non_conformity_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate time range (last 24 hours)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`Processing incidents since: ${twentyFourHoursAgo.toISOString()}`);

    const results: ProcessResult[] = [];

    // ========================================================================
    // 1. Process new DP incidents
    // ========================================================================
    const { data: dpIncidents, error: dpError } = await supabase
      .from('dp_incidents')
      .select('id, vessel_id, description, severity, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (dpError) {
      console.error('Error fetching DP incidents:', dpError);
    } else if (dpIncidents && dpIncidents.length > 0) {
      console.log(`Found ${dpIncidents.length} new DP incidents`);

      for (const incident of dpIncidents) {
        try {
          const result = await processIncident(supabase, openaiApiKey, {
            vessel_id: incident.vessel_id,
            description: incident.description || 'No description provided',
            source_type: 'dp_incident',
            source_id: incident.id,
            severity: incident.severity || 'medium',
          });

          results.push({
            source_type: 'dp_incident',
            source_id: incident.id,
            ...result,
          });
        } catch (error) {
          console.error(`Error processing incident ${incident.id}:`, error);
          results.push({
            source_type: 'dp_incident',
            source_id: incident.id,
            success: false,
            error: (error as Error).message,
          });
        }
      }
    }

    // ========================================================================
    // 2. Process forecasts (optional - if forecast table has compliance flags)
    // ========================================================================
    // Note: This is a placeholder. Implement if forecast table exists and needs compliance processing
    
    // ========================================================================
    // Summary and logging
    // ========================================================================
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    const summary = {
      execution_time: new Date().toISOString(),
      time_range: {
        from: twentyFourHoursAgo.toISOString(),
        to: now.toISOString(),
      },
      total_processed: results.length,
      successful: successCount,
      failed: errorCount,
      automation_rate: results.length > 0 ? (successCount / results.length) * 100 : 0,
      results: results,
    };

    console.log('Compliance Engine Execution Summary:', JSON.stringify(summary, null, 2));

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} items: ${successCount} successful, ${errorCount} failed`,
        summary,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Fatal error in compliance engine:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Process a single incident through the compliance engine
 */
async function processIncident(
  supabase: any,
  openaiApiKey: string,
  log: {
    vessel_id: string;
    description: string;
    source_type: string;
    source_id: string;
    severity: string;
  }
): Promise<{ success: boolean; non_conformity_id?: string; error?: string }> {
  try {
    // Step 1: Match to applicable maritime norms using AI
    const normMatch = await matchLogToNorm(openaiApiKey, log.description);

    if (!normMatch) {
      console.log('No norm match found for incident', log.source_id);
      return { success: false, error: 'No applicable norm found' };
    }

    // Step 2: Create non-conformity record
    const { data: ncData, error: ncError } = await supabase
      .from('compliance_non_conformities')
      .insert({
        vessel_id: log.vessel_id,
        source_type: log.source_type,
        source_id: log.source_id,
        description: log.description,
        severity: log.severity,
        norm_type: normMatch.norm_type,
        norm_clause: normMatch.norm_clause,
        ai_analysis: {
          norm_match: normMatch,
          processed_at: new Date().toISOString(),
        },
        status: 'open',
        detected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (ncError || !ncData) {
      throw new Error(`Failed to create non-conformity: ${ncError?.message}`);
    }

    // Step 3: Generate corrective action plan using AI
    const plan = await generateCorrectivePlan(
      openaiApiKey,
      log.description,
      normMatch.norm_type,
      normMatch.norm_clause
    );

    // Step 4: Store corrective action
    const { error: caError } = await supabase
      .from('compliance_corrective_actions')
      .insert({
        non_conformity_id: ncData.id,
        ...plan,
      });

    if (caError) {
      console.error('Failed to store corrective action:', caError);
    }

    // Step 5: Create evidence link
    const { error: evError } = await supabase
      .from('compliance_evidence')
      .insert({
        non_conformity_id: ncData.id,
        evidence_type: 'log',
        title: `${normMatch.norm_type} ${normMatch.norm_clause} - Evidence`,
        description: `Auto-generated evidence for ${normMatch.norm_type} ${normMatch.norm_clause}`,
        norm_type: normMatch.norm_type,
        norm_clause: normMatch.norm_clause,
        verification_status: 'pending',
      });

    if (evError) {
      console.error('Failed to store evidence:', evError);
    }

    return { success: true, non_conformity_id: ncData.id };
  } catch (error) {
    console.error('Error processing incident:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * AI-powered norm matching
 */
async function matchLogToNorm(
  apiKey: string,
  description: string
): Promise<{ norm_type: string; norm_clause: string; confidence: number; explanation: string } | null> {
  try {
    const prompt = `You are a maritime compliance expert. Analyze this incident and identify the most applicable maritime regulation.

Incident Description: ${description}

Available Regulations:
- IMCA (International Marine Contractors Association): Dynamic Positioning, Marine Operations
- ISO (International Standards): ISO 9001 (Quality), ISO 14001 (Environmental), ISO 45001 (Safety)
- ANP (Brazil National Petroleum Agency): Offshore operations, environmental compliance
- IBAMA (Brazilian Environmental Agency): Environmental protection, licensing
- IMO (International Maritime Organization): SOLAS, MARPOL, ISM Code

Respond with a JSON object containing:
{
  "norm_type": "IMCA|ISO|ANP|IBAMA|IMO",
  "norm_clause": "specific clause or section reference",
  "confidence": 0-100,
  "explanation": "brief explanation of why this norm applies"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) return null;

    const result = JSON.parse(content);

    // Validate confidence threshold
    if (result.confidence < 50) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error matching norm:', error);
    return null;
  }
}

/**
 * AI-powered corrective action plan generation
 */
async function generateCorrectivePlan(
  apiKey: string,
  description: string,
  normType: string,
  normClause: string
): Promise<any> {
  try {
    const prompt = `You are a maritime safety expert. Generate a detailed corrective action plan for this non-conformity.

Non-Conformity: ${description}
Applicable Regulation: ${normType} - ${normClause}

Generate a comprehensive action plan with:
1. Clear action title (concise, actionable)
2. Detailed description
3. Step-by-step action steps (3-5 steps)
4. Responsible role (e.g., Captain, Chief Engineer, DPO)
5. Priority level (urgent/high/medium/low)
6. Resources required
7. Estimated hours for completion

Respond with JSON:
{
  "action_title": "string",
  "action_description": "string",
  "action_steps": [
    {"step": 1, "description": "string", "estimated_hours": number}
  ],
  "responsible_role": "string",
  "priority": "urgent|high|medium|low",
  "resources_required": ["string"],
  "estimated_hours": number
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const planData = JSON.parse(content);

    // Calculate deadline based on priority
    const deadline = new Date();
    switch (planData.priority) {
      case 'urgent':
        deadline.setDate(deadline.getDate() + 1);
        break;
      case 'high':
        deadline.setDate(deadline.getDate() + 7);
        break;
      case 'medium':
        deadline.setDate(deadline.getDate() + 14);
        break;
      case 'low':
        deadline.setDate(deadline.getDate() + 30);
        break;
    }

    return {
      action_title: planData.action_title,
      action_description: planData.action_description,
      action_steps: planData.action_steps,
      responsible_role: planData.responsible_role,
      priority: planData.priority,
      deadline: deadline.toISOString(),
      ai_generated: true,
      resources_required: planData.resources_required,
      estimated_hours: planData.estimated_hours,
      status: 'planned',
    };
  } catch (error) {
    console.error('Error generating plan:', error);
    // Return a default plan if AI fails
    return {
      action_title: 'Review and Resolve Non-Conformity',
      action_description: description,
      priority: 'medium',
      status: 'planned',
      ai_generated: false,
    };
  }
}
