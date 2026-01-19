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

    const body = await req.json();

    if (!body.title || !body.equipment_id) {
      return errorResponse('Title and equipment ID are required', 400);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const taskData = {
      organization_id: (profile as { organization_id?: string } | null)?.organization_id,
      equipment_id: body.equipment_id,
      vessel_id: body.vessel_id,
      title: body.title,
      description: body.description,
      maintenance_type: body.maintenance_type || 'preventive',
      priority: body.priority || 'medium',
      status: 'pending',
      scheduled_date: body.scheduled_date,
      due_date: body.due_date,
      estimated_hours: body.estimated_hours,
      assigned_to: body.assigned_to,
      parts_required: body.parts_required || [],
      checklist: body.checklist || [],
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('mmi_maintenance_jobs')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      log('error', 'create-maintenance-task', 'Failed to create task', { error: error.message });
      return errorResponse('Failed to create maintenance task: ' + error.message, 500);
    }

    log('info', 'create-maintenance-task', 'Task created', { taskId: (data as { id: string }).id, userId: user.id });

    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-maintenance-task', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
