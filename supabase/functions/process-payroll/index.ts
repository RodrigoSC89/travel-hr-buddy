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

    const { organization_id, month, year, vessel_id } = await req.json();

    if (!organization_id || !month || !year) {
      return errorResponse('Organization ID, month and year are required', 400);
    }

    // Get all active crew members with contracts
    let query = supabase
      .from('crew_members')
      .select('*, crew_contracts(*)')
      .eq('organization_id', organization_id)
      .eq('status', 'active');

    if (vessel_id) {
      query = query.eq('current_vessel_id', vessel_id);
    }

    const { data: crewMembers, error: crewError } = await query;

    if (crewError) {
      return errorResponse('Failed to fetch crew members', 500);
    }

    const payrollResults = [];
    let totalAmount = 0;

    for (const crew of crewMembers || []) {
      const activeContract = crew.crew_contracts?.find((c: { status: string }) => c.status === 'active');
      if (!activeContract) continue;

      const baseSalary = activeContract.salary || 0;
      const overtime = 0;
      const allowances = activeContract.benefits?.allowances || 0;
      const deductions = activeContract.benefits?.deductions || 0;
      const netSalary = baseSalary + overtime + allowances - deductions;

      payrollResults.push({
        crew_member_id: crew.id,
        crew_member_name: crew.full_name,
        position: crew.position,
        base_salary: baseSalary,
        overtime,
        allowances,
        deductions,
        net_salary: netSalary,
        currency: activeContract.currency || 'USD'
      });

      totalAmount += netSalary;
    }

    const payrollSummary = {
      organization_id,
      month,
      year,
      vessel_id,
      total_crew: payrollResults.length,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'processed',
      processed_at: new Date().toISOString(),
      processed_by: user.id,
      details: payrollResults
    };

    log('info', 'process-payroll', 'Payroll processed successfully', { 
      organizationId: organization_id, 
      month, 
      year, 
      totalCrew: payrollResults.length 
    });

    return jsonResponse({ success: true, data: payrollSummary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'process-payroll', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
