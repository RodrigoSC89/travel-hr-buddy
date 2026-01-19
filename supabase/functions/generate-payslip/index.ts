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

    const { crew_member_id, month, year } = await req.json();

    if (!crew_member_id || !month || !year) {
      return errorResponse('Crew member ID, month and year are required', 400);
    }

    // Get crew member details
    const { data: crewMember, error: crewError } = await supabase
      .from('crew_members')
      .select('*, crew_contracts(*)')
      .eq('id', crew_member_id)
      .single();

    if (crewError || !crewMember) {
      return errorResponse('Crew member not found', 404);
    }

    const activeContract = crewMember.crew_contracts?.find((c: { status: string }) => c.status === 'active');
    if (!activeContract) {
      return errorResponse('No active contract found', 400);
    }

    // Calculate payslip
    const baseSalary = activeContract.salary || 0;
    const overtime = 0; // Would be calculated from time records
    const allowances = activeContract.benefits?.allowances || 0;
    const deductions = activeContract.benefits?.deductions || 0;
    const netSalary = baseSalary + overtime + allowances - deductions;

    const payslip = {
      crew_member_id,
      crew_member_name: crewMember.full_name,
      position: crewMember.position,
      month,
      year,
      base_salary: baseSalary,
      overtime,
      allowances,
      deductions,
      net_salary: netSalary,
      currency: activeContract.currency || 'USD',
      generated_at: new Date().toISOString(),
      generated_by: user.id
    };

    // Store payslip
    const { data, error } = await supabase
      .from('payslips')
      .insert(payslip)
      .select()
      .single();

    if (error) {
      log('error', 'generate-payslip', 'Failed to generate payslip', { error: error.message });
      return errorResponse('Failed to generate payslip', 500);
    }

    log('info', 'generate-payslip', 'Payslip generated successfully', { crewMemberId: crew_member_id, month, year });
    return jsonResponse({ success: true, data: data || payslip });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'generate-payslip', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
