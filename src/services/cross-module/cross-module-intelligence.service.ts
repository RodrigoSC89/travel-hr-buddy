/**
 * Cross-Module Intelligence Service
 * Correlates data across all operational modules for unified insights
 */

import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';

export type CrossModuleAnalysisType = 'correlation' | 'predictive_alerts' | 'fleet_optimization' | 'unified_analytics';

export interface CrossModuleResult {
  analysisType: CrossModuleAnalysisType;
  analysis: string;
  summary: {
    vesselCount: number;
    crewCount: number;
    maintenanceCount: number;
    inspectionCount: number;
    incidentCount: number;
  };
  generatedAt: string;
}

export interface PredictiveAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  modules: string[];
  vessel?: string;
  description: string;
  action: string;
  probability: number;
  deadline?: string;
}

export interface OperationalCorrelation {
  source: string;
  target: string;
  strength: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export class CrossModuleIntelligenceService {
  /**
   * Run cross-module analysis via Edge Function
   */
  async analyze(
    type: CrossModuleAnalysisType,
    vesselId?: string,
  ): Promise<CrossModuleResult> {
    const { data, error } = await supabase.functions.invoke('cross-module-intelligence', {
      body: { analysisType: type, vesselId },
    });

    if (error) throw error;
    return data as CrossModuleResult;
  }

  /**
   * Get operational health score across all modules for a vessel
   */
  async getVesselHealthScore(vesselId: string): Promise<{
    overall: number;
    maintenance: number;
    crew: number;
    compliance: number;
    safety: number;
    operations: number;
  }> {
    const [maintenance, crew, inspections, incidents] = await Promise.all([
      fromUntyped('maintenance_tasks').select('status, priority').eq('vessel_id', vesselId).then((r: { data: Record<string, unknown>[] | null }) => r.data || []),
      supabase.from('crew_members').select('status').eq('vessel_id', vesselId).then(r => r.data || []),
      supabase.from('psc_inspections').select('id, created_at').eq('vessel_id', vesselId).order('created_at', { ascending: false }).limit(5).then(r => r.data || []),
      supabase.from('safety_incidents').select('severity, status').eq('vessel_id', vesselId).order('created_at', { ascending: false }).limit(10).then(r => r.data || []),
    ]);

    type Row = Record<string, unknown>;
    const criticalMaint = (maintenance as Row[]).filter(j => j.priority === 'critical' && j.status !== 'completed').length;
    const maintenanceScore = Math.max(0, 100 - criticalMaint * 15);

    const crewItems = crew as Row[];
    const activeCrewRatio = crewItems.filter(c => c.status === 'active').length / Math.max(crewItems.length, 1);
    const crewScore = Math.round(activeCrewRatio * 100);

    const inspectionCount = inspections.length;
    const complianceScore = Math.max(0, Math.round(100 - (inspectionCount > 3 ? 20 : 0)));
    

    const incidentItems = incidents as Row[];
    const openIncidents = incidentItems.filter(i => i.status === 'open' || i.severity === 'critical').length;
    const safetyScore = Math.max(0, 100 - openIncidents * 10);

    const operationsScore = Math.round((maintenanceScore + crewScore + complianceScore + safetyScore) / 4);
    const overall = Math.round((maintenanceScore + crewScore + complianceScore + safetyScore + operationsScore) / 5);

    return { overall, maintenance: maintenanceScore, crew: crewScore, compliance: complianceScore, safety: safetyScore, operations: operationsScore };
  }

  /**
   * Get cross-module KPIs summary
   */
  async getUnifiedKPIs(): Promise<{
    totalVessels: number;
    activeVessels: number;
    totalCrew: number;
    openMaintenanceJobs: number;
    criticalAlerts: number;
    complianceRate: number;
    safetyScore: number;
    overallHealth: number;
  }> {
    const [vessels, crew, maintenance, incidents] = await Promise.all([
      supabase.from('vessels').select('id, status').then(r => r.data || []),
      supabase.from('crew_members').select('id, status').then(r => r.data || []),
      fromUntyped('maintenance_tasks').select('id, status, priority').then((r: { data: Record<string, unknown>[] | null }) => r.data || []),
      supabase.from('safety_incidents').select('id, severity, status').then(r => r.data || []),
    ]);

    type Row = Record<string, unknown>;
    const vesselData = vessels as Row[];
    const crewData = crew as Row[];
    const maintData = maintenance as Row[];
    const incidentData = incidents as Row[];

    const activeVessels = vesselData.filter(v => v.status === 'active' || v.status === 'operational').length;
    const openJobs = maintData.filter(j => j.status !== 'completed').length;
    const criticalAlerts = maintData.filter(j => j.priority === 'critical' && j.status !== 'completed').length +
      incidentData.filter(i => i.severity === 'critical' && i.status === 'open').length;

    const completedJobs = maintData.filter(j => j.status === 'completed').length;
    const complianceRate = Math.round((completedJobs / Math.max(maintData.length, 1)) * 100);

    const openSevere = incidentData.filter(i => (i.severity === 'critical' || i.severity === 'high') && i.status === 'open').length;
    const safetyScore = Math.max(0, 100 - openSevere * 10);

    const overallHealth = Math.round((complianceRate + safetyScore + (activeVessels / Math.max(vesselData.length, 1)) * 100) / 3);

    return {
      totalVessels: vesselData.length,
      activeVessels,
      totalCrew: crewData.length,
      openMaintenanceJobs: openJobs,
      criticalAlerts,
      complianceRate,
      safetyScore,
      overallHealth,
    };
  }
}

export const crossModuleIntelligence = new CrossModuleIntelligenceService();
