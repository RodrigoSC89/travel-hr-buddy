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

    const { voyage_id, ...updateData } = await req.json();

    if (!voyage_id) {
      return errorResponse('Voyage ID is required', 400);
    }

    const { data, error } = await supabase
      .from('voyages')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', voyage_id)
      .select()
      .single();

    if (error) {
      log('error', 'update-voyage', 'Failed to update voyage', { error: error.message });
      return errorResponse('Failed to update voyage', 500);
    }

    log('info', 'update-voyage', 'Voyage updated successfully', { voyageId: voyage_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'update-voyage', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
