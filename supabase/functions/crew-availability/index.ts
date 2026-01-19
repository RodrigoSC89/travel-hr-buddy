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
    const start_date = url.searchParams.get('start_date') || new Date().toISOString();
    const end_date = url.searchParams.get('end_date');
    const rank = url.searchParams.get('rank');
    const vessel_id = url.searchParams.get('vessel_id');

    // Get all crew members
    let crewQuery = supabase
      .from('crew_members')
      .select('id, first_name, last_name, rank, status, current_vessel_id, contract_end_date');

    if (rank) crewQuery = crewQuery.eq('rank', rank);
    if (vessel_id) crewQuery = crewQuery.eq('current_vessel_id', vessel_id);

    const { data: crewMembers, error: crewError } = await crewQuery;

    if (crewError) {
      return errorResponse('Failed to fetch crew members', 500);
    }

    // Get assignments in date range
    const { data: assignments, error: assignError } = await supabase
      .from('voyage_crew_assignments')
      .select('crew_member_id, voyage_id, status')
      .gte('assigned_at', start_date)
      .lte('assigned_at', end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

    const assignedCrewIds = new Set(assignments?.map((a: any) => a.crew_member_id) || []);

    const availability = crewMembers?.map((crew: any) => ({
      ...crew,
      full_name: `${crew.first_name} ${crew.last_name}`,
      is_available: !assignedCrewIds.has(crew.id) && crew.status === 'active',
      current_assignment: assignments?.find((a: any) => a.crew_member_id === crew.id) || null
    }));

    const available = availability?.filter((c: any) => c.is_available) || [];
    const unavailable = availability?.filter((c: any) => !c.is_available) || [];

    log('info', 'crew-availability', 'Crew availability checked', { 
      available: available.length, 
      unavailable: unavailable.length 
    });

    return jsonResponse({
      success: true,
      date_range: { start: start_date, end: end_date },
      summary: {
        total: availability?.length || 0,
        available: available.length,
        unavailable: unavailable.length
      },
      available,
      unavailable
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'crew-availability', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
