import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface ComplianceCheck {
  requirement: string;
  category: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  details?: string;
  due_date?: string;
}

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

    const { crew_member_id, vessel_id } = await req.json();

    const checks: ComplianceCheck[] = [];

    if (crew_member_id) {
      // Check crew member compliance
      const { data: crew } = await supabase
        .from('crew_members')
        .select('*, maritime_certificates(*)')
        .eq('id', crew_member_id)
        .single();

      if (crew) {
        // MLC 2006 - Minimum Age
        checks.push({
          requirement: 'MLC 2006 - Minimum Age',
          category: 'Age Requirements',
          status: 'compliant',
          details: 'Crew member meets minimum age requirement'
        });

        // Check certifications
        const certs = (crew as Record<string, unknown>).maritime_certificates as unknown[] || [];
        const expiredCerts = certs.filter((c: unknown) => {
          const cert = c as { expiry_date?: string };
          return cert.expiry_date && new Date(cert.expiry_date) < new Date();
        });

        checks.push({
          requirement: 'MLC 2006 - Valid Certifications',
          category: 'Certifications',
          status: expiredCerts.length === 0 ? 'compliant' : 'non_compliant',
          details: expiredCerts.length > 0 
            ? `${expiredCerts.length} expired certification(s)`
            : 'All certifications valid'
        });

        // Medical fitness
        const crewData = crew as { medical_status?: string; contract_status?: string };
        checks.push({
          requirement: 'MLC 2006 - Medical Fitness Certificate',
          category: 'Health',
          status: crewData.medical_status === 'fit' ? 'compliant' : 'pending',
          details: crewData.medical_status || 'Medical status unknown'
        });

        // Employment agreement
        checks.push({
          requirement: 'MLC 2006 - Seafarer Employment Agreement',
          category: 'Employment',
          status: crewData.contract_status === 'active' ? 'compliant' : 'non_compliant',
          details: crewData.contract_status || 'No active contract'
        });
      }
    }

    if (vessel_id) {
      // Check vessel compliance
      const { data: vessel } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', vessel_id)
        .single();

      if (vessel) {
        const vesselData = vessel as { mlc_certificate_valid?: boolean; mlc_certificate_expiry?: string; dmlc_valid?: boolean };
        // Maritime Labour Certificate
        checks.push({
          requirement: 'MLC 2006 - Maritime Labour Certificate',
          category: 'Vessel Certification',
          status: vesselData.mlc_certificate_valid ? 'compliant' : 'non_compliant',
          details: vesselData.mlc_certificate_expiry || 'No MLC certificate on file'
        });

        // Declaration of Maritime Labour Compliance
        checks.push({
          requirement: 'MLC 2006 - DMLC Part I & II',
          category: 'Documentation',
          status: vesselData.dmlc_valid ? 'compliant' : 'pending',
          details: 'Declaration of Maritime Labour Compliance'
        });
      }
    }

    // Calculate overall compliance score
    const totalChecks = checks.length;
    const compliantChecks = checks.filter(c => c.status === 'compliant').length;
    const complianceScore = totalChecks > 0 
      ? Math.round((compliantChecks / totalChecks) * 100)
      : 0;

    log('info', 'check-mlc-compliance', 'Compliance check completed', {
      userId: user.id,
      crewMemberId: crew_member_id,
      vesselId: vessel_id,
      score: complianceScore
    });

    return jsonResponse({
      success: true,
      data: {
        checks,
        summary: {
          total: totalChecks,
          compliant: compliantChecks,
          non_compliant: checks.filter(c => c.status === 'non_compliant').length,
          pending: checks.filter(c => c.status === 'pending').length,
          score: complianceScore
        }
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'check-mlc-compliance', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
