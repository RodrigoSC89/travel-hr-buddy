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

    const url = new URL(req.url);
    const organization_id = url.searchParams.get('organization_id');
    const vessel_id = url.searchParams.get('vessel_id');

    if (!organization_id) {
      return errorResponse('Organization ID is required', 400);
    }

    // Get all crew members with their certifications and qualifications
    let query = supabase
      .from('crew_members')
      .select(`
        id,
        full_name,
        position,
        rank,
        crew_certifications (
          certification_code,
          certification_name,
          expiry_date,
          status
        ),
        crew_qualifications (
          skill_name,
          skill_level,
          years_experience
        )
      `)
      .eq('organization_id', organization_id)
      .eq('status', 'active');

    if (vessel_id) {
      query = query.eq('current_vessel_id', vessel_id);
    }

    const { data: crewMembers, error } = await query;

    if (error) {
      log('error', 'crew-skills-matrix', 'Failed to fetch crew data', { error: error.message });
      return errorResponse('Failed to fetch crew data', 500);
    }

    // Define skill categories
    const skillCategories = [
      'Navigation',
      'Engineering',
      'Safety',
      'Communication',
      'Leadership',
      'Technical'
    ];

    // Build matrix
    interface SkillMatrixEntry {
      crew_member_id: string;
      full_name: string;
      position: string;
      rank: string;
      certifications: number;
      valid_certifications: number;
      skills: Record<string, number>;
      overall_competency: number;
    }

    const matrix: SkillMatrixEntry[] = [];

    for (const crew of crewMembers || []) {
      const skills: Record<string, number> = {};
      
      for (const category of skillCategories) {
        // Calculate skill level based on qualifications
        const relevantQuals = (crew.crew_qualifications || [])
          .filter((q: { skill_name: string }) => q.skill_name?.toLowerCase().includes(category.toLowerCase()));
        
        if (relevantQuals.length > 0) {
          const avgLevel = relevantQuals.reduce((sum: number, q: { skill_level: number }) => sum + (q.skill_level || 0), 0) / relevantQuals.length;
          skills[category] = Math.round(avgLevel);
        } else {
          skills[category] = 0;
        }
      }

      // Count valid certifications
      const validCerts = (crew.crew_certifications || [])
        .filter((c: { status: string; expiry_date: string }) => c.status === 'valid' && new Date(c.expiry_date) > new Date());

      matrix.push({
        crew_member_id: crew.id,
        full_name: crew.full_name,
        position: crew.position,
        rank: crew.rank,
        certifications: crew.crew_certifications?.length || 0,
        valid_certifications: validCerts.length,
        skills,
        overall_competency: Math.round(
          Object.values(skills).reduce((sum, val) => sum + val, 0) / skillCategories.length
        )
      });
    }

    // Calculate organization-wide skill gaps
    const skillGaps: Array<{ skill: string; average_level: number; gap: string }> = [];
    for (const category of skillCategories) {
      const avgLevel = matrix.length > 0
        ? matrix.reduce((sum, m) => sum + (m.skills[category] || 0), 0) / matrix.length
        : 0;
      
      if (avgLevel < 3) {
        skillGaps.push({
          skill: category,
          average_level: Math.round(avgLevel * 10) / 10,
          gap: avgLevel < 2 ? 'critical' : 'moderate'
        });
      }
    }

    log('info', 'crew-skills-matrix', 'Skills matrix generated', { 
      crewCount: matrix.length,
      skillGapsCount: skillGaps.length 
    });

    return jsonResponse({
      success: true,
      data: {
        organization_id,
        vessel_id,
        skill_categories: skillCategories,
        matrix,
        skill_gaps: skillGaps,
        summary: {
          total_crew: matrix.length,
          avg_certifications: matrix.length > 0 
            ? Math.round(matrix.reduce((sum, m) => sum + m.valid_certifications, 0) / matrix.length)
            : 0,
          avg_competency: matrix.length > 0
            ? Math.round(matrix.reduce((sum, m) => sum + m.overall_competency, 0) / matrix.length)
            : 0
        },
        generated_at: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'crew-skills-matrix', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
