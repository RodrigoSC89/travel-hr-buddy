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
      case 'create_charter': {
        const { 
          vessel_id, 
          charterer_name, 
          charter_type, // TIME_CHARTER, VOYAGE_CHARTER, BAREBOAT
          daily_rate,
          currency,
          start_date,
          end_date,
          terms
        } = params;

        if (!vessel_id || !charterer_name || !charter_type) {
          return errorResponse('vessel_id, charterer_name, and charter_type are required', 400);
        }

        const { data: charter, error } = await supabase
          .from('voyage_charters')
          .insert({
            vessel_id,
            charterer_name,
            charter_type,
            daily_rate,
            currency: currency || 'USD',
            start_date,
            end_date,
            terms,
            status: 'draft',
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        log('info', 'charter-management', 'Charter created', { charterId: charter.id });
        return jsonResponse({ success: true, charter });
      }

      case 'calculate_hire': {
        const { charter_id, include_offhire } = params;

        const { data: charter, error } = await supabase
          .from('voyage_charters')
          .select('*')
          .eq('id', charter_id)
          .single();

        if (error || !charter) {
          return errorResponse('Charter not found', 404);
        }

        const start = new Date(charter.start_date);
        const end = new Date(charter.end_date || new Date());
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        let offhireDays = 0;
        if (include_offhire) {
          const { data: offhireRecords } = await supabase
            .from('charter_offhire')
            .select('days')
            .eq('charter_id', charter_id);
          
          offhireDays = offhireRecords?.reduce((sum: number, r: any) => sum + (r.days || 0), 0) || 0;
        }

        const billableDays = days - offhireDays;
        const totalHire = billableDays * (charter.daily_rate || 0);

        return jsonResponse({
          success: true,
          calculation: {
            charter_id,
            total_days: days,
            offhire_days: offhireDays,
            billable_days: billableDays,
            daily_rate: charter.daily_rate,
            currency: charter.currency,
            total_hire: totalHire
          }
        });
      }

      case 'record_offhire': {
        const { charter_id, start_date, end_date, reason, deduction_amount } = params;

        if (!charter_id || !start_date || !reason) {
          return errorResponse('charter_id, start_date, and reason are required', 400);
        }

        const days = end_date 
          ? Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24))
          : 1;

        const { data: offhire, error } = await supabase
          .from('charter_offhire')
          .insert({
            charter_id,
            start_date,
            end_date,
            days,
            reason,
            deduction_amount,
            recorded_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, offhire });
      }

      case 'list_charters': {
        const { vessel_id, status, charterer_name } = params;

        let query = supabase.from('voyage_charters').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (status) query = query.eq('status', status);
        if (charterer_name) query = query.ilike('charterer_name', `%${charterer_name}%`);

        const { data: charters, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        return jsonResponse({ success: true, charters });
      }

      default:
        return errorResponse('Invalid action. Use: create_charter, calculate_hire, record_offhire, list_charters', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'charter-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
