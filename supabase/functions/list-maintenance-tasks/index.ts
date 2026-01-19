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
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const vesselId = url.searchParams.get('vessel_id');

    let query = supabase
      .from('maintenance_items')
      .select(`
        *,
        vessel:vessels(id, name)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (vesselId) {
      query = query.eq('vessel_id', vesselId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('due_date', { ascending: true })
      .range(from, to);

    if (error) {
      log('error', 'list-maintenance-tasks', 'Failed to list tasks', { error: error.message });
      return errorResponse('Failed to list maintenance tasks', 500);
    }

    log('info', 'list-maintenance-tasks', 'Tasks listed successfully', { count });
    return jsonResponse({
      success: true,
      data,
      pagination: {
        page,
        page_size: pageSize,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize)
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'list-maintenance-tasks', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
