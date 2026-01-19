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

    const url = new URL(req.url);
    const crewId = url.searchParams.get('id');

    if (!crewId) {
      return errorResponse('Crew ID is required', 400);
    }

    const { data, error } = await supabase
      .from('crew_members')
      .select(`
        *,
        certifications:crew_certifications(*),
        contracts:crew_contracts(*),
        documents:crew_documents(*)
      `)
      .eq('id', crewId)
      .single();

    if (error) {
      log('error', 'get-crew', 'Failed to fetch crew', { error: error.message });
      return errorResponse('Crew member not found', 404);
    }

    log('info', 'get-crew', 'Crew fetched successfully', { crewId });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'get-crew', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
