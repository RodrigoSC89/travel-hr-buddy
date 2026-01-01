/**
 * AI Analytics - Usage tracking for AI Hub
 * PATCH AI-REVOLUTION
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
    const { action, data } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case "track": {
        // Track AI usage
        const { module, userId, messageCount, tokensUsed, responseTimeMs, success } = data;
        
        const { error } = await supabase.from("ai_usage_logs").insert({
          module,
          user_id: userId,
          message_count: messageCount || 1,
          tokens_used: tokensUsed || 0,
          response_time_ms: responseTimeMs || 0,
          success: success !== false,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("[AI-ANALYTICS] Track error:", error);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "stats": {
        // Get usage statistics
        const { period = "7d" } = data || {};
        
        const periodDays = parseInt(period.replace("d", "")) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        // Get module usage counts
        const { data: usageData } = await supabase
          .from("ai_usage_logs")
          .select("module, success, tokens_used, response_time_ms")
          .gte("created_at", startDate.toISOString());

        // Calculate stats by module
        const moduleStats: Record<string, {
          total: number;
          success: number;
          avgResponseTime: number;
          totalTokens: number;
        }> = {};

        (usageData || []).forEach((log: any) => {
          if (!moduleStats[log.module]) {
            moduleStats[log.module] = { total: 0, success: 0, avgResponseTime: 0, totalTokens: 0 };
          }
          moduleStats[log.module].total++;
          if (log.success) moduleStats[log.module].success++;
          moduleStats[log.module].avgResponseTime += log.response_time_ms || 0;
          moduleStats[log.module].totalTokens += log.tokens_used || 0;
        });

        // Calculate averages
        Object.keys(moduleStats).forEach(m => {
          if (moduleStats[m].total > 0) {
            moduleStats[m].avgResponseTime = Math.round(moduleStats[m].avgResponseTime / moduleStats[m].total);
          }
        });

        const totalRequests = (usageData || []).length;
        const successfulRequests = (usageData || []).filter((l: any) => l.success).length;

        return new Response(JSON.stringify({
          period,
          totalRequests,
          successRate: totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100,
          moduleStats,
          topModules: Object.entries(moduleStats)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5)
            .map(([module, stats]) => ({ module, ...stats })),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("[AI-ANALYTICS] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
