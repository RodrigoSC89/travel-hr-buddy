import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface FatigueRisk {
  crew_id: string;
  crew_name: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  hours_worked_24h: number;
  hours_worked_7d: number;
  rest_hours_last_24h: number;
  mlc_compliant: boolean;
  recommendations: string[];
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

    const { vessel_id, crew_id } = await req.json();

    // Get crew members
    let crewQuery = supabase.from('crew_members').select('*');
    if (vessel_id) crewQuery = crewQuery.eq('current_vessel_id', vessel_id);
    if (crew_id) crewQuery = crewQuery.eq('id', crew_id);

    const { data: crewMembers, error: crewError } = await crewQuery;
    if (crewError) {
      return errorResponse('Failed to fetch crew members', 500);
    }

    // Get work hours from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: workLogs } = await supabase
      .from('crew_work_logs')
      .select('*')
      .gte('date', sevenDaysAgo);

    const fatigueAnalysis: FatigueRisk[] = (crewMembers || []).map((crew: any) => {
      const crewLogs = workLogs?.filter((w: any) => w.crew_member_id === crew.id) || [];
      
      // Calculate hours
      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
      
      const hours24h = crewLogs
        .filter((l: any) => new Date(l.date).getTime() > twentyFourHoursAgo)
        .reduce((sum: number, l: any) => sum + (l.hours_worked || 0), 0);
      
      const hours7d = crewLogs.reduce((sum: number, l: any) => sum + (l.hours_worked || 0), 0);
      const rest24h = 24 - hours24h;

      // MLC 2006 compliance: Max 14h/day, Max 72h/week, Min 10h rest/day
      const mlcCompliant = hours24h <= 14 && hours7d <= 72 && rest24h >= 10;

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const recommendations: string[] = [];

      if (hours24h > 16 || rest24h < 6) {
        riskLevel = 'critical';
        recommendations.push('URGENTE: Retirar tripulante do serviço imediatamente');
      } else if (hours24h > 14 || rest24h < 8 || hours7d > 72) {
        riskLevel = 'high';
        recommendations.push('Reduzir carga horária nas próximas 24h');
        recommendations.push('Garantir período mínimo de descanso');
      } else if (hours24h > 12 || hours7d > 60) {
        riskLevel = 'medium';
        recommendations.push('Monitorar carga de trabalho');
      }

      return {
        crew_id: crew.id,
        crew_name: `${crew.first_name} ${crew.last_name}`,
        risk_level: riskLevel,
        hours_worked_24h: hours24h,
        hours_worked_7d: hours7d,
        rest_hours_last_24h: rest24h,
        mlc_compliant: mlcCompliant,
        recommendations
      };
    });

    const criticalCount = fatigueAnalysis.filter(f => f.risk_level === 'critical').length;
    const highCount = fatigueAnalysis.filter(f => f.risk_level === 'high').length;

    log('info', 'crew-fatigue-check', 'Fatigue analysis completed', {
      total: fatigueAnalysis.length,
      critical: criticalCount,
      high: highCount
    });

    return jsonResponse({
      success: true,
      summary: {
        total_analyzed: fatigueAnalysis.length,
        critical_risk: criticalCount,
        high_risk: highCount,
        mlc_violations: fatigueAnalysis.filter(f => !f.mlc_compliant).length
      },
      analysis: fatigueAnalysis
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'crew-fatigue-check', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
