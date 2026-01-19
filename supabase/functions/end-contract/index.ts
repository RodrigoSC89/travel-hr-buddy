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

    const { contract_id, end_date, termination_reason, notes } = await req.json();

    if (!contract_id) {
      return errorResponse('Contract ID is required', 400);
    }

    const { data, error } = await supabase
      .from('crew_contracts')
      .update({
        end_date: end_date || new Date().toISOString(),
        termination_reason,
        notes,
        status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('id', contract_id)
      .select()
      .single();

    if (error) {
      log('error', 'end-contract', 'Failed to end contract', { error: error.message });
      return errorResponse('Failed to end contract', 500);
    }

    log('info', 'end-contract', 'Contract ended successfully', { contractId: contract_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'end-contract', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
