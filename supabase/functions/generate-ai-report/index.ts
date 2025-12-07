import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  type: "hr" | "financial" | "operational" | "analytics" | "custom";
  dateRange: { start: string; end: string };
  modules?: string[];
  format: "detailed" | "summary" | "executive";
  customPrompt?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, dateRange, modules = [], format, customPrompt }: ReportRequest = await req.json();
    
    console.log(`[generate-ai-report] Generating ${type} report for ${dateRange.start} to ${dateRange.end}`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Collect data based on report type
    const reportData: Record<string, unknown> = {
      period: { start: dateRange.start, end: dateRange.end },
      generatedAt: new Date().toISOString(),
    };
    
    // HR Data Collection
    if (type === "hr" || modules.includes("hr")) {
      console.log("[generate-ai-report] Collecting HR data...");
      
      const { data: certificates } = await supabase
        .from("certificates")
        .select("*")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, role, created_at");

      const { data: crewMembers } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, status, department");

      const expiringCertificates = certificates?.filter((cert: { expiry_date: string }) => 
        new Date(cert.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ) || [];

      reportData.hr = {
        totalEmployees: (profiles?.length || 0) + (crewMembers?.length || 0),
        totalCertificates: certificates?.length || 0,
        expiringCertificates: expiringCertificates.length,
        certificatesList: expiringCertificates.slice(0, 10),
        crewByStatus: crewMembers?.reduce((acc: Record<string, number>, crew: any) => {
          acc[crew.status || 'unknown'] = (acc[crew.status || 'unknown'] || 0) + 1;
          return acc;
        }, {}) || {},
        crewByDepartment: crewMembers?.reduce((acc: Record<string, number>, crew: any) => {
          acc[crew.department || 'Não definido'] = (acc[crew.department || 'Não definido'] || 0) + 1;
          return acc;
        }, {}) || {}
      };
    }

    // Analytics Data Collection
    if (type === "analytics" || modules.includes("analytics")) {
      console.log("[generate-ai-report] Collecting Analytics data...");
      
      const { data: priceAlerts } = await supabase
        .from("price_alerts")
        .select("*")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);

      const { data: aiInsights } = await supabase
        .from("ai_insights")
        .select("*")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .limit(20);

      const { data: analyticsEvents } = await supabase
        .from("analytics_events")
        .select("event_name, event_category, created_at")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .limit(100);

      const eventsByCategory = analyticsEvents?.reduce((acc: Record<string, number>, event: any) => {
        acc[event.event_category || 'other'] = (acc[event.event_category || 'other'] || 0) + 1;
        return acc;
      }, {}) || {};

      reportData.analytics = {
        totalPriceAlerts: priceAlerts?.length || 0,
        activePriceAlerts: priceAlerts?.filter((a: any) => a.is_active)?.length || 0,
        triggeredAlerts: priceAlerts?.filter((a: any) => a.triggered_count > 0)?.length || 0,
        aiInsightsGenerated: aiInsights?.length || 0,
        insightsByCategory: aiInsights?.reduce((acc: Record<string, number>, insight: any) => {
          acc[insight.category || 'general'] = (acc[insight.category || 'general'] || 0) + 1;
          return acc;
        }, {}) || {},
        totalEvents: analyticsEvents?.length || 0,
        eventsByCategory,
        topInsights: aiInsights?.slice(0, 5).map((i: any) => ({
          title: i.title,
          category: i.category,
          priority: i.priority
        })) || []
      };
    }

    // Operational Data Collection
    if (type === "operational" || modules.includes("operational")) {
      console.log("[generate-ai-report] Collecting Operational data...");
      
      const { data: maintenanceJobs } = await supabase
        .from("mmi_maintenance_jobs")
        .select("id, title, status, priority, created_at")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);

      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, status");

      const { data: scheduledTasks } = await supabase
        .from("scheduled_tasks")
        .select("id, title, status, created_at")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);

      reportData.operational = {
        totalMaintenanceJobs: maintenanceJobs?.length || 0,
        jobsByStatus: maintenanceJobs?.reduce((acc: Record<string, number>, job: any) => {
          acc[job.status || 'pending'] = (acc[job.status || 'pending'] || 0) + 1;
          return acc;
        }, {}) || {},
        jobsByPriority: maintenanceJobs?.reduce((acc: Record<string, number>, job: any) => {
          acc[job.priority || 'medium'] = (acc[job.priority || 'medium'] || 0) + 1;
          return acc;
        }, {}) || {},
        totalVessels: vessels?.length || 0,
        vesselsByStatus: vessels?.reduce((acc: Record<string, number>, vessel: any) => {
          acc[vessel.status || 'active'] = (acc[vessel.status || 'active'] || 0) + 1;
          return acc;
        }, {}) || {},
        totalScheduledTasks: scheduledTasks?.length || 0,
        taskCompletionRate: scheduledTasks?.length > 0 
          ? Math.round((scheduledTasks.filter((t: any) => t.status === 'completed').length / scheduledTasks.length) * 100) 
          : 0
      };
    }

    // Generate AI Report using Lovable AI Gateway
    const systemPrompt = getSystemPrompt(type, format);
    const userPrompt = generateUserPrompt(reportData, type, dateRange, customPrompt);

    console.log("[generate-ai-report] Calling Lovable AI Gateway...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[generate-ai-report] AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Limite de requisições excedido. Aguarde alguns minutos.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Créditos de IA insuficientes. Adicione créditos ao workspace.");
      }
      throw new Error(`Erro na geração do relatório: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedReport = aiData.choices?.[0]?.message?.content || "Erro ao gerar conteúdo do relatório.";

    console.log("[generate-ai-report] AI response received, saving to database...");

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from("ai_reports")
      .insert({
        type,
        title: `Relatório ${getTypeLabel(type)} - ${new Date().toLocaleDateString("pt-BR")}`,
        content: generatedReport,
        format,
        date_range_start: dateRange.start,
        date_range_end: dateRange.end,
        modules,
        raw_data: reportData,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error("[generate-ai-report] Error saving report:", saveError);
    }

    console.log("[generate-ai-report] Report generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      report: {
        id: savedReport?.id,
        content: generatedReport,
        type,
        format,
        generatedAt: new Date().toISOString(),
        dataPoints: Object.keys(reportData).length,
        rawData: reportData
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[generate-ai-report] Error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao gerar relatório"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hr: "Recursos Humanos",
    financial: "Financeiro",
    operational: "Operacional",
    analytics: "Analytics",
    custom: "Personalizado"
  };
  return labels[type] || type;
}

function getSystemPrompt(type: string, format: string): string {
  const formatGuidelines: Record<string, string> = {
    detailed: "Forneça uma análise detalhada e completa com insights profundos, métricas detalhadas e recomendações específicas. Use tabelas markdown quando apropriado.",
    summary: "Crie um resumo executivo conciso com os pontos principais, métricas chave e insights mais importantes.",
    executive: "Foque em insights estratégicos de alto nível adequados para executivos e tomadores de decisão. Seja direto e objetivo."
  };

  const typeGuidelines: Record<string, string> = {
    hr: "Analise dados de recursos humanos incluindo certificações, status da tripulação, treinamentos e competências. Identifique riscos relacionados a certificações vencendo e sugira ações preventivas.",
    financial: "Foque em métricas financeiras, custos operacionais, ROI e indicadores econômicos. Identifique oportunidades de economia.",
    operational: "Analise eficiência operacional, performance de manutenção, status de embarcações e tarefas agendadas. Identifique gargalos e sugira melhorias.",
    analytics: "Analise padrões de uso, alertas de preço, insights gerados e eventos do sistema. Identifique tendências e anomalias.",
    custom: "Adapte a análise conforme solicitado pelo usuário, mantendo profissionalismo e objetividade."
  };

  return `Você é um especialista em análise de dados marítimos e geração de relatórios corporativos para o setor naval/offshore.

DIRETRIZES DE FORMATO:
${formatGuidelines[format] || formatGuidelines.detailed}

FOCO DO RELATÓRIO:
${typeGuidelines[type] || typeGuidelines.custom}

ESTRUTURA OBRIGATÓRIA:
1. **Resumo Executivo** - Visão geral em 2-3 parágrafos
2. **Principais Métricas** - Números chave em formato de lista
3. **Análise Detalhada** - Insights baseados nos dados
4. **Tendências Identificadas** - Padrões observados
5. **Alertas e Riscos** - Pontos de atenção
6. **Recomendações** - Ações sugeridas com prioridade
7. **Próximos Passos** - Ações imediatas recomendadas

REGRAS:
- Use português brasileiro formal
- Seja objetivo e baseie-se nos dados fornecidos
- Use formatação Markdown
- Inclua percentuais e comparações quando possível
- Destaque KPIs críticos
- Forneça insights acionáveis`;
}

function generateUserPrompt(data: Record<string, unknown>, type: string, dateRange: { start: string; end: string }, customPrompt?: string): string {
  return `Gere um relatório profissional baseado nos seguintes dados:

**Período de Análise:** ${dateRange.start} a ${dateRange.end}
**Tipo de Relatório:** ${getTypeLabel(type)}

**Dados Coletados:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

${customPrompt ? `**Instruções Personalizadas do Usuário:** ${customPrompt}` : ""}

Por favor, analise estes dados e gere um relatório completo, profissional e com insights relevantes para tomada de decisão.`;

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      hr: "Recursos Humanos",
      financial: "Financeiro", 
      operational: "Operacional",
      analytics: "Analytics",
      custom: "Personalizado"
    };
    return labels[type] || type;
  }
}
