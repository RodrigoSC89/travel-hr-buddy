/**
 * ETAPA 33: Live Compliance Module - Service Layer
 * AI-powered maritime compliance automation engine
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// Types and Interfaces
// =====================================================

export interface NonConformity {
  id?: string;
  source_type: 'dp_incident' | 'safety_log' | 'forecast' | 'manual';
  source_id?: string;
  vessel_id?: string;
  vessel_name?: string;
  description: string;
  detected_at?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'in_progress' | 'resolved' | 'archived';
  matched_norms?: MatchedNorm[];
  ai_analysis?: string;
  assigned_to?: string;
  resolved_at?: string;
  resolution_notes?: string;
  tenant_id: string;
}

export interface MatchedNorm {
  norm_type: string; // e.g., "IMCA", "ISO", "ANP", "IBAMA", "IMO"
  clause: string;
  description: string;
  confidence: number;
}

export interface CorrectiveAction {
  id?: string;
  non_conformity_id: string;
  title: string;
  description: string;
  action_type: 'immediate' | 'preventive' | 'corrective' | 'monitoring';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  resources_required?: string;
  estimated_hours?: number;
  tenant_id: string;
}

export interface TrainingAssignment {
  id?: string;
  non_conformity_id: string;
  training_type: string;
  training_title: string;
  training_description?: string;
  assigned_to: string;
  vessel_id?: string;
  due_date?: string;
  status?: 'assigned' | 'in_progress' | 'completed' | 'expired';
  tenant_id: string;
}

export interface ComplianceEvidence {
  id?: string;
  non_conformity_id: string;
  evidence_type: 'document' | 'certificate' | 'photo' | 'video' | 'log' | 'report';
  title: string;
  description?: string;
  file_url?: string;
  norm_reference?: string;
  tenant_id: string;
}

export interface ComplianceScore {
  score: number;
  total_non_conformities: number;
  open_non_conformities: number;
  resolved_non_conformities: number;
  overdue_actions: number;
  automation_rate?: number;
  metadata?: Record<string, any>;
}

// =====================================================
// Core Service Functions
// =====================================================

/**
 * Process a new incident through the compliance workflow
 * 1. Create non-conformity record
 * 2. Match to applicable norms using AI
 * 3. Generate corrective action plan
 * 4. Assign related training
 * 5. Create evidence link
 */
export async function processIncidentForCompliance(
  incidentData: {
    source_type: NonConformity['source_type'];
    source_id?: string;
    vessel_id?: string;
    vessel_name?: string;
    description: string;
    severity?: NonConformity['severity'];
  },
  tenantId: string
): Promise<{ success: boolean; non_conformity_id?: string; error?: string }> {
  try {
    // Step 1: Create non-conformity record
    const nonConformity: NonConformity = {
      source_type: incidentData.source_type,
      source_id: incidentData.source_id,
      vessel_id: incidentData.vessel_id,
      vessel_name: incidentData.vessel_name,
      description: incidentData.description,
      severity: incidentData.severity || 'medium',
      status: 'open',
      tenant_id: tenantId,
    };

    const { data: nc, error: ncError } = await supabase
      .from('compliance_non_conformities')
      .insert(nonConformity)
      .select()
      .single();

    if (ncError || !nc) {
      console.error('Error creating non-conformity:', ncError);
      return { success: false, error: ncError?.message };
    }

    // Step 2: Match to norms using AI (async, don't block)
    matchNormsWithAI(nc.id, incidentData.description, tenantId).catch(console.error);

    // Step 3: Generate corrective actions (async, don't block)
    generateCorrectiveActionPlan(nc.id, incidentData.description, tenantId).catch(console.error);

    // Step 4: Create evidence link
    await createEvidenceLink(nc.id, incidentData.source_type, incidentData.source_id, tenantId);

    return { success: true, non_conformity_id: nc.id };
  } catch (error) {
    console.error('Error processing incident for compliance:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Match incident description to applicable maritime norms using AI
 */
export async function matchNormsWithAI(
  nonConformityId: string,
  description: string,
  tenantId: string
): Promise<MatchedNorm[]> {
  try {
    // Call OpenAI API to analyze the description and match to norms
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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

Return a JSON array of matched norms with: norm_type, clause, description, confidence (0-1).
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
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    const matchedNorms = result.norms || result.matched_norms || [];

    // Update non-conformity with matched norms
    await supabase
      .from('compliance_non_conformities')
      .update({
        matched_norms: matchedNorms,
        ai_analysis: result.analysis || '',
      })
      .eq('id', nonConformityId);

    return matchedNorms;
  } catch (error) {
    console.error('Error matching norms with AI:', error);
    return [];
  }
}

/**
 * Generate corrective action plan using AI
 */
export async function generateCorrectiveActionPlan(
  nonConformityId: string,
  description: string,
  tenantId: string
): Promise<CorrectiveAction[]> {
  try {
    // Call OpenAI API to generate action plan
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return [];
    }

    const result = JSON.parse(content);
    const actions = result.actions || [];

    // Insert corrective actions into database
    const correctiveActions: CorrectiveAction[] = actions.map((action: any) => ({
      non_conformity_id: nonConformityId,
      title: action.title,
      description: action.description,
      action_type: action.action_type || 'corrective',
      priority: action.priority || 'medium',
      status: 'pending',
      resources_required: action.resources_required,
      estimated_hours: action.estimated_hours,
      tenant_id: tenantId,
    }));

    if (correctiveActions.length > 0) {
      await supabase
        .from('compliance_corrective_actions')
        .insert(correctiveActions);
    }

    return correctiveActions;
  } catch (error) {
    console.error('Error generating corrective action plan:', error);
    return [];
  }
}

/**
 * Create evidence link for audit trail
 */
export async function createEvidenceLink(
  nonConformityId: string,
  sourceType: string,
  sourceId?: string,
  tenantId?: string
): Promise<void> {
  if (!sourceId || !tenantId) return;

  try {
    const evidence: ComplianceEvidence = {
      non_conformity_id: nonConformityId,
      evidence_type: 'log',
      title: `${sourceType} reference`,
      description: `Auto-linked evidence from ${sourceType}`,
      tenant_id: tenantId,
    };

    await supabase
      .from('compliance_evidence')
      .insert(evidence);
  } catch (error) {
    console.error('Error creating evidence link:', error);
  }
}

/**
 * Assign reactive training to crew members
 */
export async function assignReactiveTraining(
  nonConformityId: string,
  trainingData: {
    training_type: string;
    training_title: string;
    assigned_to: string;
    vessel_id?: string;
  },
  tenantId: string
): Promise<void> {
  try {
    const assignment: TrainingAssignment = {
      non_conformity_id: nonConformityId,
      training_type: trainingData.training_type,
      training_title: trainingData.training_title,
      assigned_to: trainingData.assigned_to,
      vessel_id: trainingData.vessel_id,
      status: 'assigned',
      tenant_id: tenantId,
    };

    await supabase
      .from('compliance_training_assignments')
      .insert(assignment);
  } catch (error) {
    console.error('Error assigning reactive training:', error);
  }
}

/**
 * Calculate dynamic compliance score
 * Score based on: resolution rate, open actions, overdue penalties
 */
export async function calculateComplianceScore(
  tenantId: string,
  vesselId?: string
): Promise<ComplianceScore> {
  try {
    // Get non-conformity stats
    let ncQuery = supabase
      .from('compliance_non_conformities')
      .select('id, status')
      .eq('tenant_id', tenantId);

    if (vesselId) {
      ncQuery = ncQuery.eq('vessel_id', vesselId);
    }

    const { data: nonConformities } = await ncQuery;

    const total = nonConformities?.length || 0;
    const resolved = nonConformities?.filter(nc => nc.status === 'resolved').length || 0;
    const open = nonConformities?.filter(nc => nc.status === 'open').length || 0;

    // Get overdue actions count
    let actionsQuery = supabase
      .from('compliance_corrective_actions')
      .select('id, due_date, status')
      .eq('tenant_id', tenantId)
      .neq('status', 'completed')
      .lt('due_date', new Date().toISOString());

    const { data: overdueActions } = await actionsQuery;
    const overdue = overdueActions?.length || 0;

    // Calculate score (0-100)
    let score = 100;
    
    if (total > 0) {
      const resolutionRate = resolved / total;
      score = resolutionRate * 100;
      
      // Penalty for open items
      const openPenalty = (open / total) * 20;
      score -= openPenalty;
      
      // Penalty for overdue actions
      const overduePenalty = Math.min(overdue * 5, 30);
      score -= overduePenalty;
    }

    score = Math.max(0, Math.min(100, score));

    const complianceScore: ComplianceScore = {
      score: Math.round(score * 10) / 10,
      total_non_conformities: total,
      open_non_conformities: open,
      resolved_non_conformities: resolved,
      overdue_actions: overdue,
    };

    // Save to history
    await supabase
      .from('compliance_score_history')
      .insert({
        tenant_id: tenantId,
        vessel_id: vesselId,
        ...complianceScore,
      });

    return complianceScore;
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    return {
      score: 0,
      total_non_conformities: 0,
      open_non_conformities: 0,
      resolved_non_conformities: 0,
      overdue_actions: 0,
    };
  }
}

/**
 * Get intelligent status explanation using AI
 */
export async function getComplianceStatusExplanation(
  tenantId: string
): Promise<string> {
  try {
    const score = await calculateComplianceScore(tenantId);
    
    // Call OpenAI for human-readable summary
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a maritime compliance analyst. Provide concise, professional summaries of compliance status.',
          },
          {
            role: 'user',
            content: `Summarize this compliance status in 2-3 sentences:\nScore: ${score.score}/100\nTotal Issues: ${score.total_non_conformities}\nOpen: ${score.open_non_conformities}\nResolved: ${score.resolved_non_conformities}\nOverdue Actions: ${score.overdue_actions}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Status summary unavailable.';
  } catch (error) {
    console.error('Error getting status explanation:', error);
    return 'Unable to generate status summary at this time.';
  }
}

/**
 * Batch process recent incidents for compliance
 * Called by cron job to process incidents from last 24 hours
 */
export async function batchProcessRecentIncidents(
  tenantId: string
): Promise<{ processed: number; errors: number }> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get DP incidents from last 24 hours
    const { data: incidents } = await supabase
      .from('dp_incidents')
      .select('id, vessel_id, vessel_name, description, severity, created_at')
      .eq('tenant_id', tenantId)
      .gte('created_at', yesterday.toISOString())
      .is('compliance_processed', null);

    let processed = 0;
    let errors = 0;

    if (incidents && incidents.length > 0) {
      for (const incident of incidents) {
        const result = await processIncidentForCompliance(
          {
            source_type: 'dp_incident',
            source_id: incident.id,
            vessel_id: incident.vessel_id,
            vessel_name: incident.vessel_name,
            description: incident.description,
            severity: incident.severity as any,
          },
          tenantId
        );

        if (result.success) {
          processed++;
          // Mark incident as processed
          await supabase
            .from('dp_incidents')
            .update({ compliance_processed: true })
            .eq('id', incident.id);
        } else {
          errors++;
        }
      }
    }

    return { processed, errors };
  } catch (error) {
    console.error('Error in batch processing:', error);
    return { processed: 0, errors: 1 };
  }
}
