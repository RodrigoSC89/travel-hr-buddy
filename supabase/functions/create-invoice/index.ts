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

    const body = await req.json();

    if (!body.customer_id || !body.items || body.items.length === 0) {
      return errorResponse('Customer ID and at least one item are required', 400);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: { quantity: number; unit_price: number }) => 
      sum + (item.quantity * item.unit_price), 0);
    const taxRate = body.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - (body.discount || 0);

    const invoiceData = {
      organization_id: (profile as { organization_id?: string } | null)?.organization_id,
      customer_id: body.customer_id,
      voyage_id: body.voyage_id,
      status: 'draft',
      currency: body.currency || 'USD',
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount: body.discount || 0,
      total,
      due_date: body.due_date,
      notes: body.notes,
      payment_terms: body.payment_terms || 'Net 30',
      created_by: user.id
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      return errorResponse('Failed to create invoice: ' + invoiceError.message, 500);
    }

    // Insert invoice items
    const invoiceRecord = invoice as { id: string };
    const itemsData = body.items.map((item: { description: string; quantity: number; unit_price: number }) => ({
      invoice_id: invoiceRecord.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsData);

    if (itemsError) {
      log('warn', 'create-invoice', 'Failed to create invoice items', { error: itemsError.message });
    }

    log('info', 'create-invoice', 'Invoice created', { invoiceId: invoiceRecord.id, userId: user.id });

    return jsonResponse({ success: true, data: invoice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-invoice', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
