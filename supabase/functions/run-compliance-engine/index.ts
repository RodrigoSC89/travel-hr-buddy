/**
 * Live Compliance Engine - Automated Daily Processing
 * Runs daily at 5:00 AM UTC via cron schedule
 * 
 * This function:
 * 1. Scans new DP incidents from the last 24 hours
 * 2. Processes each through the complete compliance workflow
 * 3. Calculates and saves daily compliance score
 * 4. Logs execution results for monitoring
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===========================
// Type Definitions
// ===========================

interface ApplicableNorm {
  norm: string;
  clause: string;
  description: string;
}

interface ActionPlan {
  steps: string[];
  resources: string[];
  timeline: string;
  responsibilities: string;
}

// ===========================
// Core Processing Functions
// ===========================

/**
 * Detects and creates a new non-conformity
 */
async function detectNonConformity(
  sourceType: string,
  sourceId: string,
  description: string,
  severity: string,
  vesselId?: string
) {
  const { data, error } = await supabase
    .from('compliance_non_conformities')
    .insert({
      source_type: sourceType,
      source_id: sourceId,
      description,
      severity,
      vessel_id: vesselId,
      status: 'open'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * AI-powered norm matching (simplified for edge function)
 */
function matchApplicableNorms(description: string): ApplicableNorm[] {
  const norms: ApplicableNorm[] = [];
  const desc = description.toLowerCase();

  if (desc.includes('gyro') || desc.includes('positioning') || desc.includes('dp')) {
    norms.push({
      norm: 'IMCA',
      clause: 'M182',
      description: 'Guidelines for Design and Operation of Dynamically Positioned Vessels'
    });
  }

  if (desc.includes('safety') || desc.includes('incident') || desc.includes('accident')) {
    norms.push({
      norm: 'ISO',
      clause: '45001',
      description: 'Occupational health and safety management systems'
    });
  }

  if (desc.includes('environment') || desc.includes('pollution') || desc.includes('spill')) {
    norms.push({
      norm: 'IBAMA',
      clause: 'Resolução 350/04',
      description: 'Licenciamento ambiental de atividades offshore'
    });
  }

  if (desc.includes('equipment') || desc.includes('maintenance') || desc.includes('failure')) {
    norms.push({
      norm: 'IMO',
      clause: 'MSC.1/Circ.1580',
      description: 'Guidelines for Vessels with Dynamic Positioning Systems'
    });
  }

  return norms;
}

/**
 * Updates non-conformity with applicable norms
 */
async function updateNonConformityNorms(nonConformityId: string, norms: ApplicableNorm[]) {
  const { error } = await supabase
    .from('compliance_non_conformities')
    .update({ applicable_norms: norms })
    .eq('id', nonConformityId);

  if (error) throw error;
}

/**
 * Generates corrective action plan
 */
function generateCorrectiveActionPlan(
  description: string,
  severity: string,
  norms: ApplicableNorm[]
): ActionPlan {
  const steps: string[] = [];
  const resources: string[] = [];
  
  if (severity === 'critical' || severity === 'high') {
    steps.push('Immediate containment and safety measures');
    steps.push('Notify relevant authorities and stakeholders');
  }
  
  steps.push('Root cause analysis');
  steps.push('Develop and implement corrective measures');
  steps.push('Training and awareness for crew members');
  steps.push('Verification and validation of effectiveness');
  steps.push('Document lessons learned');
  
  resources.push('Technical specialist');
  resources.push('Safety officer');
  resources.push('Training materials');
  resources.push('Compliance documentation');

  const timeline = severity === 'critical' ? '7 days' : severity === 'high' ? '14 days' : '30 days';

  return {
    steps,
    resources,
    timeline,
    responsibilities: 'Safety Manager and Vessel Master'
  };
}

/**
 * Creates corrective action
 */
async function createCorrectiveAction(
  nonConformityId: string,
  actionPlan: ActionPlan,
  priority: string,
  daysUntilDue: number
) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  const { data, error } = await supabase
    .from('compliance_corrective_actions')
    .insert({
      non_conformity_id: nonConformityId,
      action_plan: actionPlan,
      priority,
      due_date: dueDate.toISOString(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Assigns reactive training
 */
async function assignReactiveTraining(
  nonConformityId: string,
  vesselId: string,
  description: string
) {
  const desc = description.toLowerCase();
  let trainingModule = 'General Safety Awareness';
  let trainingDescription = 'Review of general maritime safety procedures';

  if (desc.includes('dp') || desc.includes('positioning')) {
    trainingModule = 'DP Operations and Safety';
    trainingDescription = 'Dynamic Positioning systems operation and failure response';
  } else if (desc.includes('fire') || desc.includes('emergency')) {
    trainingModule = 'Emergency Response Procedures';
    trainingDescription = 'Emergency response and evacuation procedures';
  } else if (desc.includes('equipment') || desc.includes('maintenance')) {
    trainingModule = 'Equipment Maintenance and Safety';
    trainingDescription = 'Proper equipment operation and maintenance procedures';
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const { data, error } = await supabase
    .from('compliance_training_assignments')
    .insert({
      non_conformity_id: nonConformityId,
      vessel_id: vesselId,
      training_module: trainingModule,
      training_description: trainingDescription,
      due_date: dueDate.toISOString(),
      status: 'assigned'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Creates evidence entry
 */
async function createEvidence(
  nonConformityId: string,
  description: string,
  normReference: string | undefined,
  sourceType: string,
  sourceId: string
) {
  const { data, error } = await supabase
    .from('compliance_evidence')
    .insert({
      non_conformity_id: nonConformityId,
      evidence_type: 'log_entry',
      description,
      norm_reference: normReference,
      metadata: { source_type: sourceType, source_id: sourceId }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Processes a single incident through the compliance workflow
 */
async function processIncident(incident: any) {
  try {
    // Determine severity based on incident characteristics
    let severity = 'medium';
    const desc = incident.summary?.toLowerCase() || incident.title?.toLowerCase() || '';
    
    if (desc.includes('critical') || desc.includes('fatal') || desc.includes('severe')) {
      severity = 'critical';
    } else if (desc.includes('major') || desc.includes('significant') || desc.includes('serious')) {
      severity = 'high';
    } else if (desc.includes('minor') || desc.includes('negligible')) {
      severity = 'low';
    }

    const description = incident.summary || incident.title || 'DP Incident';
    
    // Step 1: Create non-conformity
    const nonConformity = await detectNonConformity(
      'dp_incident',
      incident.id,
      description,
      severity,
      incident.vessel
    );

    // Step 2: Match applicable norms
    const norms = matchApplicableNorms(description);
    if (norms.length > 0) {
      await updateNonConformityNorms(nonConformity.id, norms);
    }

    // Step 3: Generate and create corrective action plan
    const actionPlan = generateCorrectiveActionPlan(description, severity, norms);
    const daysUntilDue = severity === 'critical' ? 7 : severity === 'high' ? 14 : 30;
    await createCorrectiveAction(nonConformity.id, actionPlan, severity, daysUntilDue);

    // Step 4: Assign reactive training
    if (incident.vessel) {
      await assignReactiveTraining(nonConformity.id, incident.vessel, description);
    }

    // Step 5: Create initial evidence
    await createEvidence(
      nonConformity.id,
      `Initial incident report: ${description.substring(0, 100)}...`,
      norms[0]?.norm,
      'dp_incident',
      incident.id
    );

    return { success: true, nonConformityId: nonConformity.id };
  } catch (error) {
    console.error('Error processing incident:', incident.id, error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculates and saves compliance score
 */
async function calculateAndSaveComplianceScore() {
  try {
    // Get counts
    const { count: openCount } = await supabase
      .from('compliance_non_conformities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    const { count: resolvedCount } = await supabase
      .from('compliance_non_conformities')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');

    const { count: overdueCount } = await supabase
      .from('compliance_corrective_actions')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', new Date().toISOString())
      .neq('status', 'completed');

    // Calculate score
    let score = 100;
    score -= (openCount || 0) * 5;
    score -= (overdueCount || 0) * 10;
    
    const totalNCs = (openCount || 0) + (resolvedCount || 0);
    if (totalNCs > 0) {
      const resolutionRate = (resolvedCount || 0) / totalNCs;
      score += Math.floor(resolutionRate * 20);
    }

    score = Math.max(0, Math.min(100, score));

    // Save to history
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30);

    await supabase.from('compliance_score_history').insert({
      score,
      open_non_conformities: openCount || 0,
      resolved_non_conformities: resolvedCount || 0,
      overdue_actions: overdueCount || 0,
      automation_rate: 85.0,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString()
    });

    return { score, openCount, resolvedCount, overdueCount };
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    throw error;
  }
}

// ===========================
// Main Handler
// ===========================

serve(async (req) => {
  try {
    console.log('🚀 Live Compliance Engine - Starting daily processing...');

    // Get DP incidents from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: incidents, error: fetchError } = await supabase
      .from('dp_incidents')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch incidents: ${fetchError.message}`);
    }

    console.log(`📊 Found ${incidents?.length || 0} incidents from the last 24 hours`);

    // Process each incident
    const results = [];
    for (const incident of incidents || []) {
      const result = await processIncident(incident);
      results.push({
        incident_id: incident.id,
        ...result
      });
    }

    // Calculate and save compliance score
    const scoreData = await calculateAndSaveComplianceScore();

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ Processed ${successCount} incidents successfully`);
    if (failureCount > 0) {
      console.log(`❌ Failed to process ${failureCount} incidents`);
    }
    console.log(`📈 Compliance Score: ${scoreData.score}/100`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Compliance engine executed successfully',
        stats: {
          incidents_processed: incidents?.length || 0,
          successful: successCount,
          failed: failureCount,
          compliance_score: scoreData.score,
          open_non_conformities: scoreData.openCount,
          resolved_non_conformities: scoreData.resolvedCount,
          overdue_actions: scoreData.overdueCount
        },
        results
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error in compliance engine:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
