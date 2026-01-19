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
      case 'schedule_drill': {
        const { 
          vessel_id,
          drill_type, // FIRE, ABANDON_SHIP, MOB, SECURITY, POLLUTION, MUSTER
          scheduled_date,
          scenario,
          objectives,
          participants,
          equipment_required
        } = params;

        if (!vessel_id || !drill_type || !scheduled_date) {
          return errorResponse('vessel_id, drill_type, and scheduled_date are required', 400);
        }

        const { data: drill, error } = await supabase
          .from('safety_drills')
          .insert({
            vessel_id,
            drill_type,
            scheduled_date,
            scenario,
            objectives: objectives || [],
            participants: participants || [],
            equipment_required: equipment_required || [],
            status: 'scheduled',
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, drill });
      }

      case 'record_drill_execution': {
        const { 
          drill_id,
          actual_start_time,
          actual_end_time,
          participants_actual,
          muster_time_seconds,
          observations,
          deficiencies,
          corrective_actions,
          overall_rating // 1-5
        } = params;

        if (!drill_id) {
          return errorResponse('drill_id is required', 400);
        }

        const duration = actual_start_time && actual_end_time
          ? Math.round((new Date(actual_end_time).getTime() - new Date(actual_start_time).getTime()) / 60000)
          : null;

        const { data: drill, error } = await supabase
          .from('safety_drills')
          .update({
            status: 'completed',
            actual_start_time,
            actual_end_time,
            duration_minutes: duration,
            participants_actual: participants_actual || [],
            muster_time_seconds,
            observations,
            deficiencies: deficiencies || [],
            corrective_actions: corrective_actions || [],
            overall_rating,
            completed_at: new Date().toISOString(),
            completed_by: user.id
          })
          .eq('id', drill_id)
          .select()
          .single();

        if (error) throw error;

        // Create action items for deficiencies
        if (deficiencies && deficiencies.length > 0) {
          const actionItems = deficiencies.map((def: any) => ({
            title: `[DRILL] ${def.description}`,
            description: def.details,
            priority: def.severity === 'major' ? 'high' : 'medium',
            vessel_id: drill.vessel_id,
            source_module: 'safety_drill',
            source_reference_id: drill_id,
            due_date: def.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            created_by: user.id
          }));

          await supabase.from('action_items').insert(actionItems);
        }

        return jsonResponse({ success: true, drill });
      }

      case 'get_drill_schedule': {
        const { vessel_id, from_date, to_date, drill_type } = params;

        let query = supabase.from('safety_drills').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (drill_type) query = query.eq('drill_type', drill_type);
        if (from_date) query = query.gte('scheduled_date', from_date);
        if (to_date) query = query.lte('scheduled_date', to_date);

        const { data: drills, error } = await query.order('scheduled_date', { ascending: true });
        if (error) throw error;

        return jsonResponse({ success: true, drills });
      }

      case 'get_compliance_status': {
        const { vessel_id } = params;

        if (!vessel_id) {
          return errorResponse('vessel_id is required', 400);
        }

        // SOLAS requirements for drill frequencies
        const drillRequirements = {
          ABANDON_SHIP: { frequency_days: 30, regulation: 'SOLAS III/19.3.2' },
          FIRE: { frequency_days: 30, regulation: 'SOLAS III/19.3.2' },
          MOB: { frequency_days: 30, regulation: 'SOLAS III/19.3.3' },
          MUSTER: { frequency_days: 7, regulation: 'SOLAS III/19.3.1' },
          SECURITY: { frequency_days: 90, regulation: 'ISPS Code' },
          POLLUTION: { frequency_days: 30, regulation: 'MARPOL' }
        };

        const { data: recentDrills } = await supabase
          .from('safety_drills')
          .select('*')
          .eq('vessel_id', vessel_id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        const compliance = Object.entries(drillRequirements).map(([type, req]) => {
          const lastDrill = recentDrills?.find((d: any) => d.drill_type === type);
          const daysSinceLast = lastDrill 
            ? Math.floor((Date.now() - new Date(lastDrill.completed_at).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          
          const isOverdue = daysSinceLast > req.frequency_days;
          const nextDueDate = lastDrill
            ? new Date(new Date(lastDrill.completed_at).getTime() + req.frequency_days * 24 * 60 * 60 * 1000)
            : new Date();

          return {
            drill_type: type,
            regulation: req.regulation,
            frequency_days: req.frequency_days,
            last_completed: lastDrill?.completed_at || null,
            days_since_last: lastDrill ? daysSinceLast : null,
            next_due: nextDueDate.toISOString(),
            is_overdue: isOverdue,
            status: isOverdue ? 'non_compliant' : 'compliant'
          };
        });

        const overallCompliant = compliance.every(c => c.status === 'compliant');

        return jsonResponse({
          success: true,
          vessel_id,
          overall_status: overallCompliant ? 'compliant' : 'non_compliant',
          drill_compliance: compliance
        });
      }

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'drill-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
