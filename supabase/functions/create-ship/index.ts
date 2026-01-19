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

    const body = await req.json();

    // Required fields validation
    if (!body.name || !body.imo_number) {
      return errorResponse('Name and IMO number are required', 400);
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const shipData = {
      organization_id: (profile as { organization_id?: string } | null)?.organization_id,
      name: body.name,
      imo_number: body.imo_number,
      mmsi: body.mmsi,
      call_sign: body.call_sign,
      flag_state: body.flag_state,
      ship_type: body.ship_type,
      gross_tonnage: body.gross_tonnage,
      deadweight: body.deadweight,
      year_built: body.year_built,
      classification_society: body.classification_society,
      status: body.status || 'active',
      specifications: body.specifications || {},
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('vessels')
      .insert(shipData)
      .select()
      .single();

    if (error) {
      log('error', 'create-ship', 'Failed to create ship', { error: error.message });
      return errorResponse('Failed to create ship: ' + error.message, 500);
    }

    log('info', 'create-ship', 'Ship created', { shipId: (data as { id: string }).id, userId: user.id });

    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-ship', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
