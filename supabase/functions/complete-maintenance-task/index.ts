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

    const { task_id, completion_notes, actual_cost, parts_used } = await req.json();

    if (!task_id) {
      return errorResponse('Task ID is required', 400);
    }

    const { data, error } = await supabase
      .from('maintenance_items')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString(),
        completion_notes,
        actual_cost,
        parts_used,
        completed_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', task_id)
      .select()
      .single();

    if (error) {
      log('error', 'complete-maintenance-task', 'Failed to complete task', { error: error.message });
      return errorResponse('Failed to complete maintenance task', 500);
    }

    // Log to maintenance history
    await supabase.from('maintenance_history').insert({
      maintenance_item_id: task_id,
      action: 'completed',
      performed_by: user.id,
      notes: completion_notes,
      created_at: new Date().toISOString()
    });

    log('info', 'complete-maintenance-task', 'Task completed successfully', { taskId: task_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'complete-maintenance-task', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
