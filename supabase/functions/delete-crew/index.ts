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

    const { crew_id } = await req.json();

    if (!crew_id) {
      return errorResponse('Crew ID is required', 400);
    }

    // Soft delete - mark as inactive
    const { error } = await supabase
      .from('crew_members')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', crew_id);

    if (error) {
      log('error', 'delete-crew', 'Failed to delete crew', { error: error.message });
      return errorResponse('Failed to delete crew member', 500);
    }

    log('info', 'delete-crew', 'Crew deleted successfully', { crewId: crew_id });
    return jsonResponse({ success: true, message: 'Crew member deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'delete-crew', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
