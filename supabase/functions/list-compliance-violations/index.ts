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
    const organization_id = url.searchParams.get('organization_id');
    const vessel_id = url.searchParams.get('vessel_id');
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');

    let query = supabase
      .from('compliance_violations')
      .select('*', { count: 'exact' });

    if (organization_id) query = query.eq('organization_id', organization_id);
    if (vessel_id) query = query.eq('vessel_id', vessel_id);
    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order('detected_at', { ascending: false })
      .range(from, to);

    if (error) {
      log('error', 'list-compliance-violations', 'Failed to list violations', { error: error.message });
      return errorResponse('Failed to list violations', 500);
    }

    log('info', 'list-compliance-violations', 'Violations listed successfully', { count });
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
    log('error', 'list-compliance-violations', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
