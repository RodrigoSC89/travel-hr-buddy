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

    const { action, ...params } = await req.json();

    switch (action) {
      case 'create': {
        const { 
          vessel_id, 
          port_name, 
          port_code, 
          eta, 
          etd, 
          purpose, 
          services_required,
          agent_contact 
        } = params;

        if (!vessel_id || !port_name) {
          return errorResponse('vessel_id and port_name are required', 400);
        }

        const { data: portCall, error } = await supabase
          .from('port_calls')
          .insert({
            vessel_id,
            port_name,
            port_code,
            eta,
            etd,
            purpose,
            services_required: services_required || [],
            agent_contact,
            status: 'planned',
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, port_call: portCall });
      }

      case 'update_status': {
        const { port_call_id, status, actual_arrival, actual_departure, notes } = params;

        if (!port_call_id || !status) {
          return errorResponse('port_call_id and status are required', 400);
        }

        const updateData: Record<string, unknown> = { 
          status, 
          updated_at: new Date().toISOString() 
        };
        if (actual_arrival) updateData.actual_arrival = actual_arrival;
        if (actual_departure) updateData.actual_departure = actual_departure;
        if (notes) updateData.notes = notes;

        const { data: portCall, error } = await supabase
          .from('port_calls')
          .update(updateData)
          .eq('id', port_call_id)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, port_call: portCall });
      }

      case 'list': {
        const { vessel_id, status, from_date, to_date } = params;

        let query = supabase.from('port_calls').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (status) query = query.eq('status', status);
        if (from_date) query = query.gte('eta', from_date);
        if (to_date) query = query.lte('eta', to_date);

        const { data: portCalls, error } = await query.order('eta', { ascending: true });
        if (error) throw error;

        return jsonResponse({ success: true, port_calls: portCalls });
      }

      case 'get_services': {
        const { port_code } = params;

        // Get available services for a port
        const services = [
          { code: 'BUNKER', name: 'Bunkering', available: true },
          { code: 'REPAIR', name: 'Ship Repair', available: true },
          { code: 'CARGO', name: 'Cargo Operations', available: true },
          { code: 'SUPPLY', name: 'Provisions/Supplies', available: true },
          { code: 'CREW', name: 'Crew Change', available: true },
          { code: 'INSPECT', name: 'Inspection Services', available: true }
        ];

        return jsonResponse({ success: true, port_code, services });
      }

      default:
        return errorResponse('Invalid action. Use: create, update_status, list, get_services', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'port-call-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
