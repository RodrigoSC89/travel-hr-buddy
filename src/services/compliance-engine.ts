/**
 * COMPLIANCE ENGINE - Core automation for Live Compliance Module
 * ETAPA 33 - Módulo de Conformidade Viva
 * 
 * Continuous compliance monitoring that detects, correlates, and automates:
 * - Technical failures
 * - Corrective action plans
 * - Related trainings
 * - Certifiable evidence
 * - Audit verifications
 */

import { supabase } from '@/integrations/supabase/client';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Types for the compliance engine
export interface NonConformityLog {
  id?: string;
  source_type: 'log' | 'incident' | 'forecast' | 'manual' | 'audit';
  source_id?: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  vessel_id?: string;
  crew_id?: string;
  metadata?: Record<string, unknown>;
}

export interface NormReference {
  norm_type: string; // e.g., 'IMCA', 'IBAMA', 'ANP', 'ISO'
  norm_reference: string; // e.g., 'IMCA M 103', 'ISO 9001:2015'
  norm_clause?: string; // Specific clause or section
  description?: string;
  requirements?: string[];
}

export interface CorrectiveActionPlan {
  title: string;
  description: string;
  action_type: 'immediate' | 'corrective' | 'preventive' | 'training';
  plan_details: Record<string, unknown>;
  priority: 'critical' | 'high' | 'medium' | 'low';
  responsible_role?: string;
  planned_completion_days: number;
  documentation_required?: string[];
}

export interface TrainingReference {
  id?: string;
  training_title: string;
  training_type: string;
  training_description: string;
  norm_type: string;
  norm_reference: string;
  duration_hours?: number;
  requires_certificate: boolean;
}

/**
 * Main orchestration function - Processes a non-conformity through the entire workflow
 */
export async function processNonConformity(log: NonConformityLog): Promise<{
  success: boolean;
  non_conformity_id?: string;
  actions_created?: number;
  trainings_assigned?: number;
  evidence_stored?: number;
  error?: string;
}> {
  try {
    console.log('🔍 Processing non-conformity:', log);

    // Step 1: Match log to applicable norm/regulation
    const norm = await matchLogToNorm(log);
    if (!norm) {
      console.log('⚠️ No matching norm found for this log');
      return {
        success: false,
        error: 'No matching norm found'
      };
    }

    console.log('✅ Matched to norm:', norm);

    // Step 2: Store the non-conformity
    const { data: nonConformity, error: ncError } = await supabase
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
        detection_method: 'ai_analysis'
      })
      .select()
      .single();

    if (ncError || !nonConformity) {
      throw new Error(`Failed to store non-conformity: ${ncError?.message}`);
    }

    console.log('📝 Non-conformity stored:', nonConformity.id);

    // Step 3: Generate corrective action plan using AI
    const plan = await generateCorrectivePlanFromGap(log.description, norm);
    console.log('📋 Generated corrective plan:', plan);

    // Step 4: Store corrective action
    const actionResult = await storeCorrectiveAction(
      nonConformity.id,
      norm,
      plan
    );
    console.log('✅ Corrective action stored:', actionResult);

    // Step 5: Find and assign related training
    let trainingsAssigned = 0;
    const training = await findRelatedTraining(norm);
    if (training && log.crew_id) {
      await assignTrainingToCrew(
        nonConformity.id,
        log.crew_id,
        log.vessel_id,
        training
      );
      trainingsAssigned = 1;
      console.log('🎓 Training assigned:', training.training_title);
    }

    // Step 6: Store evidence link
    const evidenceResult = await storeEvidenceLink({
      non_conformity_id: nonConformity.id,
      norm_type: norm.norm_type,
      norm_reference: norm.norm_reference,
      norm_clause: norm.norm_clause,
      description: `Evidence for ${norm.norm_reference}`,
      evidence_type: 'log_entry'
    });
    console.log('📎 Evidence link stored:', evidenceResult);

    return {
      success: true,
      non_conformity_id: nonConformity.id,
      actions_created: 1,
      trainings_assigned: trainingsAssigned,
      evidence_stored: 1
    };
  } catch (error) {
    console.error('❌ Error processing non-conformity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Match a log/incident to applicable norms and regulations
 */
export async function matchLogToNorm(
  log: NonConformityLog
): Promise<NormReference | null> {
  try {
    // Use AI to analyze the log and identify applicable norms
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
  "description": "string",
  "requirements": ["string array"]
}

If no clear regulation applies, respond with {"norm_type": "none"}.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a maritime compliance expert who identifies applicable regulations.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    ) as NormReference;

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
        description: 'DP Incident Reporting and Investigation'
      };
    }
    return null;
  }
}

/**
 * Generate a corrective action plan using AI based on the gap/issue and norm
 */
export async function generateCorrectivePlanFromGap(
  description: string,
  norm: NormReference
): Promise<CorrectiveActionPlan> {
  try {
    const prompt = `
You are a maritime safety consultant. Generate a corrective action plan for the following non-conformity.

Non-Conformity:
${description}

Applicable Regulation:
${norm.norm_reference} - ${norm.description || ''}

Generate a comprehensive corrective action plan including:
1. Title (concise)
2. Detailed description of actions needed
3. Action type (immediate, corrective, preventive, or training)
4. Priority level (critical, high, medium, low)
5. Responsible role (e.g., "Captain", "Chief Engineer", "DPO")
6. Estimated days to complete
7. Required documentation

Respond in JSON format:
{
  "title": "string",
  "description": "string",
  "action_type": "immediate|corrective|preventive|training",
  "plan_details": {
    "steps": ["array of action steps"],
    "resources_needed": ["array of resources"],
    "verification_criteria": ["array of verification points"]
  },
  "priority": "critical|high|medium|low",
  "responsible_role": "string",
  "planned_completion_days": number,
  "documentation_required": ["array of documents"]
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a maritime safety consultant who creates corrective action plans.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const plan = JSON.parse(
      completion.choices[0].message.content || '{}'
    ) as CorrectiveActionPlan;

    return plan;
  } catch (error) {
    console.error('Error generating corrective plan:', error);
    // Return a basic fallback plan
    return {
      title: 'Corrective Action Required',
      description: `Address non-conformity related to ${norm.norm_reference}`,
      action_type: 'corrective',
      plan_details: {
        steps: ['Investigate root cause', 'Implement corrective measures', 'Verify effectiveness'],
        resources_needed: ['Technical documentation', 'Subject matter expert'],
        verification_criteria: ['Issue resolved', 'Process documented']
      },
      priority: 'medium',
      responsible_role: 'DPO',
      planned_completion_days: 30,
      documentation_required: ['Incident report', 'Corrective action report']
    };
  }
}

/**
 * Store a corrective action in the database
 */
export async function storeCorrectiveAction(
  nonConformityId: string,
  norm: NormReference,
  plan: CorrectiveActionPlan
): Promise<{ success: boolean; action_id?: string; error?: string }> {
  try {
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + plan.planned_completion_days);

    const { data, error } = await supabase
      .from('compliance_corrective_actions')
      .insert({
        non_conformity_id: nonConformityId,
        action_type: plan.action_type,
        title: plan.title,
        description: plan.description,
        plan_details: plan.plan_details,
        priority: plan.priority,
        responsible_role: plan.responsible_role,
        planned_completion_date: completionDate.toISOString(),
        status: 'planned'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, action_id: data.id };
  } catch (error) {
    console.error('Error storing corrective action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Find related training for a given norm/regulation
 */
export async function findRelatedTraining(
  norm: NormReference
): Promise<TrainingReference | null> {
  try {
    // First, try to find existing training records matching this norm
    const { data: existingTraining } = await supabase
      .from('sgso_training_records')
      .select('*')
      .or(`training_title.ilike.%${norm.norm_type}%,training_title.ilike.%${norm.norm_reference}%`)
      .limit(1)
      .single();

    if (existingTraining) {
      return {
        id: existingTraining.id,
        training_title: existingTraining.training_title,
        training_type: existingTraining.training_type,
        training_description: existingTraining.training_description || '',
        norm_type: norm.norm_type,
        norm_reference: norm.norm_reference,
        requires_certificate: true
      };
    }

    // If no existing training, generate training recommendation using AI
    const prompt = `
Based on the following maritime regulation, suggest an appropriate training program.

Regulation:
${norm.norm_reference} - ${norm.description || ''}

Suggest:
1. Training title
2. Training type (from: sgso_awareness, emergency_response, risk_assessment, incident_investigation, safety_procedures, regulatory_compliance)
3. Training description
4. Estimated duration in hours
5. Whether a certificate should be issued

Respond in JSON format:
{
  "training_title": "string",
  "training_type": "string",
  "training_description": "string",
  "duration_hours": number,
  "requires_certificate": boolean
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a maritime training specialist.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5
    });

    const trainingRec = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    return {
      training_title: trainingRec.training_title,
      training_type: trainingRec.training_type,
      training_description: trainingRec.training_description,
      norm_type: norm.norm_type,
      norm_reference: norm.norm_reference,
      duration_hours: trainingRec.duration_hours,
      requires_certificate: trainingRec.requires_certificate
    };
  } catch (error) {
    console.error('Error finding related training:', error);
    // Return a default training suggestion
    return {
      training_title: `${norm.norm_type} Compliance Training`,
      training_type: 'regulatory_compliance',
      training_description: `Training on compliance with ${norm.norm_reference}`,
      norm_type: norm.norm_type,
      norm_reference: norm.norm_reference,
      duration_hours: 4,
      requires_certificate: true
    };
  }
}

/**
 * Assign training to crew member(s)
 */
export async function assignTrainingToCrew(
  nonConformityId: string,
  crewMemberId: string,
  vesselId: string | undefined,
  training: TrainingReference
): Promise<{ success: boolean; assignment_id?: string; error?: string }> {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days to complete

    const { data, error } = await supabase
      .from('compliance_training_assignments')
      .insert({
        non_conformity_id: nonConformityId,
        training_id: training.id,
        training_title: training.training_title,
        training_type: training.training_type,
        training_description: training.training_description,
        crew_member_id: crewMemberId,
        vessel_id: vesselId,
        norm_type: training.norm_type,
        norm_reference: training.norm_reference,
        due_date: dueDate.toISOString(),
        status: 'assigned'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, assignment_id: data.id };
  } catch (error) {
    console.error('Error assigning training:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Store evidence link for audit trail
 */
export async function storeEvidenceLink(evidence: {
  non_conformity_id: string;
  corrective_action_id?: string;
  norm_type: string;
  norm_reference: string;
  norm_clause?: string;
  description: string;
  evidence_type: 'document' | 'certificate' | 'photo' | 'video' | 'log_entry' | 'training_record' | 'inspection_report' | 'other';
  file_url?: string;
}): Promise<{ success: boolean; evidence_id?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('compliance_evidence')
      .insert({
        non_conformity_id: evidence.non_conformity_id,
        corrective_action_id: evidence.corrective_action_id,
        evidence_type: evidence.evidence_type,
        title: evidence.description,
        description: evidence.description,
        norm_type: evidence.norm_type,
        norm_reference: evidence.norm_reference,
        norm_clause: evidence.norm_clause,
        file_url: evidence.file_url,
        is_verified: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, evidence_id: data.id };
  } catch (error) {
    console.error('Error storing evidence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate overall compliance score
 */
export async function calculateComplianceScore(
  organizationId?: string,
  vesselId?: string
): Promise<{
  score: number;
  breakdown: {
    total_conformities: number;
    total_non_conformities: number;
    open_actions: number;
    closed_actions: number;
    overdue_actions: number;
  };
}> {
  try {
    // Query for non-conformities
    let ncQuery = supabase
      .from('compliance_non_conformities')
      .select('id, status');

    if (organizationId) {
      ncQuery = ncQuery.eq('organization_id', organizationId);
    }
    if (vesselId) {
      ncQuery = ncQuery.eq('vessel_id', vesselId);
    }

    const { data: nonConformities = [] } = await ncQuery;

    // Query for corrective actions
    let actionsQuery = supabase
      .from('compliance_corrective_actions')
      .select('id, status, planned_completion_date');

    if (organizationId) {
      actionsQuery = actionsQuery.eq('organization_id', organizationId);
    }

    const { data: actions = [] } = await actionsQuery;

    const now = new Date();
    const openActions = actions.filter(a => 
      ['planned', 'in_progress'].includes(a.status)
    ).length;
    const closedActions = actions.filter(a => 
      a.status === 'completed'
    ).length;
    const overdueActions = actions.filter(a => 
      ['planned', 'in_progress'].includes(a.status) && 
      new Date(a.planned_completion_date) < now
    ).length;

    const total_non_conformities = nonConformities.length;
    const resolvedNonConformities = nonConformities.filter(nc => 
      ['resolved', 'closed'].includes(nc.status)
    ).length;

    // Calculate score (0-100)
    let score = 100;
    if (total_non_conformities > 0) {
      const resolutionRate = resolvedNonConformities / total_non_conformities;
      score = Math.round(resolutionRate * 100);
      
      // Penalize for overdue actions
      if (openActions > 0) {
        const overdueRate = overdueActions / openActions;
        score = Math.max(0, score - Math.round(overdueRate * 20));
      }
    }

    return {
      score,
      breakdown: {
        total_conformities: resolvedNonConformities,
        total_non_conformities,
        open_actions: openActions,
        closed_actions: closedActions,
        overdue_actions: overdueActions
      }
    };
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    return {
      score: 0,
      breakdown: {
        total_conformities: 0,
        total_non_conformities: 0,
        open_actions: 0,
        closed_actions: 0,
        overdue_actions: 0
      }
    };
  }
}

/**
 * Generate AI-powered compliance status explanation
 */
export async function generateComplianceStatusExplanation(
  organizationId?: string,
  vesselId?: string
): Promise<{
  overall_status: string;
  critical_items: string[];
  items_in_correction: string[];
  human_actions_needed: string[];
  summary: string;
}> {
  try {
    // Fetch recent data
    let ncQuery = supabase
      .from('compliance_non_conformities')
      .select('*, compliance_corrective_actions(*), compliance_training_assignments(*)')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (organizationId) {
      ncQuery = ncQuery.eq('organization_id', organizationId);
    }
    if (vesselId) {
      ncQuery = ncQuery.eq('vessel_id', vesselId);
    }

    const { data: nonConformities = [] } = await ncQuery;

    const complianceScore = await calculateComplianceScore(organizationId, vesselId);

    const prompt = `
You are a digital technical auditor.

Based on these compliance records, generate:

1. Overall status (one sentence summary)
2. Critical items pending (list up to 5 most urgent)
3. Items in automatic correction (list ongoing automated actions)
4. Human actions still needed (list what requires manual intervention)

Compliance Score: ${complianceScore.score}/100

Breakdown:
- Total Non-Conformities: ${complianceScore.breakdown.total_non_conformities}
- Resolved: ${complianceScore.breakdown.total_conformities}
- Open Actions: ${complianceScore.breakdown.open_actions}
- Overdue Actions: ${complianceScore.breakdown.overdue_actions}

Recent Non-Conformities:
${JSON.stringify(nonConformities.slice(0, 10), null, 2)}

Respond in JSON format:
{
  "overall_status": "string",
  "critical_items": ["array of strings"],
  "items_in_correction": ["array of strings"],
  "human_actions_needed": ["array of strings"],
  "summary": "string (2-3 sentence executive summary)"
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a digital technical auditor analyzing compliance status.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    );

    return result;
  } catch (error) {
    console.error('Error generating compliance status:', error);
    return {
      overall_status: 'Unable to generate status',
      critical_items: [],
      items_in_correction: [],
      human_actions_needed: [],
      summary: 'Error generating compliance status report'
    };
  }
}
