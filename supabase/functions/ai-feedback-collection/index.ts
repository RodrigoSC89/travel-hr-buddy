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
      decision_id,
      feedback_type, // 'approve', 'reject', 'correct', 'rate'
      rating, // 1-5 scale
      is_correct,
      correction,
      comments,
      actual_outcome
    } = await req.json();

    if (!decision_id || !feedback_type) {
      return errorResponse('Decision ID and feedback type are required', 400);
    }

    // Get the original decision
    const { data: decision, error: decisionError } = await supabase
      .from('ai_decisions')
      .select('*')
      .eq('id', decision_id)
      .single();

    if (decisionError || !decision) {
      return errorResponse('Decision not found', 404);
    }

    // Record feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('ai_feedback')
      .insert({
        decision_id,
        feedback_type,
        rating,
        is_correct,
        correction,
        comments,
        actual_outcome,
        provided_by: user.id,
        provided_at: new Date().toISOString()
      })
      .select()
      .single();

    if (feedbackError) {
      log('error', 'ai-feedback-collection', 'Failed to record feedback', { error: feedbackError.message });
      return errorResponse('Failed to record feedback', 500);
    }

    // Update decision status based on feedback
    let newStatus = decision.status;
    if (feedback_type === 'approve') {
      newStatus = 'approved';
    } else if (feedback_type === 'reject') {
      newStatus = 'rejected';
    } else if (feedback_type === 'correct') {
      newStatus = 'corrected';
    }

    await supabase
      .from('ai_decisions')
      .update({
        status: newStatus,
        feedback_received: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', decision_id);

    // If correction provided, log for model improvement
    if (correction) {
      await supabase.from('ai_training_data').insert({
        source: 'user_correction',
        decision_id,
        original_output: decision.output_data,
        corrected_output: correction,
        module_name: decision.module_name,
        created_at: new Date().toISOString()
      });
    }

    log('info', 'ai-feedback-collection', 'Feedback collected', { 
      decisionId: decision_id,
      feedbackType: feedback_type,
      rating 
    });

    return jsonResponse({ success: true, data: feedback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'ai-feedback-collection', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
