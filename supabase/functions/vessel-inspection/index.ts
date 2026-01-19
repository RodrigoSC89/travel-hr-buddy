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
      inspection_type, // OVID, PSC, FLAG, CLASS, VETTING
      inspection_date,
      inspector_name,
      inspector_organization,
      findings,
      observations,
      overall_rating,
      next_inspection_due
    } = await req.json();

    if (!vessel_id || !inspection_type) {
      return errorResponse('vessel_id and inspection_type are required', 400);
    }

    const inspectionData = {
      vessel_id,
      inspection_type,
      inspection_date: inspection_date || new Date().toISOString(),
      inspector_name,
      inspector_organization,
      findings: findings || [],
      observations: observations || [],
      overall_rating,
      next_inspection_due,
      status: 'completed',
      created_by: user.id,
      created_at: new Date().toISOString()
    };

    const { data: inspection, error: insertError } = await supabase
      .from('vessel_inspections')
      .insert(inspectionData)
      .select()
      .single();

    if (insertError) {
      log('error', 'vessel-inspection', 'Failed to create inspection', { error: insertError.message });
      return errorResponse('Failed to create inspection record', 500);
    }

    // Create action items for findings
    if (findings && findings.length > 0) {
      const actionItems = findings
        .filter((f: any) => f.requires_action)
        .map((finding: any) => ({
          title: `[${inspection_type}] ${finding.title}`,
          description: finding.description,
          priority: finding.severity === 'major' ? 'high' : 'medium',
          vessel_id,
          source_module: 'vessel_inspection',
          source_reference_id: inspection.id,
          due_date: finding.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'open',
          created_by: user.id
        }));

      if (actionItems.length > 0) {
        await supabase.from('action_items').insert(actionItems);
      }
    }

    log('info', 'vessel-inspection', 'Inspection recorded', { 
      vesselId: vessel_id, 
      type: inspection_type,
      findings: findings?.length || 0 
    });

    return jsonResponse({ 
      success: true, 
      inspection,
      action_items_created: findings?.filter((f: any) => f.requires_action).length || 0
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'vessel-inspection', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
