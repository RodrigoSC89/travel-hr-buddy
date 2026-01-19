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

    const { organization_id, vessel_id, voyage_id, category, description, amount, currency, expense_date, vendor, receipt_url, notes } = await req.json();

    if (!organization_id || !category || !amount) {
      return errorResponse('Organization ID, category and amount are required', 400);
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        organization_id,
        vessel_id,
        voyage_id,
        category,
        description,
        amount,
        currency: currency || 'USD',
        expense_date: expense_date || new Date().toISOString(),
        vendor,
        receipt_url,
        notes,
        status: 'pending',
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'create-expense', 'Failed to create expense', { error: error.message });
      return errorResponse('Failed to create expense', 500);
    }

    log('info', 'create-expense', 'Expense created successfully', { category, amount });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-expense', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
