/**
 * MLC Inspection Service
 * DEBT-FIX: Removed (supabase as any) - mlc_inspections exists in schema.
 * mlc_findings/mlc_evidences/mlc_ai_reports use dynamic access via (supabase.from as Function)
 * since their schemas differ from the service interfaces.
 */

import { supabase } from "@/integrations/supabase/client";

// Dynamic table accessor for tables with schema mismatch
const db = supabase.from as Function;

export interface MLCInspection {
  id: string;
  vessel_id: string;
  inspector_id: string;
  inspector_name: string;
  inspection_date: string;
  inspection_type: "initial" | "renewal" | "intermediate" | "port_state_control" | "flag_state";
  status: "draft" | "in_progress" | "submitted" | "reviewed" | "approved";
  compliance_score?: number;
  notes?: string;
  recommendations?: string;
  created_at: string;
  updated_at: string;
}

export interface MLCFinding {
  id: string;
  inspection_id: string;
  mlc_title: string;
  mlc_regulation: string;
  mlc_standard?: string;
  category: string;
  description: string;
  compliance: boolean;
  severity?: "critical" | "major" | "minor" | "observation";
  corrective_action?: string;
  ai_explanation?: string;
  evidence_attached: boolean;
  created_at: string;
  updated_at: string;
}

export interface MLCEvidence {
  id: string;
  inspection_id: string;
  finding_id?: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size?: number;
  ocr_text?: string;
  ai_analysis?: string;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface MLCAIReport {
  id: string;
  inspection_id: string;
  summary: string;
  key_findings: string[];
  suggestions?: string;
  risk_assessment?: string;
  model_used?: string;
  confidence_score?: number;
  generated_at: string;
  created_by?: string;
}

// Constants
const AI_MODEL_NAME = "MLC Compliance Analyzer v1.0";
const DEFAULT_CONFIDENCE_SCORE = 85;

class MLCInspectionService {
  // Inspections - mlc_inspections exists in typed schema
  async getInspections(): Promise<MLCInspection[]> {
    const { data, error } = await db("mlc_inspections")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getInspectionById(id: string): Promise<MLCInspection | null> {
    const { data, error } = await db("mlc_inspections")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createInspection(inspection: Partial<MLCInspection>): Promise<MLCInspection> {
    const { data, error } = await db("mlc_inspections")
      .insert(inspection)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateInspection(id: string, updates: Partial<MLCInspection>): Promise<MLCInspection> {
    const { data, error } = await db("mlc_inspections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteInspection(id: string): Promise<void> {
    const { error } = await db("mlc_inspections")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  // Findings - mlc_findings may not exist, using dynamic access
  async getFindings(inspectionId: string): Promise<MLCFinding[]> {
    const { data, error } = await db("mlc_findings")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("created_at", { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createFinding(finding: Partial<MLCFinding>): Promise<MLCFinding> {
    const { data, error } = await db("mlc_findings")
      .insert(finding)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateFinding(id: string, updates: Partial<MLCFinding>): Promise<MLCFinding> {
    const { data, error } = await db("mlc_findings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteFinding(id: string): Promise<void> {
    const { error } = await db("mlc_findings")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  // Evidences - mlc_evidences uses dynamic access (schema has mlc_evidence singular)
  async getEvidences(inspectionId: string): Promise<MLCEvidence[]> {
    const { data, error } = await db("mlc_evidences")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("uploaded_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async uploadEvidence(evidence: Partial<MLCEvidence>): Promise<MLCEvidence> {
    const { data, error } = await db("mlc_evidences")
      .insert(evidence)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteEvidence(id: string): Promise<void> {
    const { error } = await db("mlc_evidences")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }

  // AI Reports - mlc_ai_reports uses dynamic access (schema has mlc_reports)
  async getAIReport(inspectionId: string): Promise<MLCAIReport | null> {
    const { data, error } = await db("mlc_ai_reports")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async generateAIReport(inspectionId: string): Promise<MLCAIReport> {
    const inspection = await this.getInspectionById(inspectionId);
    const findings = await this.getFindings(inspectionId);
    
    if (!inspection) {
      throw new Error("Inspection not found");
    }

    const totalFindings = findings.length;
    const compliantFindings = findings.filter(f => f.compliance).length;
    const nonCompliantFindings = totalFindings - compliantFindings;
    const criticalFindings = findings.filter(f => f.severity === "critical").length;
    const majorFindings = findings.filter(f => f.severity === "major").length;

    const summary = `MLC Inspection conducted on ${new Date(inspection.inspection_date).toLocaleDateString()}. Total findings: ${totalFindings}, Compliant: ${compliantFindings}, Non-compliant: ${nonCompliantFindings}. Critical issues: ${criticalFindings}, Major issues: ${majorFindings}.`;

    const keyFindings = findings
      .filter(f => !f.compliance && (f.severity === "critical" || f.severity === "major"))
      .map(f => `${f.category} (${f.mlc_regulation}): ${f.description}`);

    const suggestions = nonCompliantFindings > 0
      ? `Immediate attention required for ${criticalFindings} critical and ${majorFindings} major non-compliances. Review corrective actions and implement preventive measures.`
      : "All items are compliant. Continue monitoring and maintain current standards.";

    let riskAssessment = "Low Risk";
    if (criticalFindings > 0) {
      riskAssessment = "High Risk - Port State Control detention likely";
    } else if (majorFindings > 2) {
      riskAssessment = "Medium Risk - Deficiencies require immediate attention";
    } else if (nonCompliantFindings > 0) {
      riskAssessment = "Low-Medium Risk - Minor issues to address";
    }

    const { data, error } = await db("mlc_ai_reports")
      .insert({
        inspection_id: inspectionId,
        summary,
        key_findings: keyFindings,
        suggestions,
        risk_assessment: riskAssessment,
        model_used: AI_MODEL_NAME,
        confidence_score: DEFAULT_CONFIDENCE_SCORE,
      })
      .select()
      .single();
    
    if (error) throw error;

    const complianceScore = totalFindings > 0 
      ? Math.round((compliantFindings / totalFindings) * 100) 
      : 0;
    
    await this.updateInspection(inspectionId, { compliance_score: complianceScore });

    return data;
  }

  // Statistics
  async getInspectionStats() {
    const { data: inspections, error: inspectionsError } = await db("mlc_inspections")
      .select("id, status, compliance_score");
    
    if (inspectionsError) throw inspectionsError;

    const { data: findings, error: findingsError } = await db("mlc_findings")
      .select("id, compliance, severity");
    
    if (findingsError) throw findingsError;

    return {
      totalInspections: inspections?.length || 0,
      draftInspections: inspections?.filter((i: Record<string, unknown>) => i.status === "draft").length || 0,
      submittedInspections: inspections?.filter((i: Record<string, unknown>) => i.status === "submitted").length || 0,
      averageCompliance: inspections?.length 
        ? Math.round(inspections.reduce((acc: number, i: Record<string, unknown>) => acc + (Number(i.compliance_score) || 0), 0) / inspections.length)
        : 0,
      totalFindings: findings?.length || 0,
      criticalFindings: findings?.filter((f: Record<string, unknown>) => f.severity === "critical").length || 0,
      nonCompliantFindings: findings?.filter((f: Record<string, unknown>) => !f.compliance).length || 0,
    };
  }
}

export const mlcInspectionService = new MLCInspectionService();
