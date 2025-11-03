/**
 * API Handler for Pre-OVID Inspections
 * PATCH 650 - Pre-OVID Inspection Module
 */

import { supabase } from '@/lib/supabase';

export interface PreOvidInspection {
  id?: string;
  vessel_id?: string;
  inspector_id: string;
  inspection_date?: string;
  status?: 'draft' | 'submitted' | 'reviewed';
  risk_rating?: string;
  notes?: string;
  location?: string;
  checklist_version?: string;
}

export interface PreOvidResponse {
  section: string;
  question_number: string;
  question_text: string;
  response: string;
  comments?: string;
  non_conformity?: boolean;
  ai_suggestion?: string;
  ai_risk_analysis?: string;
}

export interface PreOvidEvidence {
  filename: string;
  file_url: string;
  related_section?: string;
  file_type?: string;
  file_size?: number;
}

/**
 * Create a new inspection
 */
export async function createInspection(
  inspection: PreOvidInspection,
  responses: PreOvidResponse[] = [],
  evidences: PreOvidEvidence[] = []
) {
  try {
    // Insert main inspection
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('pre_ovid_inspections')
      .insert([
        {
          vessel_id: inspection.vessel_id,
          inspector_id: inspection.inspector_id,
          inspection_date: inspection.inspection_date || new Date().toISOString(),
          status: inspection.status || 'draft',
          risk_rating: inspection.risk_rating,
          notes: inspection.notes,
          location: inspection.location,
          checklist_version: inspection.checklist_version || 'ovid-v3',
        },
      ])
      .select('id')
      .single();

    if (inspectionError) {
      console.error('Error creating inspection:', inspectionError);
      return { error: inspectionError.message };
    }

    const inspectionId = inspectionData.id;

    // Insert responses if provided
    if (responses.length > 0) {
      const responsesData = responses.map((r) => ({
        inspection_id: inspectionId,
        section: r.section,
        question_number: r.question_number,
        question_text: r.question_text,
        response: r.response,
        comments: r.comments || '',
        non_conformity: r.non_conformity || false,
        ai_suggestion: r.ai_suggestion || null,
        ai_risk_analysis: r.ai_risk_analysis || null,
      }));

      const { error: responsesError } = await supabase
        .from('pre_ovid_responses')
        .insert(responsesData);

      if (responsesError) {
        console.error('Error inserting responses:', responsesError);
      }
    }

    // Insert evidences if provided
    if (evidences.length > 0) {
      const evidencesData = evidences.map((e) => ({
        inspection_id: inspectionId,
        filename: e.filename,
        file_url: e.file_url,
        uploaded_by: inspection.inspector_id,
        related_section: e.related_section || null,
        file_type: e.file_type,
        file_size: e.file_size,
      }));

      const { error: evidencesError } = await supabase
        .from('pre_ovid_evidences')
        .insert(evidencesData);

      if (evidencesError) {
        console.error('Error inserting evidences:', evidencesError);
      }
    }

    return { inspectionId, data: inspectionData };
  } catch (error) {
    console.error('Error in createInspection:', error);
    return { error: 'Failed to create inspection' };
  }
}

/**
 * Get inspection by ID with all related data
 */
export async function getInspectionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('pre_ovid_inspections')
      .select(
        `
        *,
        responses:pre_ovid_responses(*),
        evidences:pre_ovid_evidences(*),
        ai_reports:pre_ovid_ai_reports(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching inspection:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Error in getInspectionById:', error);
    return { error: 'Failed to fetch inspection' };
  }
}

/**
 * Get all inspections for current user
 */
export async function getInspections(filters?: {
  vessel_id?: string;
  status?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('pre_ovid_inspections')
      .select(
        `
        *,
        vessel:vessels(name),
        inspector:profiles(full_name)
      `
      )
      .order('created_at', { ascending: false });

    if (filters?.vessel_id) {
      query = query.eq('vessel_id', filters.vessel_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inspections:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Error in getInspections:', error);
    return { error: 'Failed to fetch inspections' };
  }
}

/**
 * Update inspection status
 */
export async function updateInspectionStatus(
  id: string,
  status: 'draft' | 'submitted' | 'reviewed'
) {
  try {
    const { data, error } = await supabase
      .from('pre_ovid_inspections')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inspection status:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Error in updateInspectionStatus:', error);
    return { error: 'Failed to update inspection status' };
  }
}

/**
 * Generate AI report for an inspection
 */
export async function generateAIReport(
  inspectionId: string,
  inspectorId: string
) {
  try {
    // Fetch inspection data with responses
    const inspectionResult = await getInspectionById(inspectionId);

    if (inspectionResult.error || !inspectionResult.data) {
      return { error: 'Failed to fetch inspection data' };
    }

    const inspection = inspectionResult.data;

    // Generate AI analysis (placeholder - integrate with actual LLM)
    const summary = generateSummary(inspection);
    const criticalFindings = identifyCriticalFindings(inspection);
    const suggestedPlan = generateActionPlan(inspection);
    const riskScore = calculateRiskScore(inspection);
    const complianceScore = calculateComplianceScore(inspection);

    // Save AI report
    const { data, error } = await supabase
      .from('pre_ovid_ai_reports')
      .insert([
        {
          inspection_id: inspectionId,
          summary,
          critical_findings: criticalFindings,
          suggested_plan: suggestedPlan,
          risk_score: riskScore,
          compliance_score: complianceScore,
          created_by: inspectorId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating AI report:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error('Error in generateAIReport:', error);
    return { error: 'Failed to generate AI report' };
  }
}

// Helper functions for AI analysis (placeholders)
function generateSummary(inspection: any): string {
  const responseCount = inspection.responses?.length || 0;
  const nonConformities =
    inspection.responses?.filter((r: any) => r.non_conformity).length || 0;

  return `Inspeção realizada em ${new Date(
    inspection.inspection_date
  ).toLocaleDateString('pt-BR')} com ${responseCount} itens verificados. ${nonConformities} não conformidades identificadas. Status: ${inspection.status}.`;
}

function identifyCriticalFindings(inspection: any): string {
  const criticalItems =
    inspection.responses?.filter((r: any) => r.non_conformity) || [];

  if (criticalItems.length === 0) {
    return 'Nenhuma não conformidade crítica identificada.';
  }

  return criticalItems
    .map((item: any, idx: number) => {
      return `${idx + 1}. ${item.section} - Q${item.question_number}: ${
        item.question_text
      }`;
    })
    .join('\n');
}

function generateActionPlan(inspection: any): string {
  const nonConformities =
    inspection.responses?.filter((r: any) => r.non_conformity) || [];

  if (nonConformities.length === 0) {
    return 'Nenhuma ação corretiva necessária. Manter padrão de conformidade.';
  }

  return `Plano de ação recomendado:\n\n${nonConformities
    .map((item: any, idx: number) => {
      return `Ação ${idx + 1}: Corrigir ${item.section} - ${
        item.question_text
      }\nPrazo sugerido: 30 dias\nResponsável: A definir`;
    })
    .join('\n\n')}`;
}

function calculateRiskScore(inspection: any): number {
  const responses = inspection.responses || [];
  if (responses.length === 0) return 0;

  const nonConformities = responses.filter(
    (r: any) => r.non_conformity
  ).length;
  return Math.round((nonConformities / responses.length) * 100);
}

function calculateComplianceScore(inspection: any): number {
  return 100 - calculateRiskScore(inspection);
}
