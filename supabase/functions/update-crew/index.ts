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

    const { crew_id, ...updateData } = await req.json();

    if (!crew_id) {
      return errorResponse('Crew ID is required', 400);
    }

    const { data, error } = await supabase
      .from('crew_members')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', crew_id)
      .select()
      .maybeSingle();

    if (error) {
      log('error', 'update-crew', 'Failed to update crew', { error: error.message });
      return errorResponse('Database error', 500);
    }

    if (!data) {
      return errorResponse('Crew member not found', 404);
    }

    log('info', 'update-crew', 'Crew updated successfully', { crewId: crew_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'update-crew', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
