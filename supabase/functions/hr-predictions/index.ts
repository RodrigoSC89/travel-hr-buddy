/**
 * HR Predictions AI - Edge Function
 * Predição de turnover e alertas com IA
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch employee data
    const { data: employees, error: empError } = await supabase
      .from('hr_employees')
      .select('*')
      .is('termination_date', null);

    if (empError) throw empError;

    // Fetch payroll data
    const { data: payroll, error: payError } = await supabase
      .from('hr_payroll')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (payError) throw payError;

    // Prepare context for AI analysis
    const stats = {
      totalEmployees: employees?.length || 0,
      departments: {} as Record<string, number>,
      avgSalary: 0,
      highRiskCount: 0,
      recentHires: 0,
      recentTerminations: 0,
    };

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    let totalSalary = 0;
    (employees || []).forEach((emp: Record<string, unknown>) => {
      const dept = (emp.department as string) || 'Outros';
      stats.departments[dept] = (stats.departments[dept] || 0) + 1;
      
      if (emp.base_salary) {
        totalSalary += emp.base_salary as number;
      }

      if (((emp.turnover_risk_score as number) || 0) > 60) {
        stats.highRiskCount++;
      }

      if (emp.hire_date && new Date(emp.hire_date as string) > threeMonthsAgo) {
        stats.recentHires++;
      }
    });

    stats.avgSalary = employees?.length ? totalSalary / employees.length : 0;

    // Call AI for predictions
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um analista de RH com IA especializado em predições.
Analise os dados e retorne um JSON estruturado com alertas e predições.

FORMATO DE RESPOSTA (APENAS JSON, SEM MARKDOWN):
{
  "alerts": [
    {
      "type": "turnover" | "cost" | "satisfaction" | "hiring",
      "severity": "critical" | "high" | "medium",
      "title": "string curta",
      "message": "descrição do problema",
      "impact": "consequência se não agir",
      "actions": ["ação 1", "ação 2"]
    }
  ],
  "predictions": {
    "turnover": {
      "current": number,
      "projected3m": number,
      "trend": "up" | "down" | "stable"
    },
    "headcount": {
      "current": number,
      "projected3m": number,
      "hiresNeeded": number
    },
    "cost": {
      "current": number,
      "projected3m": number,
      "trend": "up" | "down" | "stable"
    }
  },
  "recommendations": ["recomendação 1", "recomendação 2", "recomendação 3"]
}`
          },
          {
            role: "user",
            content: `Analise estes dados de RH e gere alertas e predições:

DADOS DA EMPRESA:
- Total de Colaboradores: ${stats.totalEmployees}
- Salário Médio: R$ ${stats.avgSalary.toFixed(2)}
- Colaboradores de Alto Risco de Saída: ${stats.highRiskCount}
- Contratações últimos 3 meses: ${stats.recentHires}
- Desligamentos últimos 3 meses: ${stats.recentTerminations}

DISTRIBUIÇÃO POR DEPARTAMENTO:
${Object.entries(stats.departments).map(([dept, count]) => `- ${dept}: ${count}`).join('\n')}

DADOS DE FOLHA DE PAGAMENTO:
- Registros no período: ${payroll?.length || 0}
- Custo total mensal estimado: R$ ${(totalSalary * 1.7).toFixed(2)} (inclui encargos)

Gere alertas acionáveis e predições para os próximos 3 meses.`
          }
        ],
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let predictions;
    
    try {
      const content = aiData.choices?.[0]?.message?.content || '{}';
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      predictions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      predictions = {
        alerts: [
          {
            type: "turnover",
            severity: stats.highRiskCount > 5 ? "critical" : "medium",
            title: `${stats.highRiskCount} colaboradores em risco`,
            message: "Colaboradores identificados com alto risco de saída",
            impact: "Perda de talentos e custos de recontratação",
            actions: ["Agendar 1-on-1", "Revisar salários"]
          }
        ],
        predictions: {
          turnover: { current: stats.highRiskCount, projected3m: stats.highRiskCount + 2, trend: "up" },
          headcount: { current: stats.totalEmployees, projected3m: stats.totalEmployees - 2, hiresNeeded: 5 },
          cost: { current: totalSalary * 1.7, projected3m: totalSalary * 1.75, trend: "up" }
        },
        recommendations: [
          "Implementar programa de retenção para colaboradores de alto risco",
          "Revisar política salarial em comparação com mercado",
          "Aumentar frequência de feedbacks 1-on-1"
        ]
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...predictions,
          stats,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("HR Predictions error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
