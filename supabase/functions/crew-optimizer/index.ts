import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank: string;
  certifications: { certification_code: string; expiry_date: string }[];
  availability_status: string;
  experience_years: number;
  preferred_vessels: string[];
}

interface VoyageRequirement {
  position: string;
  required_certifications: string[];
  min_experience_years: number;
  count: number;
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

    const { 
      voyage_id, 
      vessel_id,
      requirements,
      optimization_criteria 
    } = await req.json();

    if (!vessel_id || !requirements) {
      return errorResponse('Vessel ID and requirements are required', 400);
    }

    // Get available crew members
    const { data: availableCrew, error: crewError } = await supabase
      .from('crew_members')
      .select(`
        id, full_name, position, rank, experience_years, availability_status,
        certifications:crew_certifications(certification_code, expiry_date)
      `)
      .eq('status', 'active')
      .in('availability_status', ['available', 'on_leave_ending_soon']);

    if (crewError) {
      return errorResponse('Failed to fetch crew', 500);
    }

    const now = new Date();
    const voyageRequirements = requirements as VoyageRequirement[];

    // Score and rank crew for each position
    const allocations: Array<{
      position: string;
      allocated_crew: Array<{
        crew_id: string;
        crew_name: string;
        score: number;
        reasons: string[];
      }>;
      unmet_requirements: string[];
    }> = [];

    const usedCrewIds = new Set<string>();

    for (const req of voyageRequirements) {
      const candidatesForPosition = (availableCrew as Array<{ id: string; full_name: string; position: string; rank: string; experience_years: number; availability_status: string; certifications: Array<{ certification_code: string; expiry_date: string }> }>)
        ?.filter((crew) => {
          // Not already assigned
          if (usedCrewIds.has(crew.id)) return false;
          
          // Position match
          if (crew.position?.toLowerCase() !== req.position.toLowerCase()) return false;
          
          return true;
        })
        .map((crew) => {
          let score = 0;
          const reasons: string[] = [];

          // Check certifications
          const crewCerts = (crew.certifications || []) as { certification_code: string; expiry_date: string }[];
          const validCerts = crewCerts.filter(c => new Date(c.expiry_date) > now);
          const certCodes = validCerts.map(c => c.certification_code);
          
          const hasAllCerts = req.required_certifications.every(rc => certCodes.includes(rc));
          if (hasAllCerts) {
            score += 40;
            reasons.push('All required certifications valid');
          } else {
            const missingCerts = req.required_certifications.filter(rc => !certCodes.includes(rc));
            reasons.push(`Missing certifications: ${missingCerts.join(', ')}`);
          }

          // Experience score
          const expYears = crew.experience_years || 0;
          if (expYears >= req.min_experience_years) {
            score += 30;
            reasons.push(`${expYears} years experience meets requirement`);
          }

          // Availability score
          if (crew.availability_status === 'available') {
            score += 20;
            reasons.push('Immediately available');
          }

          // Rank bonus
          if (crew.rank === 'senior' || crew.rank === 'chief') {
            score += 10;
            reasons.push('Senior rank');
          }

          return {
            crew_id: crew.id,
            crew_name: crew.full_name,
            score,
            reasons,
            hasAllCerts
          };
        })
        .sort((a, b) => b.score - a.score) || [];

      // Allocate top candidates
      const allocated = candidatesForPosition
        .filter(c => c.hasAllCerts)
        .slice(0, req.count);

      allocated.forEach(a => usedCrewIds.add(a.crew_id));

      const unmet: string[] = [];
      if (allocated.length < req.count) {
        unmet.push(`Need ${req.count - allocated.length} more ${req.position}(s)`);
      }

      allocations.push({
        position: req.position,
        allocated_crew: allocated.map(a => ({
          crew_id: a.crew_id,
          crew_name: a.crew_name,
          score: a.score,
          reasons: a.reasons
        })),
        unmet_requirements: unmet
      });
    }

    const totalRequired = voyageRequirements.reduce((sum, r) => sum + r.count, 0);
    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_crew.length, 0);
    const optimizationScore = totalRequired > 0 ? (totalAllocated / totalRequired * 100).toFixed(1) : '0';

    // Log optimization
    await supabase.from('ai_decisions').insert({
      title: 'Crew Optimization',
      description: `Optimized crew allocation for voyage`,
      type: 'crew_optimization',
      confidence: parseFloat(optimizationScore) / 100,
      confidence_level: parseFloat(optimizationScore) >= 80 ? 'high' : parseFloat(optimizationScore) >= 50 ? 'medium' : 'low',
      impact: 'medium',
      status: 'completed',
      justification_reasoning: `Allocated ${totalAllocated}/${totalRequired} positions`,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    log('info', 'crew-optimizer', 'Crew optimization completed', { 
      voyageId: voyage_id,
      optimizationScore 
    });

    return jsonResponse({
      success: true,
      voyage_id,
      vessel_id,
      optimization_score: `${optimizationScore}%`,
      allocations,
      summary: {
        total_positions_required: totalRequired,
        total_positions_filled: totalAllocated,
        positions_unfilled: totalRequired - totalAllocated
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'crew-optimizer', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
