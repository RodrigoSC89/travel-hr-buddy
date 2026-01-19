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

    const { 
      vessel_id, 
      status, 
      position, 
      speed, 
      heading, 
      fuel_level, 
      operational_notes 
    } = await req.json();

    if (!vessel_id) {
      return errorResponse('vessel_id is required', 400);
    }

    // Update vessel status
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    
    if (status) updateData.status = status;
    if (position) updateData.current_position = position;
    if (speed !== undefined) updateData.current_speed = speed;
    if (heading !== undefined) updateData.current_heading = heading;
    if (fuel_level !== undefined) updateData.fuel_level = fuel_level;
    if (operational_notes) updateData.operational_notes = operational_notes;

    const { data: vessel, error: updateError } = await supabase
      .from('vessels')
      .update(updateData)
      .eq('id', vessel_id)
      .select()
      .single();

    if (updateError) {
      return errorResponse('Failed to update vessel status', 500);
    }

    // Log the status update
    await supabase.from('vessel_status_logs').insert({
      vessel_id,
      status: status || vessel.status,
      position: position || vessel.current_position,
      speed: speed ?? vessel.current_speed,
      heading: heading ?? vessel.current_heading,
      fuel_level: fuel_level ?? vessel.fuel_level,
      logged_by: user.id,
      logged_at: new Date().toISOString()
    });

    log('info', 'vessel-status-update', 'Vessel status updated', { vesselId: vessel_id, status });

    return jsonResponse({ success: true, vessel });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'vessel-status-update', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
