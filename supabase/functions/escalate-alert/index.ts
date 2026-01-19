import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

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

    const { alert_id, escalate_to, reason, new_severity } = await req.json();

    if (!alert_id || !escalate_to) {
      return errorResponse('Alert ID and escalation target are required', 400);
    }

    // Get current alert
    const { data: currentAlert, error: getError } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', alert_id)
      .single();

    if (getError || !currentAlert) {
      return errorResponse('Alert not found', 404);
    }

    // Update alert with escalation
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'escalated',
        severity: new_severity || currentAlert.severity,
        escalated_to: escalate_to,
        escalated_by: user.id,
        escalated_at: new Date().toISOString(),
        escalation_reason: reason,
        escalation_count: (currentAlert.escalation_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', alert_id)
      .select()
      .single();

    if (error) {
      log('error', 'escalate-alert', 'Failed to escalate alert', { error: error.message });
      return errorResponse('Failed to escalate alert', 500);
    }

    // Create escalation record
    await supabase.from('alert_escalations').insert({
      alert_id,
      escalated_from: user.id,
      escalated_to: escalate_to,
      reason,
      previous_severity: currentAlert.severity,
      new_severity: new_severity || currentAlert.severity,
      escalated_at: new Date().toISOString()
    });

    // Notify escalation target
    await supabase.from('notifications').insert({
      user_id: escalate_to,
      title: `Alert Escalated: ${currentAlert.title}`,
      message: reason || 'An alert has been escalated to you for review.',
      type: 'alert_escalation',
      reference_id: alert_id,
      priority: 'high',
      created_at: new Date().toISOString()
    });

    log('info', 'escalate-alert', 'Alert escalated successfully', { alertId: alert_id, escalatedTo: escalate_to });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'escalate-alert', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
