import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno ESM import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GovernanceRequest {
  action: 'model_metrics' | 'decision_audit' | 'usage_analytics' | 'ai_health_check' | 'governance_report';
  params?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, params }: GovernanceRequest = await req.json();
    console.log(`[AI-Governance] Action: ${action}`);

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'model_metrics': {
        // Aggregate AI audit logs for model performance
        const { data: auditLogs } = await supabase
          .from('ai_audit_logs')
          .select('model_provider, model_version, response_time_ms, tokens_input, tokens_output, quality_score, confidence_score, created_at')
          .order('created_at', { ascending: false })
          .limit(500);

        const logs = auditLogs || [];
        
        // Group by model
        const modelMap = new Map<string, {
          requests: number;
          totalLatency: number;
          totalTokensIn: number;
          totalTokensOut: number;
          totalQuality: number;
          qualityCount: number;
          totalConfidence: number;
          confidenceCount: number;
          errors: number;
        }>();

        for (const log of logs) {
          const model = log.model_provider || log.model_version || 'unknown';
          const existing = modelMap.get(model) || {
            requests: 0, totalLatency: 0, totalTokensIn: 0, totalTokensOut: 0,
            totalQuality: 0, qualityCount: 0, totalConfidence: 0, confidenceCount: 0, errors: 0,
          };
          existing.requests++;
          existing.totalLatency += log.response_time_ms || 0;
          existing.totalTokensIn += log.tokens_input || 0;
          existing.totalTokensOut += log.tokens_output || 0;
          if (log.quality_score != null) { existing.totalQuality += log.quality_score; existing.qualityCount++; }
          if (log.confidence_score != null) { existing.totalConfidence += log.confidence_score; existing.confidenceCount++; }
          modelMap.set(model, existing);
        }

        const models = Array.from(modelMap.entries()).map(([name, m]) => ({
          model: name,
          requests: m.requests,
          avgLatency: m.requests > 0 ? Math.round(m.totalLatency / m.requests) : 0,
          totalTokensIn: m.totalTokensIn,
          totalTokensOut: m.totalTokensOut,
          avgQuality: m.qualityCount > 0 ? Number((m.totalQuality / m.qualityCount).toFixed(2)) : null,
          avgConfidence: m.confidenceCount > 0 ? Number((m.totalConfidence / m.confidenceCount).toFixed(2)) : null,
        }));

        result = {
          models,
          totalRequests: logs.length,
          totalTokens: logs.reduce((a: number, l: any) => a + (l.tokens_input || 0) + (l.tokens_output || 0), 0),
        };
        break;
      }

      case 'decision_audit': {
        // Fetch AI decisions with full audit trail
        const { data: decisions } = await supabase
          .from('ai_decisions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(params?.limit as number || 50);

        // Fetch blockchain audit records
        const { data: blockchainRecords } = await supabase
          .from('ai_blockchain_audit')
          .select('*')
          .order('block_number', { ascending: false })
          .limit(params?.limit as number || 50);

        result = {
          decisions: decisions || [],
          blockchainRecords: blockchainRecords || [],
          totalDecisions: decisions?.length || 0,
          totalBlocks: blockchainRecords?.length || 0,
        };
        break;
      }

      case 'usage_analytics': {
        // Aggregate usage data
        const { data: aiLogs } = await supabase
          .from('ai_logs')
          .select('service, model, status, tokens_used, response_time_ms, created_at')
          .order('created_at', { ascending: false })
          .limit(1000);

        const logs = aiLogs || [];
        
        // By service
        const serviceMap = new Map<string, { requests: number; tokens: number; errors: number }>();
        for (const log of logs) {
          const svc = log.service || 'unknown';
          const existing = serviceMap.get(svc) || { requests: 0, tokens: 0, errors: 0 };
          existing.requests++;
          existing.tokens += log.tokens_used || 0;
          if (log.status === 'error') existing.errors++;
          serviceMap.set(svc, existing);
        }

        // By model
        const modelUsage = new Map<string, number>();
        for (const log of logs) {
          const model = log.model || 'unknown';
          modelUsage.set(model, (modelUsage.get(model) || 0) + 1);
        }

        result = {
          byService: Array.from(serviceMap.entries()).map(([name, s]) => ({
            service: name, ...s
          })),
          byModel: Array.from(modelUsage.entries()).map(([model, count]) => ({
            model, count
          })),
          totalRequests: logs.length,
          totalTokens: logs.reduce((a: number, l: any) => a + (l.tokens_used || 0), 0),
          errorRate: logs.length > 0 
            ? Number(((logs.filter((l: any) => l.status === 'error').length / logs.length) * 100).toFixed(1))
            : 0,
        };
        break;
      }

      case 'ai_health_check': {
        // Check agent registry health
        const { data: agents } = await supabase
          .from('agent_registry')
          .select('*');

        const { data: metrics } = await supabase
          .from('agent_swarm_metrics')
          .select('*');

        const { data: behaviorSnapshots } = await supabase
          .from('ai_behavior_snapshots')
          .select('*')
          .order('snapshot_date', { ascending: false })
          .limit(20);

        result = {
          agents: agents || [],
          metrics: metrics || [],
          behaviorSnapshots: behaviorSnapshots || [],
          healthScore: calculateHealthScore(agents || [], metrics || []),
        };
        break;
      }

      case 'governance_report': {
        // Generate AI governance report using Lovable AI
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

        // Gather context
        const [auditRes, decisionsRes, logsRes] = await Promise.all([
          supabase.from('ai_audit_logs').select('model_provider, response_time_ms, quality_score, confidence_score').limit(100),
          supabase.from('ai_decisions').select('type, status, confidence, impact').limit(50),
          supabase.from('ai_logs').select('service, status, tokens_used').limit(200),
        ]);

        const context = {
          auditLogs: auditRes.data?.length || 0,
          decisions: decisionsRes.data?.length || 0,
          logs: logsRes.data?.length || 0,
          models: [...new Set((auditRes.data || []).map((a: any) => a.model_provider).filter(Boolean))],
          avgQuality: calculateAvg((auditRes.data || []).map((a: any) => a.quality_score).filter(Boolean) as number[]),
          avgConfidence: calculateAvg((auditRes.data || []).map((a: any) => a.confidence_score).filter(Boolean) as number[]),
          errorRate: logsRes.data 
            ? ((logsRes.data.filter((l: any) => l.status === 'error').length / Math.max(logsRes.data.length, 1)) * 100).toFixed(1)
            : '0',
        };

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
                content: `Você é o AI Governance Officer do Nautilus One, um sistema de gestão marítima. Gere um relatório de governança de IA incluindo: 1) Resumo executivo, 2) Métricas de performance dos modelos, 3) Score de confiança e qualidade, 4) Análise de riscos, 5) Recomendações de governança. Responda em PT-BR com markdown.` 
              },
              { role: "user", content: `Dados do sistema:\n${JSON.stringify(context, null, 2)}` },
            ],
            stream: false,
            temperature: 0.5,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (response.status === 402) {
            return new Response(JSON.stringify({ error: "Payment required" }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error(`AI Gateway error: ${response.status}`);
        }

        const aiResponse = await response.json();
        result = {
          report: aiResponse.choices?.[0]?.message?.content || 'Report generation failed',
          context,
          generatedAt: new Date().toISOString(),
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    console.log(`[AI-Governance] ${action} completed successfully`);
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[AI-Governance] Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions
function calculateHealthScore(agents: any[], metrics: any[]): number {
  if (agents.length === 0) return 100;
  const onlineAgents = agents.filter((a: any) => a.status === 'active' || a.status === 'online').length;
  const agentScore = (onlineAgents / agents.length) * 50;
  
  if (metrics.length === 0) return Math.round(agentScore + 50);
  const successRate = metrics.reduce((a: number, m: any) => a + (m.success_count || 0), 0) / 
    Math.max(metrics.reduce((a: number, m: any) => a + (m.task_count || 0), 0), 1);
  const metricsScore = successRate * 50;
  
  return Math.round(agentScore + metricsScore);
}

function calculateAvg(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((a, v) => a + v, 0) / values.length).toFixed(2));
}
