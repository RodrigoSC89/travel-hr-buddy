import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrossModuleRequest {
  analysisType: 'correlation' | 'predictive_alerts' | 'fleet_optimization' | 'unified_analytics';
  vesselId?: string;
  timeRange?: string;
  modules?: string[];
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { analysisType, vesselId, timeRange, modules }: CrossModuleRequest = await req.json();
    console.log(`[CROSS-MODULE] Analysis: ${analysisType}, vessel: ${vesselId || 'all'}`);

    // Fetch cross-module data in parallel
    const [vessels, crewMembers, maintenanceJobs, inspections, incidents] = await Promise.all([
      supabase.from('vessels').select('id, name, status, vessel_type, flag, imo_number').limit(20),
      supabase.from('crew_members').select('id, first_name, last_name, rank, status, vessel_id').limit(100),
      supabase.from('maintenance_jobs').select('id, title, status, priority, vessel_id, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('psc_inspections').select('id, vessel_id, port_name, country, status, detention_risk_score, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('safety_incidents').select('id, title, severity, status, vessel_id, created_at').order('created_at', { ascending: false }).limit(30),
    ]);

    const contextData = {
      vessels: vessels.data || [],
      crew: crewMembers.data || [],
      maintenance: maintenanceJobs.data || [],
      inspections: inspections.data || [],
      incidents: incidents.data || [],
    };

    const prompts: Record<string, string> = {
      correlation: `Analise as correlações entre os módulos operacionais marítimos:

Frota: ${JSON.stringify(contextData.vessels.slice(0, 10))}
Tripulação: ${contextData.crew.length} membros
Manutenção: ${contextData.maintenance.length} jobs (${contextData.maintenance.filter((j: any) => j.priority === 'critical').length} críticos)
Inspeções PSC: ${contextData.inspections.length} registros
Incidentes: ${contextData.incidents.length} registros

Forneça:
1. Correlações identificadas entre módulos (crew → maintenance, compliance → safety)
2. Padrões ocultos que afetam múltiplos módulos
3. Embarcações com maior concentração de riscos cruzados
4. Score de interdependência por módulo (0-100)
5. Recomendações de ação integrada`,

      predictive_alerts: `Gere alertas preditivos cruzando dados de múltiplos módulos:

Dados: ${JSON.stringify({
  vesselCount: contextData.vessels.length,
  crewCount: contextData.crew.length,
  criticalMaintenance: contextData.maintenance.filter((j: any) => j.priority === 'critical').length,
  pendingInspections: contextData.inspections.filter((i: any) => i.status === 'pending').length,
  openIncidents: contextData.incidents.filter((i: any) => i.status === 'open').length,
})}

Manutenção recente: ${JSON.stringify(contextData.maintenance.slice(0, 10))}
Inspeções: ${JSON.stringify(contextData.inspections.slice(0, 5))}

Forneça alertas em formato JSON:
1. Lista de alertas preditivos com: tipo, severidade (critical/high/medium/low), módulos afetados, embarcação, descrição, ação recomendada, probabilidade (0-100), prazo estimado
2. Score geral de risco da operação (0-100)
3. Top 3 riscos emergentes que cruzam módulos`,

      fleet_optimization: `Otimize a operação da frota integrando todos os módulos:

Frota: ${JSON.stringify(contextData.vessels)}
Manutenção pendente: ${JSON.stringify(contextData.maintenance.filter((j: any) => j.status === 'pending').slice(0, 15))}
Tripulação por embarcação: ${JSON.stringify(contextData.crew.reduce((acc: any, c: any) => { acc[c.vessel_id] = (acc[c.vessel_id] || 0) + 1; return acc; }, {}))}

Forneça:
1. Ranking de saúde operacional por embarcação
2. Recomendações de realocação de recursos
3. Janelas de oportunidade para manutenção preventiva
4. Economia estimada com otimização integrada
5. Plano de ação para próximos 30 dias`,

      unified_analytics: `Gere um relatório unificado de analytics cruzando todos os módulos:

Resumo operacional:
- ${contextData.vessels.length} embarcações
- ${contextData.crew.length} tripulantes
- ${contextData.maintenance.length} jobs de manutenção
- ${contextData.inspections.length} inspeções PSC
- ${contextData.incidents.length} incidentes de segurança

Detalhamento:
${JSON.stringify({
  vesselsByStatus: contextData.vessels.reduce((acc: any, v: any) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; }, {}),
  maintenanceByPriority: contextData.maintenance.reduce((acc: any, j: any) => { acc[j.priority] = (acc[j.priority] || 0) + 1; return acc; }, {}),
  incidentsBySeverity: contextData.incidents.reduce((acc: any, i: any) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {}),
})}

Forneça:
1. Executive Summary (KPIs integrados)
2. Tendências por módulo
3. Benchmarking vs padrões da indústria
4. Score de maturidade operacional (0-10)
5. Recomendações estratégicas priorizadas`,
    };

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'Você é um analista sênior de operações marítimas especializado em inteligência integrada cross-module. Forneça análises quantitativas, acionáveis e baseadas em dados reais. Priorize segurança, compliance e eficiência operacional.' },
          { role: 'user', content: prompts[analysisType] },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit excedido.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: 'Créditos esgotados.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!aiResponse.ok) throw new Error(`AI API error: ${aiResponse.status}`);

    const data = await aiResponse.json();
    const analysis = data.choices[0].message.content;

    console.log(`[CROSS-MODULE] ${analysisType} completed successfully`);

    return new Response(JSON.stringify({
      analysisType,
      analysis,
      summary: {
        vesselCount: contextData.vessels.length,
        crewCount: contextData.crew.length,
        maintenanceCount: contextData.maintenance.length,
        inspectionCount: contextData.inspections.length,
        incidentCount: contextData.incidents.length,
      },
      generatedAt: new Date().toISOString(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[CROSS-MODULE] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
