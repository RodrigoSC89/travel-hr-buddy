/**
 * PATCH 600: Risk Operations Service
 * Maps to risk_assessments table (exists in schema)
 * Schema columns: risk_title, risk_type, risk_level, risk_score, risk_description,
 *   module_type, status, vessel_id, affected_areas, mitigation_actions, ai_classification
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
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
      .from('risk_assessments')
      .select('*')
      .order('risk_score', { ascending: false });

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }
    if (module) {
      query = query.eq('module_type', module);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching risks', error as Error, { vesselId, module });
      throw error;
    }

    return (data || []).map(d => ({
      id: d.id,
      title: d.risk_title,
      description: d.risk_description,
      risk_type: d.risk_type as RiskOperation['risk_type'],
      module: d.module_type,
      vessel_id: d.vessel_id,
      severity: d.risk_level as RiskOperation['severity'],
      likelihood: 'possible' as RiskOperation['likelihood'],
      risk_score: d.risk_score,
      status: (d.status || 'open') as RiskOperation['status'],
      mitigation_plan: null,
      assigned_to: null,
      created_by: null,
      created_at: d.created_at || new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString(),
      resolved_at: null,
      metadata: {},
    }));
  }

  /**
   * Create a new risk
   */
  static async createRisk(risk: Partial<RiskOperation>): Promise<RiskOperation> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert({
        risk_title: risk.title || 'Untitled Risk',
        risk_type: risk.risk_type || 'operational',
        risk_level: risk.severity || 'medium',
        risk_score: risk.risk_score || 0,
        risk_description: risk.description || null,
        module_type: risk.module || 'general',
        status: risk.status || 'open',
        vessel_id: risk.vessel_id || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating risk', error as Error, { riskTitle: risk.title });
      throw error;
    }

    return {
      id: data.id,
      title: data.risk_title,
      description: data.risk_description,
      risk_type: data.risk_type as RiskOperation['risk_type'],
      module: data.module_type,
      vessel_id: data.vessel_id,
      severity: data.risk_level as RiskOperation['severity'],
      likelihood: 'possible',
      risk_score: data.risk_score,
      status: (data.status || 'open') as RiskOperation['status'],
      mitigation_plan: null,
      assigned_to: null,
      created_by: null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      resolved_at: null,
      metadata: {},
    };
  }

  /**
   * Update a risk
   */
  static async updateRisk(id: string, updates: Partial<RiskOperation>): Promise<RiskOperation> {
    const updateData: Record<string, unknown> = {};
    if (updates.risk_score !== undefined) updateData.risk_score = updates.risk_score;
    if (updates.severity) updateData.risk_level = updates.severity;
    if (updates.status) updateData.status = updates.status;
    if (updates.title) updateData.risk_title = updates.title;
    if (updates.description !== undefined) updateData.risk_description = updates.description;

    const { data, error } = await supabase
      .from('risk_assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating risk', error as Error, { riskId: id });
      throw error;
    }

    return {
      id: data.id,
      title: data.risk_title,
      description: data.risk_description,
      risk_type: data.risk_type as RiskOperation['risk_type'],
      module: data.module_type,
      vessel_id: data.vessel_id,
      severity: data.risk_level as RiskOperation['severity'],
      likelihood: 'possible',
      risk_score: data.risk_score,
      status: (data.status || 'open') as RiskOperation['status'],
      mitigation_plan: null,
      assigned_to: null,
      created_by: null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      resolved_at: null,
      metadata: {},
    };
  }

  /**
   * Delete a risk
   */
  static async deleteRisk(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_assessments')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting risk', error as Error, { riskId: id });
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
      .eq('id', riskId);

    if (error) {
      logger.error('Error fetching assessments', error as Error, { riskId });
      throw error;
    }

    return (data || []).map(d => ({
      id: d.id,
      risk_id: d.id,
      assessment_date: d.assessed_at || d.created_at || new Date().toISOString(),
      assessor_id: null,
      severity: d.risk_level as RiskAssessment['severity'],
      likelihood: 'possible' as RiskAssessment['likelihood'],
      risk_score: d.risk_score,
      comments: d.risk_description,
      ai_analysis: {},
      created_at: d.created_at || new Date().toISOString(),
    }));
  }

  /**
   * Create risk assessment
   */
  static async createRiskAssessment(
    assessment: Partial<RiskAssessment>
  ): Promise<RiskAssessment> {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert({
        risk_title: 'Assessment',
        risk_type: 'operational',
        risk_level: assessment.severity || 'medium',
        risk_score: assessment.risk_score || 0,
        module_type: 'general',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating assessment', error as Error);
      throw error;
    }

    return {
      id: data.id,
      risk_id: data.id,
      assessment_date: data.assessed_at || data.created_at || new Date().toISOString(),
      assessor_id: null,
      severity: data.risk_level as RiskAssessment['severity'],
      likelihood: 'possible',
      risk_score: data.risk_score,
      comments: data.risk_description,
      ai_analysis: {},
      created_at: data.created_at || new Date().toISOString(),
    };
  }

  /**
   * Get risk statistics
   */
  static async getRiskStatistics(
    vesselId?: string,
    _module?: string
  ): Promise<RiskStatistics> {
    let query = supabase
      .from('risk_assessments')
      .select('id, risk_score, risk_level, risk_type, status, module_type');

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching risk statistics', error as Error, { vesselId });
      throw error;
    }

    const risks = data || [];
    const totalRisks = risks.length;
    const openRisks = risks.filter(r => r.status === 'open').length;
    const closedRisks = risks.filter(r => r.status === 'closed').length;
    const mitigatedRisks = risks.filter(r => r.status === 'mitigated').length;
    const criticalRisks = risks.filter(r => r.risk_level === 'critical').length;
    const highRisks = risks.filter(r => r.risk_level === 'high').length;
    const avgScore = totalRisks > 0
      ? risks.reduce((sum, r) => sum + (r.risk_score || 0), 0) / totalRisks
      : 0;

    // Build risks_by_type and risks_by_module
    const risksByType: Record<string, number> = {};
    const risksByModule: Record<string, number> = {};
    for (const r of risks) {
      risksByType[r.risk_type] = (risksByType[r.risk_type] || 0) + 1;
      risksByModule[r.module_type] = (risksByModule[r.module_type] || 0) + 1;
    }

    return {
      total_risks: totalRisks,
      open_risks: openRisks,
      closed_risks: closedRisks,
      mitigated_risks: mitigatedRisks,
      critical_risks: criticalRisks,
      high_risks: highRisks,
      average_risk_score: Math.round(avgScore * 10) / 10,
      risks_by_type: risksByType as Record<string, number>,
      risks_by_module: risksByModule,
    };
  }

  /**
   * Get risk heatmap data
   */
  static async getRiskHeatmap(vesselId?: string): Promise<RiskHeatmapCell[]> {
    let query = supabase
      .from('risk_assessments')
      .select('risk_level, risk_score');

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching risk heatmap', error as Error, { vesselId });
      throw error;
    }

    const heatmap: RiskHeatmapCell[] = [];
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const likelihoods = ['unlikely', 'possible', 'likely', 'almost_certain'] as const;

    for (const severity of severities) {
      for (const likelihood of likelihoods) {
        const matching = (data || []).filter(r => r.risk_level === severity);
        const count = matching.length;
        const avgScore = count > 0
          ? matching.reduce((s, r) => s + (r.risk_score || 0), 0) / count
          : 0;
        heatmap.push({
          severity,
          likelihood,
          count,
          avg_score: avgScore,
        });
      }
    }

    return heatmap;
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
