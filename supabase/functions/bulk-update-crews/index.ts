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

    const { crew_ids, updates } = await req.json();

    if (!crew_ids || !Array.isArray(crew_ids) || crew_ids.length === 0) {
      return errorResponse('crew_ids array is required', 400);
    }

    if (!updates || Object.keys(updates).length === 0) {
      return errorResponse('updates object is required', 400);
    }

    const results = [];
    for (const crew_id of crew_ids) {
      const { data, error } = await supabase
        .from('crew_members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', crew_id)
        .select()
        .single();

      if (error) {
        results.push({ crew_id, success: false, error: error.message });
      } else {
        results.push({ crew_id, success: true, data });
      }
    }

    const successCount = results.filter(r => r.success).length;
    log('info', 'bulk-update-crews', `Bulk updated ${successCount}/${crew_ids.length} crews`, { userId: user.id });

    return jsonResponse({
      success: true,
      total: crew_ids.length,
      updated: successCount,
      failed: crew_ids.length - successCount,
      results
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'bulk-update-crews', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
