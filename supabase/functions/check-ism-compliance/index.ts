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

    const { vessel_id } = await req.json();

    if (!vessel_id) {
      return errorResponse('Vessel ID is required', 400);
    }

    // Get vessel info
    const { data: vessel, error: vesselError } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', vessel_id)
      .single();

    if (vesselError || !vessel) {
      return errorResponse('Vessel not found', 404);
    }

    // Get ISM requirements
    const ismRequirements = [
      { code: 'ISM-1', name: 'Safety and Environment Protection Policy', required: true },
      { code: 'ISM-2', name: 'Company Responsibilities and Authority', required: true },
      { code: 'ISM-3', name: 'Designated Person Ashore', required: true },
      { code: 'ISM-4', name: 'Master Responsibility and Authority', required: true },
      { code: 'ISM-5', name: 'Resources and Personnel', required: true },
      { code: 'ISM-6', name: 'Shipboard Operations', required: true },
      { code: 'ISM-7', name: 'Emergency Preparedness', required: true },
      { code: 'ISM-8', name: 'Non-conformities and Corrective Actions', required: true },
      { code: 'ISM-9', name: 'Maintenance of Ship and Equipment', required: true },
      { code: 'ISM-10', name: 'Documentation', required: true },
      { code: 'ISM-11', name: 'Company Verification', required: true },
      { code: 'ISM-12', name: 'Certification and Verification', required: true }
    ];

    // Get vessel's ISM documents and audits
    const { data: ismDocs } = await supabase
      .from('vessel_documents')
      .select('*')
      .eq('vessel_id', vessel_id)
      .eq('document_type', 'ism');

    const { data: ismAudits } = await supabase
      .from('ism_audits')
      .select('*')
      .eq('vessel_id', vessel_id)
      .order('audit_date', { ascending: false })
      .limit(1);

    const findings: Array<{ code: string; name: string; status: string; details: string }> = [];
    let compliantCount = 0;

    for (const req of ismRequirements) {
      const hasDoc = ismDocs?.some((d: { ism_code?: string }) => d.ism_code === req.code);
      if (hasDoc) {
        compliantCount++;
      } else {
        findings.push({
          code: req.code,
          name: req.name,
          status: 'missing',
          details: `ISM requirement ${req.code} documentation not found`
        });
      }
    }

    const complianceScore = Math.round((compliantCount / ismRequirements.length) * 100);
    const lastAudit = ismAudits?.[0];

    const result = {
      vessel_id,
      vessel_name: vessel.name,
      compliance_score: complianceScore,
      is_compliant: complianceScore >= 80,
      total_requirements: ismRequirements.length,
      compliant_count: compliantCount,
      non_compliant_count: findings.length,
      findings,
      last_audit_date: lastAudit?.audit_date || null,
      last_audit_result: lastAudit?.result || null,
      checked_at: new Date().toISOString()
    };

    log('info', 'check-ism-compliance', 'ISM compliance checked', { vesselId: vessel_id, score: complianceScore });
    return jsonResponse({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'check-ism-compliance', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
