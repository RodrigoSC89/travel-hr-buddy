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

    if (!body.vessel_id || !body.departure_port || !body.arrival_port) {
      return errorResponse('Vessel, departure port, and arrival port are required', 400);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const voyageData = {
      organization_id: (profile as { organization_id?: string } | null)?.organization_id,
      vessel_id: body.vessel_id,
      voyage_number: body.voyage_number || `VOY-${Date.now()}`,
      departure_port: body.departure_port,
      arrival_port: body.arrival_port,
      departure_date: body.departure_date,
      estimated_arrival: body.estimated_arrival,
      actual_arrival: body.actual_arrival,
      status: body.status || 'planned',
      cargo_type: body.cargo_type,
      cargo_quantity: body.cargo_quantity,
      route_waypoints: body.route_waypoints || [],
      weather_conditions: body.weather_conditions || {},
      fuel_consumption: body.fuel_consumption,
      notes: body.notes,
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('voyages')
      .insert(voyageData)
      .select()
      .single();

    if (error) {
      log('error', 'create-voyage', 'Failed to create voyage', { error: error.message });
      return errorResponse('Failed to create voyage: ' + error.message, 500);
    }

    log('info', 'create-voyage', 'Voyage created', { voyageId: (data as { id: string }).id, userId: user.id });

    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-voyage', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
