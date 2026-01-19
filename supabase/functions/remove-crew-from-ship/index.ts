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

    const { crew_member_id, vessel_id, reason } = await req.json();

    if (!crew_member_id || !vessel_id) {
      return errorResponse('Crew member ID and vessel ID are required', 400);
    }

    // Update crew member to remove vessel assignment
    const { error: updateError } = await supabase
      .from('crew_members')
      .update({
        current_vessel_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', crew_member_id);

    if (updateError) {
      log('error', 'remove-crew-from-ship', 'Failed to update crew member', { error: updateError.message });
      return errorResponse('Failed to remove crew from ship', 500);
    }

    // End assignment record
    const { data, error } = await supabase
      .from('crew_vessel_assignments')
      .update({
        end_date: new Date().toISOString(),
        status: 'completed',
        end_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('crew_member_id', crew_member_id)
      .eq('vessel_id', vessel_id)
      .eq('status', 'active')
      .select()
      .single();

    if (error) {
      log('warn', 'remove-crew-from-ship', 'No active assignment found', { error: error.message });
    }

    log('info', 'remove-crew-from-ship', 'Crew removed from ship successfully', { crewMemberId: crew_member_id, vesselId: vessel_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'remove-crew-from-ship', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
