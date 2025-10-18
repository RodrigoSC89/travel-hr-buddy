/**
 * Live Compliance Engine (ETAPA 33)
 * AI-Powered Maritime Compliance Automation Service
 * 
 * This service provides core functions for:
 * - Non-conformity workflow orchestration
 * - AI-powered norm matching and plan generation
 * - Training assignment automation
 * - Evidence management
 * - Dynamic score calculation
 * - Intelligent status reporting
 */

import { supabase } from "@/integrations/supabase/client";

// ===========================
// Type Definitions
// ===========================

export interface NonConformity {
  id?: string;
  source_type: 'dp_incident' | 'safety_log' | 'forecast' | 'manual_report' | 'audit_finding';
  source_id?: string;
  detected_at?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status?: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  applicable_norms?: ApplicableNorm[];
  vessel_id?: string;
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
}

export interface ApplicableNorm {
  norm: string; // e.g., "IMCA", "ISO", "ANP", "IBAMA", "IMO"
  clause: string;
  description: string;
}

export interface CorrectiveAction {
  id?: string;
  non_conformity_id: string;
  action_plan: {
    steps: string[];
    resources: string[];
    timeline: string;
    responsibilities: string;
  };
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  due_date?: string;
  completed_at?: string;
  completion_evidence?: string;
  created_by?: string;
  assigned_to?: string;
}

export interface TrainingAssignment {
  id?: string;
  non_conformity_id: string;
  vessel_id: string;
  crew_member_id?: string;
  training_module: string;
  training_description?: string;
  status?: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  due_date?: string;
  completed_at?: string;
  certificate_url?: string;
}

export interface ComplianceEvidence {
  id?: string;
  non_conformity_id: string;
  evidence_type: 'document' | 'photo' | 'log_entry' | 'certificate' | 'report' | 'email';
  file_url?: string;
  description: string;
  norm_reference?: string;
  collected_at?: string;
  collected_by?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceScore {
  score: number;
  open_non_conformities: number;
  resolved_non_conformities: number;
  overdue_actions: number;
  automation_rate: number;
  period_start: string;
  period_end: string;
  metadata?: Record<string, any>;
}

// ===========================
// 1. Non-Conformity Detection & Creation
// ===========================

/**
 * Detects and creates a new non-conformity from an incident or manual report
 */
export async function detectNonConformity(
  sourceType: NonConformity['source_type'],
  sourceId: string | undefined,
  description: string,
  severity: NonConformity['severity'],
  vesselId?: string
): Promise<NonConformity | null> {
  try {
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

    if (error) {
      console.error('Error creating non-conformity:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in detectNonConformity:', error);
    return null;
  }
}

// ===========================
// 2. AI-Powered Norm Matching
// ===========================

/**
 * Uses GPT-4o-mini to match incident descriptions to applicable maritime regulations
 * This is a placeholder - actual implementation would call OpenAI API
 */
export async function matchApplicableNorms(description: string): Promise<ApplicableNorm[]> {
  // In production, this would call OpenAI API with maritime compliance knowledge
  // For now, return mock norms based on keyword matching
  const norms: ApplicableNorm[] = [];

  if (description.toLowerCase().includes('gyro') || description.toLowerCase().includes('positioning')) {
    norms.push({
      norm: 'IMCA',
      clause: 'M182',
      description: 'Guidelines for Design and Operation of Dynamically Positioned Vessels'
    });
  }

  if (description.toLowerCase().includes('safety') || description.toLowerCase().includes('incident')) {
    norms.push({
      norm: 'ISO',
      clause: '45001',
      description: 'Occupational health and safety management systems'
    });
  }

  if (description.toLowerCase().includes('environment') || description.toLowerCase().includes('pollution')) {
    norms.push({
      norm: 'IBAMA',
      clause: 'Resolução 350/04',
      description: 'Licenciamento ambiental de atividades offshore'
    });
  }

  return norms;
}

/**
 * Updates a non-conformity with AI-matched applicable norms
 */
export async function updateNonConformityNorms(
  nonConformityId: string,
  norms: ApplicableNorm[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('compliance_non_conformities')
      .update({ applicable_norms: norms })
      .eq('id', nonConformityId);

    if (error) {
      console.error('Error updating norms:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in updateNonConformityNorms:', error);
    return false;
  }
}

// ===========================
// 3. AI-Powered Corrective Action Plan Generation
// ===========================

/**
 * Generates a corrective action plan using GPT-4o-mini
 * This is a placeholder - actual implementation would call OpenAI API
 */
export async function generateCorrectiveActionPlan(
  description: string,
  severity: string,
  norms: ApplicableNorm[]
): Promise<CorrectiveAction['action_plan']> {
  // In production, this would call OpenAI API with maritime compliance knowledge
  // For now, return a template-based plan
  
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
  const responsibilities = 'Safety Manager and Vessel Master';

  return {
    steps,
    resources,
    timeline,
    responsibilities
  };
}

/**
 * Creates a corrective action with AI-generated plan
 */
export async function createCorrectiveAction(
  nonConformityId: string,
  actionPlan: CorrectiveAction['action_plan'],
  priority: CorrectiveAction['priority'] = 'medium',
  daysUntilDue: number = 30
): Promise<CorrectiveAction | null> {
  try {
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

    if (error) {
      console.error('Error creating corrective action:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in createCorrectiveAction:', error);
    return null;
  }
}

// ===========================
// 4. Training Assignment Automation
// ===========================

/**
 * Automatically assigns reactive training based on the incident type
 */
export async function assignReactiveTraining(
  nonConformityId: string,
  vesselId: string,
  description: string
): Promise<TrainingAssignment | null> {
  try {
    // Determine training module based on incident description
    let trainingModule = 'General Safety Awareness';
    let trainingDescription = 'Review of general maritime safety procedures';

    if (description.toLowerCase().includes('dp') || description.toLowerCase().includes('positioning')) {
      trainingModule = 'DP Operations and Safety';
      trainingDescription = 'Dynamic Positioning systems operation and failure response';
    } else if (description.toLowerCase().includes('fire') || description.toLowerCase().includes('emergency')) {
      trainingModule = 'Emergency Response Procedures';
      trainingDescription = 'Emergency response and evacuation procedures';
    } else if (description.toLowerCase().includes('equipment') || description.toLowerCase().includes('maintenance')) {
      trainingModule = 'Equipment Maintenance and Safety';
      trainingDescription = 'Proper equipment operation and maintenance procedures';
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days to complete training

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

    if (error) {
      console.error('Error creating training assignment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in assignReactiveTraining:', error);
    return null;
  }
}

// ===========================
// 5. Evidence Management
// ===========================

/**
 * Creates certifiable evidence for audit purposes
 */
export async function createEvidence(
  nonConformityId: string,
  evidenceType: ComplianceEvidence['evidence_type'],
  description: string,
  normReference?: string,
  fileUrl?: string,
  metadata?: Record<string, any>
): Promise<ComplianceEvidence | null> {
  try {
    const { data, error } = await supabase
      .from('compliance_evidence')
      .insert({
        non_conformity_id: nonConformityId,
        evidence_type: evidenceType,
        description,
        norm_reference: normReference,
        file_url: fileUrl,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating evidence:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in createEvidence:', error);
    return null;
  }
}

// ===========================
// 6. Complete Workflow Orchestration
// ===========================

/**
 * Processes an incident through the complete compliance workflow
 * This is the main entry point for automation
 */
export async function processIncidentCompliance(
  sourceType: NonConformity['source_type'],
  sourceId: string,
  description: string,
  severity: NonConformity['severity'],
  vesselId?: string
): Promise<{ success: boolean; nonConformityId?: string; message: string }> {
  try {
    // Step 1: Create non-conformity
    const nonConformity = await detectNonConformity(sourceType, sourceId, description, severity, vesselId);
    if (!nonConformity || !nonConformity.id) {
      return { success: false, message: 'Failed to create non-conformity' };
    }

    // Step 2: Match applicable norms using AI
    const norms = await matchApplicableNorms(description);
    if (norms.length > 0) {
      await updateNonConformityNorms(nonConformity.id, norms);
    }

    // Step 3: Generate corrective action plan
    const actionPlan = await generateCorrectiveActionPlan(description, severity, norms);
    const daysUntilDue = severity === 'critical' ? 7 : severity === 'high' ? 14 : 30;
    await createCorrectiveAction(nonConformity.id, actionPlan, severity as any, daysUntilDue);

    // Step 4: Assign reactive training
    if (vesselId) {
      await assignReactiveTraining(nonConformity.id, vesselId, description);
    }

    // Step 5: Create initial evidence entry
    await createEvidence(
      nonConformity.id,
      'log_entry',
      `Initial incident report: ${description.substring(0, 100)}...`,
      norms[0]?.norm,
      undefined,
      { source_type: sourceType, source_id: sourceId }
    );

    return {
      success: true,
      nonConformityId: nonConformity.id,
      message: 'Incident processed successfully through compliance workflow'
    };
  } catch (error) {
    console.error('Exception in processIncidentCompliance:', error);
    return { success: false, message: `Error: ${error}` };
  }
}

// ===========================
// 7. Compliance Score Calculation
// ===========================

/**
 * Calculates the current compliance score (0-100)
 * Formula: Base 100 - penalties for open issues, overdue actions, etc.
 */
export async function calculateComplianceScore(): Promise<ComplianceScore> {
  try {
    // Get open non-conformities count
    const { data: openNCs, error: openError } = await supabase
      .from('compliance_non_conformities')
      .select('id', { count: 'exact' })
      .eq('status', 'open');

    // Get resolved non-conformities count
    const { data: resolvedNCs, error: resolvedError } = await supabase
      .from('compliance_non_conformities')
      .select('id', { count: 'exact' })
      .eq('status', 'resolved');

    // Get overdue actions count
    const { data: overdueActions, error: overdueError } = await supabase
      .from('compliance_corrective_actions')
      .select('id', { count: 'exact' })
      .lt('due_date', new Date().toISOString())
      .neq('status', 'completed');

    const openCount = openNCs?.length || 0;
    const resolvedCount = resolvedNCs?.length || 0;
    const overdueCount = overdueActions?.length || 0;

    // Calculate score
    let score = 100;
    score -= openCount * 5; // -5 points per open NC
    score -= overdueCount * 10; // -10 points per overdue action
    
    // Resolution rate bonus
    const totalNCs = openCount + resolvedCount;
    if (totalNCs > 0) {
      const resolutionRate = resolvedCount / totalNCs;
      score += Math.floor(resolutionRate * 20); // Up to +20 bonus for high resolution rate
    }

    score = Math.max(0, Math.min(100, score)); // Clamp between 0-100

    // Calculate automation rate (placeholder - would track automated vs manual processing)
    const automationRate = 85.0; // 85% automation rate target

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 30); // Last 30 days

    return {
      score,
      open_non_conformities: openCount,
      resolved_non_conformities: resolvedCount,
      overdue_actions: overdueCount,
      automation_rate: automationRate,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString()
    };
  } catch (error) {
    console.error('Exception in calculateComplianceScore:', error);
    return {
      score: 0,
      open_non_conformities: 0,
      resolved_non_conformities: 0,
      overdue_actions: 0,
      automation_rate: 0,
      period_start: new Date().toISOString(),
      period_end: new Date().toISOString()
    };
  }
}

/**
 * Saves the compliance score to history
 */
export async function saveComplianceScoreHistory(score: ComplianceScore): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('compliance_score_history')
      .insert(score);

    if (error) {
      console.error('Error saving score history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in saveComplianceScoreHistory:', error);
    return false;
  }
}

// ===========================
// 8. Intelligent Status Reporting
// ===========================

/**
 * Generates an AI-powered summary of the current compliance status
 * This is a placeholder - actual implementation would use GPT-4o-mini
 */
export async function generateComplianceStatusSummary(): Promise<string> {
  try {
    const score = await calculateComplianceScore();
    
    let summary = `Compliance Score: ${score.score}/100\n\n`;
    
    if (score.score >= 90) {
      summary += '✅ Excellent compliance status. System is operating within acceptable parameters.\n';
    } else if (score.score >= 75) {
      summary += '⚠️ Good compliance status with minor issues requiring attention.\n';
    } else if (score.score >= 60) {
      summary += '⚠️ Moderate compliance concerns. Action required to address open issues.\n';
    } else {
      summary += '🚨 Critical compliance issues detected. Immediate action required.\n';
    }
    
    summary += `\n📊 Current Status:\n`;
    summary += `- Open Non-Conformities: ${score.open_non_conformities}\n`;
    summary += `- Resolved Non-Conformities: ${score.resolved_non_conformities}\n`;
    summary += `- Overdue Actions: ${score.overdue_actions}\n`;
    summary += `- Automation Rate: ${score.automation_rate.toFixed(1)}%\n`;
    
    if (score.overdue_actions > 0) {
      summary += `\n🔴 Priority: ${score.overdue_actions} overdue corrective actions require immediate attention.\n`;
    }
    
    return summary;
  } catch (error) {
    console.error('Exception in generateComplianceStatusSummary:', error);
    return 'Unable to generate compliance status summary.';
  }
}

// ===========================
// 9. Query Functions for Dashboard
// ===========================

/**
 * Gets all non-conformities with filters
 */
export async function getNonConformities(filters?: {
  status?: string;
  severity?: string;
  vessel_id?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('compliance_non_conformities')
      .select('*')
      .order('detected_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.vessel_id) {
      query = query.eq('vessel_id', filters.vessel_id);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching non-conformities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getNonConformities:', error);
    return [];
  }
}

/**
 * Gets corrective actions for a non-conformity
 */
export async function getCorrectiveActions(nonConformityId: string) {
  try {
    const { data, error } = await supabase
      .from('compliance_corrective_actions')
      .select('*')
      .eq('non_conformity_id', nonConformityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching corrective actions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getCorrectiveActions:', error);
    return [];
  }
}

/**
 * Gets training assignments with filters
 */
export async function getTrainingAssignments(filters?: {
  vessel_id?: string;
  status?: string;
}) {
  try {
    let query = supabase
      .from('compliance_training_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.vessel_id) {
      query = query.eq('vessel_id', filters.vessel_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching training assignments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getTrainingAssignments:', error);
    return [];
  }
}

/**
 * Gets evidence items grouped by norm
 */
export async function getEvidenceByNorm() {
  try {
    const { data, error } = await supabase
      .from('compliance_evidence')
      .select('*')
      .order('collected_at', { ascending: false });

    if (error) {
      console.error('Error fetching evidence:', error);
      return {};
    }

    // Group by norm_reference
    const grouped: Record<string, any[]> = {};
    (data || []).forEach((item) => {
      const norm = item.norm_reference || 'No Norm Specified';
      if (!grouped[norm]) {
        grouped[norm] = [];
      }
      grouped[norm].push(item);
    });

    return grouped;
  } catch (error) {
    console.error('Exception in getEvidenceByNorm:', error);
    return {};
  }
}
