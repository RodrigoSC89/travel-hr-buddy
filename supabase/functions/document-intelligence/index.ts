import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ActionType = "document_overview" | "version_history" | "expiring_documents" | "classification_stats" | "ai_analysis";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, documentId, category } = await req.json() as {
      action: ActionType;
      documentId?: string;
      category?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Document Intelligence] Action: ${action}`);

    // Fetch document data
    const [docsRes, templatesRes, generatedRes, insightsRes] = await Promise.all([
      supabase.from("ai_documents").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("ai_document_templates").select("*").limit(30),
      supabase.from("ai_generated_documents").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("ai_document_insights").select("*").order("created_at", { ascending: false }).limit(30),
    ]);

    const contextData = {
      documents: docsRes.data || [],
      templates: templatesRes.data || [],
      generated: generatedRes.data || [],
      insights: insightsRes.data || [],
    };

    if (action === "document_overview") {
      const byCategory = groupBy(contextData.documents, "category");
      const byType = groupBy(contextData.documents, "file_type");
      const ocrCompleted = contextData.documents.filter((d: any) => d.ocr_status === "completed").length;

      return new Response(JSON.stringify({
        action,
        overview: {
          totalDocuments: contextData.documents.length,
          totalTemplates: contextData.templates.length,
          totalGenerated: contextData.generated.length,
          totalInsights: contextData.insights.length,
          byCategory,
          byType,
          ocrCompleted,
          ocrPending: contextData.documents.filter((d: any) => d.ocr_status === "pending").length,
          avgConfidence: calculateAvg(contextData.documents, "confidence_score"),
          recentDocuments: contextData.documents.slice(0, 5),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "version_history") {
      const versioned = contextData.generated.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.document_type,
        status: doc.status,
        model: doc.ai_model,
        confidence: doc.confidence_score,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        approvedBy: doc.approved_by,
        approvedAt: doc.approved_at,
      }));

      return new Response(JSON.stringify({
        action,
        versions: versioned,
        stats: {
          total: versioned.length,
          approved: versioned.filter((v: any) => v.status === "approved").length,
          pending: versioned.filter((v: any) => v.status === "pending" || v.status === "draft").length,
          rejected: versioned.filter((v: any) => v.status === "rejected").length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "expiring_documents") {
      // Check certificates and documents with expiration dates
      const { data: certs } = await supabase.from("crew_certifications")
        .select("*")
        .order("expiry_date", { ascending: true })
        .limit(50);

      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiring = (certs || []).filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) >= now && new Date(c.expiry_date) <= thirtyDays
      );
      const expired = (certs || []).filter((c: any) =>
        c.expiry_date && new Date(c.expiry_date) < now
      );

      return new Response(JSON.stringify({
        action,
        expiring: {
          expired: expired.length,
          expiringNext30Days: expiring.length,
          items: [...expired, ...expiring].slice(0, 20),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "classification_stats") {
      const classifiedInsights = contextData.insights.filter((i: any) => i.classification);
      const byClassification = groupBy(classifiedInsights, "classification");
      const byLanguage = groupBy(contextData.insights, "language");

      return new Response(JSON.stringify({
        action,
        classification: {
          totalClassified: classifiedInsights.length,
          byClassification,
          byLanguage,
          avgProcessingTime: calculateAvg(contextData.insights, "processing_time_ms"),
          avgConfidence: calculateAvg(contextData.insights, "confidence"),
          topKeywords: extractTopKeywords(contextData.insights),
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "ai_analysis") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const prompt = `Analise o estado do gerenciamento documental marítimo:

Documentos: ${contextData.documents.length} total, categorias: ${JSON.stringify(groupBy(contextData.documents, "category"))}
Templates: ${contextData.templates.length}
Documentos gerados por IA: ${contextData.generated.length}
Insights extraídos: ${contextData.insights.length}

Forneça:
1. Score de maturidade documental (0-100)
2. Gaps na organização documental
3. Recomendações para automação
4. Prioridades de digitalização
5. Compliance documental (ISM, SOLAS, MLC)`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "Você é um especialista em gestão documental marítima. Analise e forneça recomendações acionáveis em português." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      return new Response(JSON.stringify({
        action,
        analysis: aiData.choices?.[0]?.message?.content || "",
        summary: {
          documentsAnalyzed: contextData.documents.length,
          templatesAvailable: contextData.templates.length,
        },
        generatedAt: new Date().toISOString(),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Document Intelligence] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateAvg(arr: any[], key: string): number {
  const values = arr.filter((i) => i[key] != null).map((i) => Number(i[key]));
  return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

function extractTopKeywords(insights: any[]): string[] {
  const all: string[] = [];
  insights.forEach((i: any) => {
    if (Array.isArray(i.keywords)) all.push(...i.keywords);
  });
  const freq: Record<string, number> = {};
  all.forEach((k) => { freq[k] = (freq[k] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k);
}
