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

    const { payment_id, refund_amount, reason } = await req.json();

    if (!payment_id) {
      return errorResponse('Payment ID is required', 400);
    }

    // Get original payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return errorResponse('Payment not found', 404);
    }

    const amountToRefund = refund_amount || payment.amount;
    if (amountToRefund > payment.amount) {
      return errorResponse('Refund amount cannot exceed original payment', 400);
    }

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id,
        invoice_id: payment.invoice_id,
        amount: amountToRefund,
        currency: payment.currency,
        reason,
        status: 'completed',
        refunded_by: user.id,
        refunded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (refundError) {
      log('error', 'refund-payment', 'Failed to create refund', { error: refundError.message });
      return errorResponse('Failed to process refund', 500);
    }

    // Update payment status if fully refunded
    if (amountToRefund >= payment.amount) {
      await supabase
        .from('payments')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', payment_id);
    }

    log('info', 'refund-payment', 'Refund processed successfully', { paymentId: payment_id, amount: amountToRefund });
    return jsonResponse({ success: true, data: refund });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'refund-payment', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
