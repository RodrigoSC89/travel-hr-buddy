/**
 * Universal AI Search Edge Function
 * PATCH 1000 - Busca inteligente com Lovable AI (Gemini)
 * 
 * Endpoints:
 * - search: Busca semântica em rotas, documentos e ações
 * - suggest: Sugestões contextuais baseadas na tela atual
 * - analyze: Análise contextual para painel lateral de IA
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "AI-SEARCH";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rotas do sistema para busca
const SYSTEM_ROUTES = [
  { path: "/dashboard", label: "Dashboard Principal", category: "navegação", keywords: ["inicio", "home", "painel"] },
  { path: "/nautilus-command", label: "Centro de Comando Nautilus", category: "navegação", keywords: ["comando", "ai", "inteligencia"] },
  { path: "/fleet-ai", label: "Frota Inteligente", category: "navegação", keywords: ["navios", "embarcacoes", "vessels"] },
  { path: "/crew-command", label: "Tripulação", category: "navegação", keywords: ["tripulantes", "marinheiros", "rh"] },
  { path: "/maintenance-command", label: "Manutenção", category: "navegação", keywords: ["manutencao", "ordens", "servico"] },
  { path: "/documents", label: "Documentos", category: "navegação", keywords: ["docs", "arquivos", "certificados"] },
  { path: "/reports-command", label: "Relatórios", category: "navegação", keywords: ["relatorios", "reports", "analytics"] },
  { path: "/esg-command", label: "ESG & Sustentabilidade", category: "navegação", keywords: ["esg", "sustentabilidade", "meio ambiente"] },
  { path: "/safety-command", label: "Segurança", category: "navegação", keywords: ["seguranca", "safety", "solas"] },
  { path: "/audit-command", label: "Auditorias", category: "navegação", keywords: ["auditoria", "ism", "compliance"] },
  { path: "/voyage", label: "Viagens", category: "navegação", keywords: ["viagem", "voyage", "rota"] },
  { path: "/training", label: "Treinamentos", category: "navegação", keywords: ["treinamento", "capacitacao", "curso"] },
  { path: "/settings", label: "Configurações", category: "configuração", keywords: ["config", "preferencias", "ajustes"] },
];

// Ações rápidas disponíveis
const QUICK_ACTIONS = [
  { id: "new-maintenance", label: "Criar Ordem de Serviço", category: "ação", route: "/maintenance-command?action=new" },
  { id: "new-document", label: "Upload de Documento", category: "ação", route: "/documents?action=upload" },
  { id: "new-crew", label: "Cadastrar Tripulante", category: "ação", route: "/crew-command?action=new" },
  { id: "new-voyage", label: "Nova Viagem", category: "ação", route: "/voyage?action=new" },
  { id: "run-audit", label: "Iniciar Auditoria", category: "ação", route: "/audit-command?action=new" },
  { id: "generate-report", label: "Gerar Relatório", category: "ação", route: "/reports-command?action=generate" },
  { id: "view-alerts", label: "Ver Alertas Ativos", category: "ação", route: "/nautilus-command?tab=alerts" },
  { id: "ai-analysis", label: "Análise com IA", category: "ação", route: "/nautilus-command?tab=ai" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, query, context, currentRoute } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Initialize Supabase client for data enrichment
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (type) {
      case "search":
        return await handleSearch(query, LOVABLE_API_KEY, supabase);
      
      case "suggest":
        return await handleSuggest(context, currentRoute, LOVABLE_API_KEY, supabase);
      
      case "analyze":
        return await handleAnalyze(context, currentRoute, LOVABLE_API_KEY, supabase);
      
      default:
        throw new Error(`Unknown type: ${type}`);
    }

  } catch (error) {
    console.error("[Universal-AI-Search] Error:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Handle semantic search with AI
 */
async function handleSearch(query: string, apiKey: string, supabase: any) {
  // First, do local matching for fast results
  const localResults = searchLocal(query);
  
  // If query is complex, enhance with AI
  const isComplexQuery = query.split(" ").length > 2 || 
                         query.includes("?") || 
                         /como|onde|qual|quando|porque/i.test(query);
  
  let aiSuggestion = null;
  
  if (isComplexQuery) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "system", 
              content: `Você é um assistente de busca para o sistema Nautilus One (gestão marítima).
Analise a consulta do usuário e sugira a melhor rota ou ação.
Responda em JSON: { "intent": "navigation|action|info", "route": "/path", "label": "descrição", "explanation": "breve explicação" }
Rotas disponíveis: ${SYSTEM_ROUTES.map(r => r.path).join(", ")}` 
            },
            { role: "user", content: query }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        try {
          aiSuggestion = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
        } catch {
          aiSuggestion = { explanation: content };
        }
      }
    } catch (e) {
      edgeLogger.warn(TAG, "AI enhancement failed", { error: String(e) });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    results: localResults,
    aiSuggestion,
    query
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Local search without AI (fast)
 */
function searchLocal(query: string) {
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const results: Array<{ type: string; label: string; path: string; score: number; category: string }> = [];

  // Search routes
  for (const route of SYSTEM_ROUTES) {
    const labelNorm = route.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const keywordsNorm = route.keywords.map(k => k.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    
    let score = 0;
    if (labelNorm.includes(normalizedQuery)) score += 10;
    if (keywordsNorm.some(k => k.includes(normalizedQuery))) score += 5;
    if (route.path.includes(normalizedQuery)) score += 3;
    
    if (score > 0) {
      results.push({
        type: "route",
        label: route.label,
        path: route.path,
        score,
        category: route.category
      });
    }
  }

  // Search actions
  for (const action of QUICK_ACTIONS) {
    const labelNorm = action.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (labelNorm.includes(normalizedQuery)) {
      results.push({
        type: "action",
        label: action.label,
        path: action.route,
        score: 8,
        category: action.category
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

/**
 * Handle contextual suggestions for AI panel
 */
async function handleSuggest(context: any, currentRoute: string, apiKey: string, supabase: any) {
  // Fetch relevant data based on current route
  let enrichedContext = { ...context, route: currentRoute };
  
  try {
    // Get active alerts count
    const { count: alertCount } = await supabase
      .from("intelligent_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    
    enrichedContext.activeAlerts = alertCount || 0;

    // Get pending maintenance
    const { count: pendingMaintenance } = await supabase
      .from("maintenance_orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    
    enrichedContext.pendingMaintenance = pendingMaintenance || 0;

  } catch (e) {
    edgeLogger.warn(TAG, "Data enrichment failed", { error: String(e) });
  }

  // Generate contextual suggestions
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: `Você é um assistente proativo do Nautilus One (gestão marítima).
Baseado no contexto atual, sugira 3-5 ações relevantes.
Contexto: ${JSON.stringify(enrichedContext)}
Responda em JSON: { "suggestions": [{ "title": "...", "description": "...", "action": "navigate|analyze|report", "route": "/path" }] }` 
        },
        { role: "user", content: "Quais ações você sugere agora?" }
      ],
      temperature: 0.5,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  let suggestions = [];
  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
    suggestions = parsed.suggestions || [];
  } catch {
    suggestions = [{ title: "Análise geral", description: content, action: "info" }];
  }

  return new Response(JSON.stringify({
    success: true,
    suggestions,
    context: enrichedContext
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Handle deep contextual analysis for AI panel
 */
async function handleAnalyze(context: any, currentRoute: string, apiKey: string, supabase: any) {
  // Build comprehensive context
  const analysisContext = {
    route: currentRoute,
    timestamp: new Date().toISOString(),
    ...context
  };

  // Fetch route-specific data
  try {
    if (currentRoute.includes("maintenance")) {
      const { data: orders } = await supabase
        .from("maintenance_orders")
        .select("status, priority, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      analysisContext.recentOrders = orders;
    }

    if (currentRoute.includes("crew") || currentRoute.includes("tripula")) {
      const { count: crewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });
      analysisContext.totalCrew = crewCount;
    }

    if (currentRoute.includes("fleet") || currentRoute.includes("vessel")) {
      const { data: vessels } = await supabase
        .from("vessels")
        .select("name, status, current_location")
        .limit(5);
      analysisContext.vessels = vessels;
    }
  } catch (e) {
    edgeLogger.warn(TAG, "Data fetch failed", { error: String(e) });
  }

  // Generate analysis
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: `Você é um analista operacional do Nautilus One (sistema de gestão marítima).
Analise o contexto atual e forneça insights acionáveis.
Contexto: ${JSON.stringify(analysisContext)}

Responda em JSON:
{
  "summary": "resumo da situação atual",
  "insights": [{ "type": "info|warning|success", "message": "..." }],
  "recommendations": ["ação 1", "ação 2"],
  "metrics": { "key": "value" }
}` 
        },
        { role: "user", content: "Analise a situação atual e dê recomendações." }
      ],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  let analysis = {};
  try {
    analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
  } catch {
    analysis = { summary: content, insights: [], recommendations: [] };
  }

  return new Response(JSON.stringify({
    success: true,
    analysis,
    context: analysisContext,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
