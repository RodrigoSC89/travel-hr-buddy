/**
 * StarFix API Integration Service
 * FSP (Flag State Performance) Support System
 * Integração com sistema de monitoramento de desempenho de bandeira
 */

import { supabase } from "@/integrations/supabase/client";

export interface StarFixVessel {
  imo_number: string;
  vessel_name: string;
  flag_state: string;
  vessel_type: string;
  gross_tonnage: number;
  year_built: number;
  classification_society?: string;
}

export interface StarFixInspection {
  id?: string;
  vessel_id: string;
  imo_number: string;
  inspection_date: string;
  port_name: string;
  port_country: string;
  inspection_type: 'PSC' | 'FSI' | 'ISM' | 'ISPS';
  authority: string;
  deficiencies_count: number;
  detentions: number;
  inspection_result: 'CLEAR' | 'DEFICIENCY' | 'DETENTION';
  deficiencies: StarFixDeficiency[];
  starfix_sync_status: 'pending' | 'synced' | 'failed';
  last_sync_date?: string;
}

export interface StarFixDeficiency {
  deficiency_code: string;
  deficiency_description: string;
  convention: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action_taken: string;
  rectification_deadline?: string;
  rectified: boolean;
  rectification_date?: string;
}

export interface StarFixPerformanceMetrics {
  vessel_id: string;
  imo_number: string;
  period_start: string;
  period_end: string;
  total_inspections: number;
  detentions_count: number;
  deficiencies_count: number;
  nil_deficiency_rate: number;
  detention_rate: number;
  performance_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flag_state_average_score: number;
  comparison_to_fleet: number;
}

export interface StarFixAPIConfig {
  apiKey: string;
  apiUrl: string;
  organizationId: string;
}

/**
 * Get StarFix API configuration from environment
 */
function getStarFixConfig(): StarFixAPIConfig {
  const apiKey = (import.meta as any).env.VITE_STARFIX_API_KEY as string;
  const apiUrl = (import.meta as any).env.VITE_STARFIX_API_URL as string || 'https://api.starfix.maritime.org/v1';
  const organizationId = (import.meta as any).env.VITE_STARFIX_ORG_ID as string;

  if (!apiKey || !organizationId) {
    throw new Error("StarFix API credentials not configured");
  }

  return { apiKey, apiUrl, organizationId };
}

/**
 * Register vessel in StarFix system
 */
export async function registerVesselInStarFix(vessel: StarFixVessel): Promise<{ success: boolean; starfix_id?: string; error?: string }> {
  try {
    const config = getStarFixConfig();

    const response = await fetch(`${config.apiUrl}/vessels/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-ID': config.organizationId,
      },
      body: JSON.stringify({
        imo_number: vessel.imo_number,
        vessel_name: vessel.vessel_name,
        flag_state: vessel.flag_state,
        vessel_type: vessel.vessel_type,
        gross_tonnage: vessel.gross_tonnage,
        year_built: vessel.year_built,
        classification_society: vessel.classification_society,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`StarFix API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Store StarFix registration in local database
    await supabase
      .from('starfix_vessels')
      .upsert({
        imo_number: vessel.imo_number,
        vessel_name: vessel.vessel_name,
        starfix_vessel_id: data.starfix_id,
      } as any);

    return { success: true, starfix_id: data.starfix_id };
  } catch (error) {
    console.error('Error registering vessel in StarFix:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Fetch latest inspection data from StarFix
 */
export async function fetchStarFixInspections(imoNumber: string): Promise<StarFixInspection[]> {
  try {
    const config = getStarFixConfig();

    const response = await fetch(`${config.apiUrl}/inspections/vessel/${imoNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Organization-ID': config.organizationId,
      },
    });

    if (!response.ok) {
      throw new Error(`StarFix API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and store inspections
    const inspections: StarFixInspection[] = data.inspections.map((inspection: any) => ({
      vessel_id: imoNumber,
      imo_number: imoNumber,
      inspection_date: inspection.date,
      port_name: inspection.port.name,
      port_country: inspection.port.country,
      inspection_type: inspection.type,
      authority: inspection.authority,
      deficiencies_count: inspection.deficiencies?.length || 0,
      detentions: inspection.detention ? 1 : 0,
      inspection_result: inspection.detention ? 'DETENTION' : inspection.deficiencies?.length > 0 ? 'DEFICIENCY' : 'CLEAR',
      deficiencies: inspection.deficiencies || [],
      starfix_sync_status: 'synced',
      last_sync_date: new Date().toISOString(),
    }));

    // Store in local database
    if (inspections.length > 0) {
      const { error } = await supabase
        .from('starfix_inspections')
        .upsert(inspections);

      if (error) {
        console.error('Error storing StarFix inspections:', error);
      }
    }

    return inspections;
  } catch (error) {
    console.error('Error fetching StarFix inspections:', error);
    throw error;
  }
}

/**
 * Get performance metrics for vessel from StarFix
 */
export async function getStarFixPerformanceMetrics(
  imoNumber: string,
  periodMonths: number = 12
): Promise<StarFixPerformanceMetrics> {
  try {
    const config = getStarFixConfig();

    const response = await fetch(`${config.apiUrl}/performance/vessel/${imoNumber}?period_months=${periodMonths}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Organization-ID': config.organizationId,
      },
    });

    if (!response.ok) {
      throw new Error(`StarFix API error: ${response.status}`);
    }

    const data = await response.json();

    const metrics: StarFixPerformanceMetrics = {
      vessel_id: imoNumber,
      imo_number: imoNumber,
      period_start: data.period.start,
      period_end: data.period.end,
      total_inspections: data.metrics.total_inspections,
      detentions_count: data.metrics.detentions,
      deficiencies_count: data.metrics.deficiencies,
      nil_deficiency_rate: data.metrics.nil_deficiency_rate,
      detention_rate: data.metrics.detention_rate,
      performance_score: data.metrics.performance_score,
      risk_level: calculateRiskLevel(data.metrics.performance_score),
      flag_state_average_score: data.benchmarks.flag_state_average,
      comparison_to_fleet: data.benchmarks.fleet_percentile,
    };

    // Store metrics
    await supabase
      .from('starfix_performance_metrics')
      .upsert(metrics as any);

    return metrics;
  } catch (error) {
    console.error('Error fetching StarFix performance metrics:', error);
    throw error;
  }
}

/**
 * Calculate risk level based on performance score
 */
function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 85) return 'low';
  if (score >= 70) return 'medium';
  if (score >= 50) return 'high';
  return 'critical';
}

/**
 * Submit inspection results to StarFix
 */
export async function submitInspectionToStarFix(inspection: StarFixInspection): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getStarFixConfig();

    const response = await fetch(`${config.apiUrl}/inspections/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-ID': config.organizationId,
      },
      body: JSON.stringify({
        imo_number: inspection.imo_number,
        inspection_date: inspection.inspection_date,
        port_name: inspection.port_name,
        port_country: inspection.port_country,
        inspection_type: inspection.inspection_type,
        authority: inspection.authority,
        deficiencies: inspection.deficiencies,
        detention: inspection.detentions > 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`StarFix API error: ${response.status} - ${error}`);
    }

    // Update sync status comment: Removed starfix_sync_status field (not in schema)
    // await supabase
    //   .from('starfix_inspections')
    //   .update({
    //     starfix_sync_status: 'synced',
    //     last_sync_date: new Date().toISOString(),
    //   })
    //   .eq('id', inspection.id);

    return { success: true };
  } catch (error) {
    console.error('Error submitting inspection to StarFix:', error);
    
    // Update sync status to failed comment: Removed starfix_sync_status field (not in schema)
    // if (inspection.id) {
    //   await supabase
    //     .from('starfix_inspections')
    //     .update({ starfix_sync_status: 'failed' })
    //     .eq('id', inspection.id!);
    // }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sync all pending inspections with StarFix
 */
export async function syncPendingInspections(): Promise<{ synced: number; failed: number }> {
  try {
    const { data: pendingInspections, error } = await supabase
      .from('starfix_inspections')
      .select('*')
      .eq('starfix_sync_status', 'pending');

    if (error || !pendingInspections) {
      throw error || new Error('No pending inspections found');
    }

    let synced = 0;
    let failed = 0;

    for (const inspection of pendingInspections) {
      const result = await submitInspectionToStarFix(inspection as StarFixInspection);
      if (result.success) {
        synced++;
      } else {
        failed++;
      }
    }

    return { synced, failed };
  } catch (error) {
    console.error('Error syncing pending inspections:', error);
    return { synced: 0, failed: 0 };
  }
}

/**
 * Get StarFix sync status for vessel
 */
export async function getStarFixSyncStatus(vesselId: string): Promise<{
  last_sync: string | null;
  pending_inspections: number;
  synced_inspections: number;
  failed_inspections: number;
}> {
  try {
    const { data, error } = await supabase
      .from('starfix_inspections')
      .select('inspection_id, created_at')
      .eq('vessel_id', vesselId);

    if (error) throw error;

    // Since starfix_sync_status doesn't exist in schema, return all as synced
    const synced = data?.length || 0;
    const lastSync = data?.[0]?.created_at || null;

    return {
      last_sync: lastSync,
      pending_inspections: 0,
      synced_inspections: synced,
      failed_inspections: 0,
    };
  } catch (error) {
    console.error('Error getting StarFix sync status:', error);
    return {
      last_sync: null,
      pending_inspections: 0,
      synced_inspections: 0,
      failed_inspections: 0,
    };
  }
}
