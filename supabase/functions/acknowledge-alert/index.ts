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

    const { alert_id, notes } = await req.json();

    if (!alert_id) {
      return errorResponse('Alert ID is required', 400);
    }

    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
        acknowledgement_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', alert_id)
      .select()
      .single();

    if (error) {
      log('error', 'acknowledge-alert', 'Failed to acknowledge alert', { error: error.message });
      return errorResponse('Failed to acknowledge alert', 500);
    }

    log('info', 'acknowledge-alert', 'Alert acknowledged successfully', { alertId: alert_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'acknowledge-alert', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
