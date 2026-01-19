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

    const { voyage_id, cancellation_reason, notify_crew } = await req.json();

    if (!voyage_id) {
      return errorResponse('Voyage ID is required', 400);
    }

    const { data, error } = await supabase
      .from('voyages')
      .update({
        status: 'cancelled',
        cancellation_reason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', voyage_id)
      .select()
      .single();

    if (error) {
      log('error', 'cancel-voyage', 'Failed to cancel voyage', { error: error.message });
      return errorResponse('Failed to cancel voyage', 500);
    }

    // Optionally notify assigned crew
    if (notify_crew) {
      const { data: assignments } = await supabase
        .from('voyage_crew_assignments')
        .select('crew_member_id')
        .eq('voyage_id', voyage_id);

      // Would trigger notifications here
      log('info', 'cancel-voyage', 'Crew notification triggered', { count: assignments?.length || 0 });
    }

    log('info', 'cancel-voyage', 'Voyage cancelled successfully', { voyageId: voyage_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'cancel-voyage', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
