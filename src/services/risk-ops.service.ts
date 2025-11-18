// @ts-nocheck
// PATCH 600: Risk Operations Service
import { supabase } from '@/integrations/supabase/client';
import type {
  RiskOperation,
  RiskAssessment,
  RiskStatistics,
  RiskHeatmapCell,
  RiskExportData,
} from '@/types/risk-ops';

export class RiskOpsService {
  /**
   * Get all risks with optional filtering
   */
  static async getRisks(vesselId?: string, module?: string): Promise<RiskOperation[]> {
    let query = supabase
      .from('risk_operations')
      .select('*')
      .order('risk_score', { ascending: false });

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }
    if (module) {
      query = query.eq('module', module);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risks:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new risk
   */
  static async createRisk(risk: Partial<RiskOperation>): Promise<RiskOperation> {
    const { data, error } = await supabase
      .from('risk_operations')
      .insert(risk)
      .select()
      .single();

    if (error) {
      console.error('Error creating risk:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a risk
   */
  static async updateRisk(id: string, updates: Partial<RiskOperation>): Promise<RiskOperation> {
    const { data, error } = await supabase
      .from('risk_operations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a risk
   */
  static async deleteRisk(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_operations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting risk:', error);
      throw error;
    }
  }

  /**
   * Get risk assessments
   */
  static async getRiskAssessments(riskId: string): Promise<RiskAssessment[]> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('risk_id', riskId)
      .order('assessment_date', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create risk assessment
   */
  static async createRiskAssessment(
    assessment: Partial<RiskAssessment>
  ): Promise<RiskAssessment> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get risk statistics
   */
  static async getRiskStatistics(
    vesselId?: string,
    module?: string
  ): Promise<RiskStatistics> {
    const { data, error } = await supabase.rpc('get_risk_statistics', {
      p_vessel_id: vesselId || null,
      p_module: module || null,
    });

    if (error) {
      console.error('Error fetching risk statistics:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get risk heatmap data
   */
  static async getRiskHeatmap(vesselId?: string): Promise<RiskHeatmapCell[]> {
    const { data, error } = await supabase.rpc('get_risk_heatmap', {
      p_vessel_id: vesselId || null,
    });

    if (error) {
      console.error('Error fetching risk heatmap:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Export risks to JSON
   */
  static async exportToJSON(vesselId?: string, module?: string): Promise<string> {
    const [risks, statistics] = await Promise.all([
      this.getRisks(vesselId, module),
      this.getRiskStatistics(vesselId, module),
    ]);

    const exportData: RiskExportData = {
      risks,
      statistics,
      generated_at: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export risks to CSV
   */
  static async exportToCSV(vesselId?: string, module?: string): Promise<string> {
    const risks = await this.getRisks(vesselId, module);

    let csv = 'ID,Title,Type,Module,Severity,Likelihood,Risk Score,Status,Created At\n';

    risks.forEach(risk => {
      csv += `${risk.id},${risk.title},${risk.risk_type},${risk.module},${risk.severity},${risk.likelihood},${risk.risk_score},${risk.status},${new Date(risk.created_at).toLocaleDateString()}\n`;
    });

    return csv;
  }

  /**
   * Calculate risk score
   */
  static calculateRiskScore(severity: string, likelihood: string): number {
    const severityWeight = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    }[severity] || 2;

    const likelihoodWeight = {
      unlikely: 1,
      possible: 2,
      likely: 3,
      almost_certain: 4,
    }[likelihood] || 2;

    return severityWeight * likelihoodWeight * 6.25;
  }
}
