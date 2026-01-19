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

    const { invoice_id, recipient_email, send_copy_to } = await req.json();

    if (!invoice_id || !recipient_email) {
      return errorResponse('Invoice ID and recipient email are required', 400);
    }

    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return errorResponse('Invoice not found', 404);
    }

    // Update invoice status to sent
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_to: recipient_email,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoice_id);

    if (updateError) {
      log('error', 'send-invoice', 'Failed to update invoice status', { error: updateError.message });
    }

    // Log the send action
    await supabase.from('invoice_send_log').insert({
      invoice_id,
      recipient_email,
      copy_to: send_copy_to,
      sent_by: user.id,
      sent_at: new Date().toISOString(),
      status: 'sent'
    });

    log('info', 'send-invoice', 'Invoice sent successfully', { invoiceId: invoice_id, recipient: recipient_email });
    return jsonResponse({ 
      success: true, 
      message: 'Invoice sent successfully',
      data: { invoice_id, recipient_email, sent_at: new Date().toISOString() }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'send-invoice', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
