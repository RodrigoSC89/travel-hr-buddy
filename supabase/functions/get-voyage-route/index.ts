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
    const voyage_id = url.searchParams.get('voyage_id');

    if (!voyage_id) {
      return errorResponse('Voyage ID is required', 400);
    }

    // Get voyage with route waypoints
    const { data: voyage, error: voyageError } = await supabase
      .from('voyages')
      .select('id, origin_port, destination_port, departure_date, arrival_date')
      .eq('id', voyage_id)
      .single();

    if (voyageError) {
      return errorResponse('Voyage not found', 404);
    }

    // Get route waypoints
    const { data: waypoints, error: waypointsError } = await supabase
      .from('voyage_waypoints')
      .select('*')
      .eq('voyage_id', voyage_id)
      .order('sequence', { ascending: true });

    if (waypointsError) {
      log('warn', 'get-voyage-route', 'Failed to fetch waypoints', { error: waypointsError.message });
    }

    const route = {
      voyage_id,
      origin: voyage.origin_port,
      destination: voyage.destination_port,
      departure_date: voyage.departure_date,
      arrival_date: voyage.arrival_date,
      waypoints: waypoints || [],
      total_distance: waypoints?.reduce((sum: number, wp: { distance_from_prev?: number }) => sum + (wp.distance_from_prev || 0), 0) || 0
    };

    log('info', 'get-voyage-route', 'Route fetched successfully', { voyageId: voyage_id });
    return jsonResponse({ success: true, data: route });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'get-voyage-route', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
