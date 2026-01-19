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
      decision_type,
      module_name,
      input_data,
      output_data,
      confidence_score,
      model_used,
      model_version,
      reasoning,
      recommendations,
      context,
      execution_time_ms,
      requires_human_approval
    } = await req.json();

    if (!decision_type || !module_name) {
      return errorResponse('Decision type and module name are required', 400);
    }

    // Create decision log
    const { data, error } = await supabase
      .from('ai_decisions')
      .insert({
        decision_type,
        module_name,
        input_data,
        output_data,
        confidence_score: confidence_score || 0,
        model_used: model_used || 'unknown',
        model_version,
        reasoning,
        recommendations,
        context,
        execution_time_ms,
        requires_human_approval: requires_human_approval || false,
        status: requires_human_approval ? 'pending_approval' : 'executed',
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'ai-decision-logging', 'Failed to log decision', { error: error.message });
      return errorResponse('Failed to log AI decision', 500);
    }

    // If decision requires approval, create notification
    if (requires_human_approval) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'AI Decision Requires Approval',
        message: `${decision_type} decision in ${module_name} requires your review`,
        type: 'ai_approval_required',
        reference_id: data.id,
        priority: 'high',
        created_at: new Date().toISOString()
      });
    }

    log('info', 'ai-decision-logging', 'AI decision logged', { 
      decisionId: data.id,
      type: decision_type,
      confidence: confidence_score 
    });

    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'ai-decision-logging', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
