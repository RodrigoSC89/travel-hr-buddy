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
    const equipment_id = url.searchParams.get('equipment_id');
    const vessel_id = url.searchParams.get('vessel_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!equipment_id && !vessel_id) {
      return errorResponse('Equipment ID or vessel ID is required', 400);
    }

    let query = supabase
      .from('maintenance_history')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id);
    }
    if (vessel_id) {
      query = query.eq('vessel_id', vessel_id);
    }

    const { data, error } = await query;

    if (error) {
      log('error', 'get-maintenance-history', 'Failed to fetch history', { error: error.message });
      return errorResponse('Failed to fetch maintenance history', 500);
    }

    log('info', 'get-maintenance-history', 'History fetched successfully', { count: data?.length || 0 });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'get-maintenance-history', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
