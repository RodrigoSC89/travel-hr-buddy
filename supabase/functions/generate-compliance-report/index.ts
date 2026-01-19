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

    const { organization_id, report_type, date_from, date_to } = await req.json();

    // Get all crew members
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select(`
        id, full_name, position, status,
        certifications:crew_certifications(*)
      `)
      .eq('organization_id', organization_id)
      .eq('status', 'active');

    // Get vessels
    const { data: vessels } = await supabase
      .from('vessels')
      .select('id, name, imo_number, status')
      .eq('organization_id', organization_id);

    const now = new Date();
    
    // Calculate compliance metrics
    const crewCompliance = crewMembers?.map((crew: { id: string; full_name: string; position: string; status: string; certifications: Array<{ expiry_date: string }> }) => {
      const certs = crew.certifications || [];
      const expiredCerts = certs.filter((c: { expiry_date: string }) => new Date(c.expiry_date) < now);
      const expiringSoon = certs.filter((c: { expiry_date: string }) => {
        const expiry = new Date(c.expiry_date);
        const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 90;
      });

      return {
        crew_id: crew.id,
        crew_name: crew.full_name,
        position: crew.position,
        total_certifications: certs.length,
        expired_certifications: expiredCerts.length,
        expiring_soon: expiringSoon.length,
        compliance_status: expiredCerts.length === 0 ? 'compliant' : 'non_compliant'
      };
    }) || [];

    const compliantFiltered = crewCompliance.filter((c: { compliance_status: string }) => c.compliance_status === 'compliant');
    const totalCrew = crewCompliance.length;
    const compliantCrew = compliantFiltered.length;
    const complianceRate = totalCrew > 0 ? (compliantCrew / totalCrew * 100).toFixed(2) : 0;

    const report = {
      report_type: report_type || 'full_compliance',
      generated_at: new Date().toISOString(),
      period: {
        from: date_from,
        to: date_to
      },
      summary: {
        total_crew: totalCrew,
        compliant_crew: compliantCrew,
        non_compliant_crew: totalCrew - compliantCrew,
        compliance_rate: `${complianceRate}%`,
        total_vessels: vessels?.length || 0
      },
      crew_compliance: crewCompliance,
      vessels: vessels,
      recommendations: generateRecommendations(crewCompliance)
    };

    // Store report
    await supabase.from('compliance_reports').insert({
      organization_id,
      report_type,
      report_data: report,
      generated_by: user.id,
      created_at: new Date().toISOString()
    });

    log('info', 'generate-compliance-report', 'Report generated', { 
      organizationId: organization_id,
      complianceRate 
    });

    return jsonResponse({ success: true, report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'generate-compliance-report', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});

interface CrewComplianceItem {
  crew_name: string;
  expired_certifications: number;
  expiring_soon: number;
}

function generateRecommendations(crewCompliance: CrewComplianceItem[]): string[] {
  const recommendations: string[] = [];
  
  const nonCompliant = crewCompliance.filter(c => c.expired_certifications > 0);
  if (nonCompliant.length > 0) {
    recommendations.push(`Immediate action required: ${nonCompliant.length} crew member(s) have expired certifications.`);
  }

  const expiringSoon = crewCompliance.filter(c => c.expiring_soon > 0);
  if (expiringSoon.length > 0) {
    recommendations.push(`Schedule renewal: ${expiringSoon.length} crew member(s) have certifications expiring within 90 days.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('All crew members are fully compliant. Continue monitoring certification expiry dates.');
  }

  return recommendations;
}
