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

    const { voyage_id } = await req.json();

    if (!voyage_id) {
      return errorResponse('Voyage ID is required', 400);
    }

    // Get voyage details
    const { data: voyage, error: voyageError } = await supabase
      .from('voyages')
      .select('*, vessels(*)')
      .eq('id', voyage_id)
      .single();

    if (voyageError || !voyage) {
      return errorResponse('Voyage not found', 404);
    }

    // Get assigned crew
    const { data: crewAssignments } = await supabase
      .from('voyage_crew_assignments')
      .select('*, crew_members(*, crew_certifications(*))')
      .eq('voyage_id', voyage_id);

    // Risk factors
    const riskFactors: Array<{ category: string; factor: string; risk_level: string; score: number; mitigation: string }> = [];
    let totalScore = 0;

    // Weather risk (would integrate with weather API)
    riskFactors.push({
      category: 'Weather',
      factor: 'Weather conditions',
      risk_level: 'medium',
      score: 30,
      mitigation: 'Monitor weather forecasts regularly'
    });
    totalScore += 30;

    // Crew competency risk
    const crewCount = crewAssignments?.length || 0;
    if (crewCount < 5) {
      riskFactors.push({
        category: 'Manning',
        factor: 'Low crew count',
        risk_level: 'high',
        score: 40,
        mitigation: 'Ensure adequate crew assignments'
      });
      totalScore += 40;
    } else {
      riskFactors.push({
        category: 'Manning',
        factor: 'Crew complement',
        risk_level: 'low',
        score: 10,
        mitigation: 'Maintain current manning levels'
      });
      totalScore += 10;
    }

    // Vessel condition
    const vessel = voyage.vessels;
    if (vessel) {
      const vesselAge = vessel.build_year ? new Date().getFullYear() - vessel.build_year : 0;
      if (vesselAge > 20) {
        riskFactors.push({
          category: 'Vessel',
          factor: 'Vessel age',
          risk_level: 'high',
          score: 35,
          mitigation: 'Conduct thorough pre-departure inspection'
        });
        totalScore += 35;
      } else {
        riskFactors.push({
          category: 'Vessel',
          factor: 'Vessel condition',
          risk_level: 'low',
          score: 10,
          mitigation: 'Follow standard maintenance schedule'
        });
        totalScore += 10;
      }
    }

    // Route risk
    riskFactors.push({
      category: 'Navigation',
      factor: 'Route complexity',
      risk_level: 'medium',
      score: 25,
      mitigation: 'Ensure updated charts and navigation equipment'
    });
    totalScore += 25;

    // Calculate overall risk
    const avgScore = totalScore / riskFactors.length;
    let overallRisk = 'low';
    if (avgScore > 35) overallRisk = 'high';
    else if (avgScore > 25) overallRisk = 'medium';

    const assessment = {
      voyage_id,
      voyage_details: {
        origin: voyage.origin_port,
        destination: voyage.destination_port,
        departure_date: voyage.departure_date
      },
      risk_factors: riskFactors,
      overall_risk_level: overallRisk,
      overall_risk_score: Math.round(avgScore),
      assessed_at: new Date().toISOString(),
      assessed_by: user.id,
      recommendations: riskFactors
        .filter(f => f.risk_level !== 'low')
        .map(f => f.mitigation)
    };

    // Store assessment
    await supabase.from('voyage_risk_assessments').insert({
      voyage_id,
      risk_score: Math.round(avgScore),
      risk_level: overallRisk,
      factors: riskFactors,
      assessed_by: user.id,
      assessed_at: new Date().toISOString()
    });

    log('info', 'voyage-risk-assessment', 'Risk assessment completed', { 
      voyageId: voyage_id, 
      riskLevel: overallRisk 
    });

    return jsonResponse({ success: true, data: assessment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'voyage-risk-assessment', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
