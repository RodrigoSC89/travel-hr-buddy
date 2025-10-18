/**
 * ETAPA 33 - Compliance Engine Service
 * 
 * Core service for automated compliance monitoring, AI-powered analysis,
 * and corrective action management.
 * 
 * Features:
 * - Automatic non-conformity detection from multiple sources
 * - AI-powered norm matching (IMCA, ISO, ANP, IBAMA, IMO)
 * - Corrective action plan generation via GPT-4o-mini
 * - Reactive training assignment automation
 * - Evidence management for audits
 * - Dynamic compliance score calculation
 */

import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For client-side usage
});

// Types
export interface NonConformity {
  id?: string;
  vessel_id: string;
  source_type: 'dp_incident' | 'safety_log' | 'forecast' | 'manual_report';
  source_id?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detected_at?: string;
  norm_type?: string;
  norm_clause?: string;
  ai_analysis?: any;
  status?: string;
}

export interface CorrectiveAction {
  id?: string;
  non_conformity_id: string;
  action_title: string;
  action_description: string;
  action_steps?: any[];
  responsible_role?: string;
  deadline?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status?: string;
  ai_generated?: boolean;
  resources_required?: any[];
  estimated_hours?: number;
}

export interface NormMatchResult {
  norm_type: string;
  norm_clause: string;
  confidence: number;
  explanation: string;
}

export interface ComplianceScore {
  score: number;
  total_non_conformities: number;
  open_non_conformities: number;
  resolved_non_conformities: number;
  total_corrective_actions: number;
  completed_actions: number;
  overdue_actions: number;
  automation_rate: number;
  calculation_details: any;
}

/**
 * Main workflow: Process a non-conformity through the complete compliance engine
 */
export async function processNonConformity(log: {
  vessel_id: string;
  description: string;
  source_type: 'dp_incident' | 'safety_log' | 'forecast' | 'manual_report';
  source_id?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  crew_id?: string;
}): Promise<{ success: boolean; non_conformity_id?: string; error?: string }> {
  try {
    // Step 1: Match to applicable maritime norms using AI
    const normMatch = await matchLogToNorm(log.description);
    
    if (!normMatch) {
      console.log('No norm match found for incident');
      return { success: false, error: 'No applicable norm found' };
    }

    // Step 2: Create non-conformity record
    const severity = log.severity || determineSeverity(log.description);
    const nonConformity: NonConformity = {
      vessel_id: log.vessel_id,
      source_type: log.source_type,
      source_id: log.source_id,
      description: log.description,
      severity,
      norm_type: normMatch.norm_type,
      norm_clause: normMatch.norm_clause,
      ai_analysis: {
        norm_match: normMatch,
        processed_at: new Date().toISOString(),
      },
      status: 'open',
      detected_at: new Date().toISOString(),
    };

    const { data: ncData, error: ncError } = await supabase
      .from('compliance_non_conformities')
      .insert(nonConformity)
      .select()
      .single();

    if (ncError || !ncData) {
      throw new Error(`Failed to create non-conformity: ${ncError?.message}`);
    }

    // Step 3: Generate corrective action plan using AI
    const plan = await generateCorrectivePlanFromGap(
      log.description,
      normMatch.norm_type,
      normMatch.norm_clause
    );

    // Step 4: Store corrective action
    await storeCorrectiveAction(ncData.id, plan);

    // Step 5: Find and assign related training
    const training = await findRelatedTraining(normMatch.norm_type);
    if (training && log.crew_id) {
      await assignTrainingToCrew(log.crew_id, training.id, ncData.id, log.vessel_id);
    }

    // Step 6: Create evidence link
    await storeEvidenceLink({
      non_conformity_id: ncData.id,
      norm_type: normMatch.norm_type,
      norm_clause: normMatch.norm_clause,
      description: `Auto-generated evidence for ${normMatch.norm_type} ${normMatch.norm_clause}`,
    });

    return { success: true, non_conformity_id: ncData.id };
  } catch (error) {
    console.error('Error processing non-conformity:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * AI-powered norm matching: Analyzes incident description and identifies applicable regulations
 */
export async function matchLogToNorm(description: string): Promise<NormMatchResult | null> {
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
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
export async function generateCorrectivePlanFromGap(
  description: string,
  normType: string,
  normClause: string
): Promise<CorrectiveAction> {
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
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
      non_conformity_id: '', // Will be set by caller
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
      non_conformity_id: '',
      action_title: 'Review and Resolve Non-Conformity',
      action_description: description,
      priority: 'medium',
      status: 'planned',
    };
  }
}

/**
 * Store corrective action in database
 */
export async function storeCorrectiveAction(
  nonConformityId: string,
  action: CorrectiveAction
): Promise<void> {
  action.non_conformity_id = nonConformityId;
  
  const { error } = await supabase
    .from('compliance_corrective_actions')
    .insert(action);

  if (error) {
    throw new Error(`Failed to store corrective action: ${error.message}`);
  }
}

/**
 * Find related training module for a specific norm type
 */
export async function findRelatedTraining(normType: string): Promise<any | null> {
  try {
    // Search training modules by keywords related to the norm
    const keywords = {
      IMCA: ['DP', 'Dynamic Positioning', 'Marine Operations'],
      ISO: ['Quality', 'Safety', 'Environmental'],
      ANP: ['Offshore', 'Petroleum', 'Compliance'],
      IBAMA: ['Environmental', 'Licensing'],
      IMO: ['SOLAS', 'MARPOL', 'ISM Code'],
    };

    const searchTerms = keywords[normType as keyof typeof keywords] || [normType];
    
    const { data } = await supabase
      .from('training_modules')
      .select('*')
      .or(searchTerms.map(term => `title.ilike.%${term}%`).join(','))
      .limit(1)
      .single();

    return data;
  } catch (error) {
    console.error('Error finding training:', error);
    return null;
  }
}

/**
 * Assign training to crew member
 */
export async function assignTrainingToCrew(
  crewMemberId: string,
  trainingModuleId: string,
  nonConformityId: string,
  vesselId: string
): Promise<void> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 2 weeks to complete

  const { error } = await supabase
    .from('compliance_training_assignments')
    .insert({
      non_conformity_id: nonConformityId,
      training_module_id: trainingModuleId,
      crew_member_id: crewMemberId,
      vessel_id: vesselId,
      assigned_reason: 'Reactive training due to non-conformity',
      priority: 'high',
      due_date: dueDate.toISOString(),
      status: 'assigned',
    });

  if (error) {
    throw new Error(`Failed to assign training: ${error.message}`);
  }
}

/**
 * Store evidence link for audit trail
 */
export async function storeEvidenceLink(data: {
  non_conformity_id: string;
  corrective_action_id?: string;
  norm_type: string;
  norm_clause: string;
  description: string;
  file_url?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('compliance_evidence')
    .insert({
      non_conformity_id: data.non_conformity_id,
      corrective_action_id: data.corrective_action_id,
      evidence_type: 'log',
      title: `${data.norm_type} ${data.norm_clause} - Evidence`,
      description: data.description,
      file_url: data.file_url,
      norm_type: data.norm_type,
      norm_clause: data.norm_clause,
      verification_status: 'pending',
    });

  if (error) {
    throw new Error(`Failed to store evidence: ${error.message}`);
  }
}

/**
 * Calculate dynamic compliance score (0-100)
 */
export async function calculateComplianceScore(vesselId?: string): Promise<ComplianceScore> {
  try {
    // Query non-conformities
    let ncQuery = supabase
      .from('compliance_non_conformities')
      .select('id, status, severity');
    
    if (vesselId) {
      ncQuery = ncQuery.eq('vessel_id', vesselId);
    }

    const { data: nonConformities } = await ncQuery;

    // Query corrective actions
    let caQuery = supabase
      .from('compliance_corrective_actions')
      .select('id, status, deadline, non_conformity_id');

    if (vesselId && nonConformities) {
      const ncIds = nonConformities.map(nc => nc.id);
      caQuery = caQuery.in('non_conformity_id', ncIds);
    }

    const { data: actions } = await caQuery;

    // Calculate metrics
    const totalNC = nonConformities?.length || 0;
    const openNC = nonConformities?.filter(nc => nc.status === 'open').length || 0;
    const inProgressNC = nonConformities?.filter(nc => nc.status === 'in_progress').length || 0;
    const resolvedNC = nonConformities?.filter(nc => nc.status === 'resolved').length || 0;
    
    const totalActions = actions?.length || 0;
    const completedActions = actions?.filter(a => a.status === 'completed').length || 0;
    const overdueActions = actions?.filter(a => {
      if (a.status === 'completed') return false;
      if (!a.deadline) return false;
      return new Date(a.deadline) < new Date();
    }).length || 0;

    // Calculate score
    let score = 100;
    
    // Deduct points for open non-conformities
    score -= openNC * 5;
    
    // Deduct points for overdue actions
    score -= overdueActions * 10;
    
    // Bonus for resolved non-conformities
    if (totalNC > 0) {
      const resolutionRate = (resolvedNC / totalNC) * 100;
      score = Math.max(score, resolutionRate);
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Calculate automation rate
    const automatedActions = actions?.filter(a => a.ai_generated).length || 0;
    const automationRate = totalActions > 0 ? (automatedActions / totalActions) * 100 : 0;

    return {
      score: Math.round(score * 100) / 100,
      total_non_conformities: totalNC,
      open_non_conformities: openNC,
      resolved_non_conformities: resolvedNC,
      total_corrective_actions: totalActions,
      completed_actions: completedActions,
      overdue_actions: overdueActions,
      automation_rate: Math.round(automationRate * 100) / 100,
      calculation_details: {
        resolution_rate: totalNC > 0 ? (resolvedNC / totalNC) * 100 : 0,
        completion_rate: totalActions > 0 ? (completedActions / totalActions) * 100 : 0,
      },
    };
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    return {
      score: 0,
      total_non_conformities: 0,
      open_non_conformities: 0,
      resolved_non_conformities: 0,
      total_corrective_actions: 0,
      completed_actions: 0,
      overdue_actions: 0,
      automation_rate: 0,
      calculation_details: {},
    };
  }
}

/**
 * Save compliance score to history
 */
export async function saveComplianceScore(vesselId: string, score: ComplianceScore): Promise<void> {
  const { error } = await supabase
    .from('compliance_score_history')
    .insert({
      vessel_id: vesselId,
      score: score.score,
      total_non_conformities: score.total_non_conformities,
      open_non_conformities: score.open_non_conformities,
      in_progress_non_conformities: 0,
      resolved_non_conformities: score.resolved_non_conformities,
      total_corrective_actions: score.total_corrective_actions,
      completed_actions: score.completed_actions,
      overdue_actions: score.overdue_actions,
      automation_rate: score.automation_rate,
      calculation_details: score.calculation_details,
    });

  if (error) {
    throw new Error(`Failed to save score: ${error.message}`);
  }
}

/**
 * AI-powered compliance status explanation
 */
export async function getComplianceStatusExplanation(vesselId?: string): Promise<string> {
  try {
    const score = await calculateComplianceScore(vesselId);

    const prompt = `You are a maritime compliance auditor. Provide a brief, executive summary of the compliance status.

Compliance Metrics:
- Overall Score: ${score.score}/100
- Total Non-Conformities: ${score.total_non_conformities}
- Open: ${score.open_non_conformities}
- Resolved: ${score.resolved_non_conformities}
- Total Corrective Actions: ${score.total_corrective_actions}
- Completed Actions: ${score.completed_actions}
- Overdue Actions: ${score.overdue_actions}
- Automation Rate: ${score.automation_rate}%

Provide a 2-3 sentence summary covering:
1. Overall compliance state (Excellent/Good/Fair/Poor)
2. Critical items pending
3. Key actions needed

Keep it professional and actionable.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || 'Status summary unavailable';
  } catch (error) {
    console.error('Error generating status explanation:', error);
    return 'Unable to generate compliance status summary at this time.';
  }
}

/**
 * Helper: Determine severity from description
 */
function determineSeverity(description: string): 'critical' | 'high' | 'medium' | 'low' {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('critical') || lowerDesc.includes('emergency') || lowerDesc.includes('life-threatening')) {
    return 'critical';
  }
  if (lowerDesc.includes('high') || lowerDesc.includes('serious') || lowerDesc.includes('major')) {
    return 'high';
  }
  if (lowerDesc.includes('minor') || lowerDesc.includes('low')) {
    return 'low';
  }
  return 'medium';
}
