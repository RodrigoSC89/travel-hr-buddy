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

    const { vessel_ids, mmsi_list } = await req.json();

    const marineTrafficApiKey = Deno.env.get('MARINE_TRAFFIC_API_KEY');
    if (!marineTrafficApiKey) {
      return errorResponse('Marine Traffic API key not configured', 500);
    }

    // Get vessels to sync
    let query = supabase.from('vessels').select('id, name, imo_number, mmsi');
    
    if (vessel_ids && vessel_ids.length > 0) {
      query = query.in('id', vessel_ids);
    } else if (mmsi_list && mmsi_list.length > 0) {
      query = query.in('mmsi', mmsi_list);
    }

    const { data: vessels, error: vesselsError } = await query;

    if (vesselsError || !vessels || vessels.length === 0) {
      return errorResponse('No vessels found to sync', 404);
    }

    const results = [];

    for (const vessel of vessels) {
      if (!vessel.mmsi) {
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: 'No MMSI configured'
        });
        continue;
      }

      try {
        // Call Marine Traffic API
        const mtResponse = await fetch(
          `https://services.marinetraffic.com/api/exportvessel/v:8/${marineTrafficApiKey}/mmsi:${vessel.mmsi}/protocol:jsono`,
          { method: 'GET' }
        );

        if (!mtResponse.ok) {
          throw new Error(`Marine Traffic API error: ${mtResponse.status}`);
        }

        const mtData = await mtResponse.json();
        
        if (mtData && mtData.length > 0) {
          const position = mtData[0];
          
          // Store AIS event
          await supabase.from('ais_events').insert({
            vessel_id: vessel.id,
            mmsi: vessel.mmsi,
            event_type: 'position_update',
            position: {
              lat: parseFloat(position.LAT),
              lng: parseFloat(position.LON)
            },
            speed: parseFloat(position.SPEED) / 10, // Convert to knots
            course: parseFloat(position.COURSE),
            destination: position.DESTINATION,
            eta: position.ETA,
            recorded_at: new Date().toISOString(),
            raw_data: position
          });

          // Update vessel current position
          await supabase.from('vessels').update({
            current_position: {
              lat: parseFloat(position.LAT),
              lng: parseFloat(position.LON)
            },
            current_speed: parseFloat(position.SPEED) / 10,
            current_course: parseFloat(position.COURSE),
            last_ais_update: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('id', vessel.id);

          results.push({
            vessel_id: vessel.id,
            vessel_name: vessel.name,
            success: true,
            position: {
              lat: position.LAT,
              lng: position.LON,
              speed: parseFloat(position.SPEED) / 10,
              course: position.COURSE
            }
          });
        }
      } catch (error) {
        results.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    log('info', 'marine-traffic-ais-sync', 'AIS sync completed', { 
      total: results.length,
      success: successCount 
    });

    return jsonResponse({
      success: true,
      synced: successCount,
      failed: results.length - successCount,
      results
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'marine-traffic-ais-sync', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
