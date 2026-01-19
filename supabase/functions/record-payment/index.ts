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
      invoice_id, 
      amount, 
      payment_method, 
      payment_date,
      reference_number,
      notes 
    } = await req.json();

    if (!invoice_id || !amount) {
      return errorResponse('Invoice ID and amount are required', 400);
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, total_amount, paid_amount, status')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return errorResponse('Invoice not found', 404);
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id,
        amount,
        payment_method,
        payment_date: payment_date || new Date().toISOString(),
        reference_number,
        notes,
        recorded_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      log('error', 'record-payment', 'Failed to record payment', { error: paymentError.message });
      return errorResponse('Failed to record payment', 500);
    }

    // Update invoice paid amount and status
    const newPaidAmount = (invoice.paid_amount || 0) + amount;
    const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

    await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id);

    log('info', 'record-payment', 'Payment recorded successfully', { 
      invoiceId: invoice_id,
      amount,
      newStatus 
    });

    return jsonResponse({ 
      success: true, 
      payment,
      invoice_status: newStatus,
      total_paid: newPaidAmount
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'record-payment', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
