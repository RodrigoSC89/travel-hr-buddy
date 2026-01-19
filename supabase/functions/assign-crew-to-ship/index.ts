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

    const { crew_member_id, vessel_id, position, start_date, end_date } = await req.json();

    if (!crew_member_id || !vessel_id) {
      return errorResponse('Crew member ID and vessel ID are required', 400);
    }

    // Update crew member's current vessel
    const { error: updateError } = await supabase
      .from('crew_members')
      .update({
        current_vessel_id: vessel_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', crew_member_id);

    if (updateError) {
      log('error', 'assign-crew-to-ship', 'Failed to update crew member', { error: updateError.message });
      return errorResponse('Failed to assign crew to ship', 500);
    }

    // Create assignment record
    const { data, error } = await supabase
      .from('crew_vessel_assignments')
      .insert({
        crew_member_id,
        vessel_id,
        position,
        start_date: start_date || new Date().toISOString(),
        end_date,
        status: 'active',
        assigned_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'assign-crew-to-ship', 'Failed to create assignment', { error: error.message });
      return errorResponse('Failed to create assignment record', 500);
    }

    log('info', 'assign-crew-to-ship', 'Crew assigned to ship successfully', { crewMemberId: crew_member_id, vesselId: vessel_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'assign-crew-to-ship', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
