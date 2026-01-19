import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface PredictionResult {
  equipment_id: string;
  equipment_name: string;
  failure_probability: number;
  predicted_failure_date: string;
  confidence: number;
  recommended_action: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface Equipment {
  id: string;
  name: string;
  equipment_type?: string;
  last_maintenance_date?: string;
  maintenance_interval_days?: number;
  operating_hours?: number;
  mmi_maintenance_jobs?: Array<{ id: string; status: string; completed_at?: string; maintenance_type?: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { vessel_id, equipment_id } = await req.json();

    // Get equipment with maintenance history
    let query = supabase
      .from('mmi_equipment')
      .select(`
        id,
        name,
        equipment_type,
        last_maintenance_date,
        maintenance_interval_days,
        operating_hours,
        mmi_maintenance_jobs(
          id,
          status,
          completed_at,
          maintenance_type
        )
      `);

    if (vessel_id) query = query.eq('vessel_id', vessel_id);
    if (equipment_id) query = query.eq('id', equipment_id);

    const { data: equipment, error } = await query;

    if (error) {
      return errorResponse('Failed to fetch equipment data', 500);
    }

    // Calculate predictions for each equipment
    const predictions: PredictionResult[] = ((equipment || []) as Equipment[]).map((eq) => {
      const maintenanceJobs = eq.mmi_maintenance_jobs || [];
      const completedJobs = maintenanceJobs.filter((j) => j.status === 'completed');
      
      // Simple prediction based on maintenance history and operating hours
      const daysSinceLastMaintenance = eq.last_maintenance_date
        ? Math.floor((Date.now() - new Date(eq.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const intervalDays = eq.maintenance_interval_days || 90;
      const overdueFactor = daysSinceLastMaintenance / intervalDays;
      
      // Calculate failure probability (simplified model)
      let failureProbability = Math.min(0.95, overdueFactor * 0.3);
      if ((eq.operating_hours || 0) > 10000) failureProbability += 0.1;
      if (completedJobs.length < 3) failureProbability += 0.1;
      
      failureProbability = Math.min(0.95, Math.max(0.05, failureProbability));

      const urgency: 'low' | 'medium' | 'high' | 'critical' = failureProbability > 0.7 ? 'critical' 
        : failureProbability > 0.5 ? 'high'
        : failureProbability > 0.3 ? 'medium' : 'low';

      const predictedFailureDays = Math.max(1, Math.round((1 - failureProbability) * intervalDays));
      const predictedFailureDate = new Date(Date.now() + predictedFailureDays * 24 * 60 * 60 * 1000);

      return {
        equipment_id: eq.id,
        equipment_name: eq.name,
        failure_probability: Math.round(failureProbability * 100) / 100,
        predicted_failure_date: predictedFailureDate.toISOString(),
        confidence: 0.75, // Would come from actual ML model
        recommended_action: urgency === 'critical' ? 'Immediate maintenance required'
          : urgency === 'high' ? 'Schedule maintenance within 7 days'
          : urgency === 'medium' ? 'Plan maintenance within 30 days'
          : 'Continue monitoring',
        urgency
      };
    });

    // Sort by failure probability (highest first)
    predictions.sort((a, b) => b.failure_probability - a.failure_probability);

    // Create alerts for high-risk equipment
    const highRiskEquipment = predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high');
    
    for (const pred of highRiskEquipment) {
      await supabase.from('predictive_maintenance_logs').insert({
        equipment_id: pred.equipment_id,
        prediction_type: 'failure_risk',
        risk_score: pred.failure_probability,
        confidence_score: pred.confidence,
        prediction_details: pred,
        recommended_action: pred.recommended_action
      });
    }

    log('info', 'predictive-maintenance', 'Predictions generated', {
      userId: user.id,
      vesselId: vessel_id,
      totalEquipment: predictions.length,
      highRisk: highRiskEquipment.length
    });

    return jsonResponse({
      success: true,
      data: {
        predictions,
        summary: {
          total: predictions.length,
          critical: predictions.filter(p => p.urgency === 'critical').length,
          high: predictions.filter(p => p.urgency === 'high').length,
          medium: predictions.filter(p => p.urgency === 'medium').length,
          low: predictions.filter(p => p.urgency === 'low').length
        }
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'predictive-maintenance', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
