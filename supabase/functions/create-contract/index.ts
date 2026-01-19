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

    const { crew_member_id, contract_type, start_date, end_date, salary, currency, vessel_id, position, terms, benefits } = await req.json();

    if (!crew_member_id || !contract_type || !start_date || !salary) {
      return errorResponse('Crew member ID, contract type, start date and salary are required', 400);
    }

    const { data, error } = await supabase
      .from('crew_contracts')
      .insert({
        crew_member_id,
        contract_type,
        start_date,
        end_date,
        salary,
        currency: currency || 'USD',
        vessel_id,
        position,
        terms,
        benefits,
        status: 'active',
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'create-contract', 'Failed to create contract', { error: error.message });
      return errorResponse('Failed to create contract', 500);
    }

    log('info', 'create-contract', 'Contract created successfully', { crewMemberId: crew_member_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-contract', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
