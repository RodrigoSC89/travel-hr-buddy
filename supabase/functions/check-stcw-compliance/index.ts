import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface STCWRequirement {
  code: string;
  name: string;
  required: boolean;
  valid_until?: string;
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

    const { crew_id } = await req.json();

    if (!crew_id) {
      return errorResponse('Crew ID is required', 400);
    }

    // Get crew member with position
    const { data: crew, error: crewError } = await supabase
      .from('crew_members')
      .select('id, full_name, position, rank')
      .eq('id', crew_id)
      .single();

    if (crewError || !crew) {
      return errorResponse('Crew member not found', 404);
    }

    // Get crew certifications
    const { data: certifications } = await supabase
      .from('crew_certifications')
      .select('*')
      .eq('crew_member_id', crew_id);

    // STCW requirements by position
    const stcwRequirements: Record<string, STCWRequirement[]> = {
      'master': [
        { code: 'II/2', name: 'Master Certificate', required: true },
        { code: 'IV/2', name: 'GMDSS Radio Operator', required: true },
        { code: 'VI/1', name: 'Basic Safety Training', required: true },
        { code: 'VI/2', name: 'Proficiency in Survival Craft', required: true },
        { code: 'VI/3', name: 'Advanced Fire Fighting', required: true },
        { code: 'VI/4', name: 'Medical First Aid', required: true },
        { code: 'VI/5', name: 'Ship Security Officer', required: true },
      ],
      'chief_officer': [
        { code: 'II/2', name: 'Chief Mate Certificate', required: true },
        { code: 'VI/1', name: 'Basic Safety Training', required: true },
        { code: 'VI/2', name: 'Proficiency in Survival Craft', required: true },
        { code: 'VI/3', name: 'Advanced Fire Fighting', required: true },
      ],
      'engineer': [
        { code: 'III/2', name: 'Chief Engineer Certificate', required: true },
        { code: 'VI/1', name: 'Basic Safety Training', required: true },
        { code: 'VI/3', name: 'Advanced Fire Fighting', required: true },
      ],
      'default': [
        { code: 'VI/1', name: 'Basic Safety Training', required: true },
      ]
    };

    const position = crew.position?.toLowerCase() || 'default';
    const requirements = stcwRequirements[position] || stcwRequirements['default'];

    const now = new Date();
    const complianceResults = requirements.map(req => {
      const cert = certifications?.find((c: { certification_code?: string; certification_name?: string; expiry_date: string }) => 
        c.certification_code === req.code || 
        c.certification_name?.includes(req.name)
      );

      let status = 'missing';
      let daysUntilExpiry = null;

      if (cert) {
        const expiryDate = new Date(cert.expiry_date);
        daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 90) {
          status = 'expiring_soon';
        } else {
          status = 'valid';
        }
      }

      return {
        requirement: req,
        status,
        certification: cert,
        days_until_expiry: daysUntilExpiry
      };
    });

    const isCompliant = complianceResults.every(r => r.status === 'valid');
    const violations = complianceResults.filter(r => r.status !== 'valid');

    log('info', 'check-stcw-compliance', 'STCW compliance checked', { 
      crewId: crew_id, 
      isCompliant,
      violationsCount: violations.length 
    });

    return jsonResponse({
      success: true,
      crew_id,
      crew_name: crew.full_name,
      position: crew.position,
      is_compliant: isCompliant,
      compliance_results: complianceResults,
      violations,
      checked_at: new Date().toISOString()
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'check-stcw-compliance', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
