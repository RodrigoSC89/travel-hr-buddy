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

    const { voyage_id, crew_member_ids, positions } = await req.json();

    if (!voyage_id || !crew_member_ids || !Array.isArray(crew_member_ids)) {
      return errorResponse('Voyage ID and crew member IDs array are required', 400);
    }

    const assignments = crew_member_ids.map((crew_id: string, index: number) => ({
      voyage_id,
      crew_member_id: crew_id,
      position: positions?.[index] || null,
      status: 'assigned',
      assigned_by: user.id,
      assigned_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('voyage_crew_assignments')
      .insert(assignments)
      .select();

    if (error) {
      log('error', 'assign-crew-to-voyage', 'Failed to assign crew', { error: error.message });
      return errorResponse('Failed to assign crew to voyage', 500);
    }

    log('info', 'assign-crew-to-voyage', 'Crew assigned to voyage successfully', { voyageId: voyage_id, count: crew_member_ids.length });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'assign-crew-to-voyage', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
