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

    const { equipment_id, maintenance_type, frequency, start_date, end_date, notes } = await req.json();

    if (!equipment_id || !maintenance_type || !frequency || !start_date) {
      return errorResponse('Equipment ID, maintenance type, frequency and start date are required', 400);
    }

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert({
        equipment_id,
        maintenance_type,
        frequency,
        start_date,
        end_date,
        notes,
        status: 'active',
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'schedule-maintenance', 'Failed to create schedule', { error: error.message });
      return errorResponse('Failed to schedule maintenance', 500);
    }

    log('info', 'schedule-maintenance', 'Maintenance scheduled successfully', { equipmentId: equipment_id, frequency });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'schedule-maintenance', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
