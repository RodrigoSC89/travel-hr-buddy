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
      case 'report_incident': {
        const { 
          vessel_id,
          incident_type, // NEAR_MISS, ACCIDENT, INJURY, ENVIRONMENTAL, SECURITY
          title,
          description,
          severity, // LOW, MEDIUM, HIGH, CRITICAL
          location,
          occurred_at,
          persons_involved,
          immediate_actions,
          evidence_files
        } = params;

        if (!incident_type || !title || !severity) {
          return errorResponse('incident_type, title, and severity are required', 400);
        }

        const { data: incident, error } = await supabase
          .from('maritime_incidents')
          .insert({
            vessel_id,
            incident_type,
            title,
            description,
            severity,
            location,
            occurred_at: occurred_at || new Date().toISOString(),
            persons_involved: persons_involved || [],
            immediate_actions,
            evidence_files: evidence_files || [],
            status: 'reported',
            reported_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Create investigation if HIGH or CRITICAL
        if (['HIGH', 'CRITICAL'].includes(severity)) {
          await supabase.from('incident_investigations').insert({
            incident_id: incident.id,
            status: 'pending',
            priority: severity === 'CRITICAL' ? 'urgent' : 'high',
            created_by: user.id
          });
        }

        log('info', 'incident-management', 'Incident reported', { 
          incidentId: incident.id, 
          type: incident_type, 
          severity 
        });

        return jsonResponse({ success: true, incident });
      }

      case 'update_investigation': {
        const { 
          incident_id,
          root_cause,
          contributing_factors,
          findings,
          corrective_actions,
          preventive_actions,
          lessons_learned,
          investigation_status
        } = params;

        if (!incident_id) {
          return errorResponse('incident_id is required', 400);
        }

        const { data: investigation, error } = await supabase
          .from('incident_investigations')
          .upsert({
            incident_id,
            root_cause,
            contributing_factors: contributing_factors || [],
            findings: findings || [],
            corrective_actions: corrective_actions || [],
            preventive_actions: preventive_actions || [],
            lessons_learned,
            status: investigation_status || 'in_progress',
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Create action items for corrective/preventive actions
        const allActions = [
          ...(corrective_actions || []).map((a: any) => ({ ...a, type: 'corrective' })),
          ...(preventive_actions || []).map((a: any) => ({ ...a, type: 'preventive' }))
        ];

        if (allActions.length > 0) {
          const actionItems = allActions.map((action: any) => ({
            title: `[${action.type.toUpperCase()}] ${action.description}`,
            description: action.details,
            priority: action.priority || 'high',
            assigned_to: action.responsible,
            due_date: action.due_date,
            source_module: 'incident_investigation',
            source_reference_id: incident_id,
            status: 'open',
            created_by: user.id
          }));

          await supabase.from('action_items').insert(actionItems);
        }

        return jsonResponse({ success: true, investigation });
      }

      case 'close_incident': {
        const { incident_id, closure_summary, effectiveness_review } = params;

        if (!incident_id) {
          return errorResponse('incident_id is required', 400);
        }

        const { data: incident, error } = await supabase
          .from('maritime_incidents')
          .update({
            status: 'closed',
            closure_summary,
            effectiveness_review,
            closed_at: new Date().toISOString(),
            closed_by: user.id
          })
          .eq('id', incident_id)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ success: true, incident });
      }

      case 'get_statistics': {
        const { vessel_id, period_start, period_end } = params;

        let query = supabase.from('maritime_incidents').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (period_start) query = query.gte('occurred_at', period_start);
        if (period_end) query = query.lte('occurred_at', period_end);

        const { data: incidents, error } = await query;
        if (error) throw error;

        const stats = {
          total: incidents?.length || 0,
          by_type: {} as Record<string, number>,
          by_severity: {} as Record<string, number>,
          by_status: {} as Record<string, number>,
          ltif: 0, // Lost Time Injury Frequency
          trir: 0  // Total Recordable Incident Rate
        };

        incidents?.forEach((inc: any) => {
          stats.by_type[inc.incident_type] = (stats.by_type[inc.incident_type] || 0) + 1;
          stats.by_severity[inc.severity] = (stats.by_severity[inc.severity] || 0) + 1;
          stats.by_status[inc.status] = (stats.by_status[inc.status] || 0) + 1;
        });

        return jsonResponse({ success: true, statistics: stats });
      }

      case 'list_incidents': {
        const { vessel_id, status, severity, incident_type, limit = 50 } = params;

        let query = supabase.from('maritime_incidents').select('*');
        if (vessel_id) query = query.eq('vessel_id', vessel_id);
        if (status) query = query.eq('status', status);
        if (severity) query = query.eq('severity', severity);
        if (incident_type) query = query.eq('incident_type', incident_type);

        const { data: incidents, error } = await query
          .order('occurred_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return jsonResponse({ success: true, incidents });
      }

      default:
        return errorResponse('Invalid action', 400);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'incident-management', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
