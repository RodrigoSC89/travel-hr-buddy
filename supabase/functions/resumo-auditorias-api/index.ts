import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditoriasSummaryRequest {
  startDate?: string;
  endDate?: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const userId = url.searchParams.get("userId") || undefined;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Fetching auditorias summary with filters:", { startDate, endDate, userId });

    // Build query for audits by vessel
    let queryByVessel = supabase
      .from("peotram_audits")
      .select(`
        id,
        audit_date,
        created_by,
        vessel_id,
        vessels:vessel_id (
          id,
          name
        )
      `);

    // Apply filters
    if (startDate) {
      queryByVessel = queryByVessel.gte("audit_date", startDate);
    }
    if (endDate) {
      queryByVessel = queryByVessel.lte("audit_date", endDate);
    }
    if (userId) {
      queryByVessel = queryByVessel.eq("created_by", userId);
    }

    const { data: auditsData, error: auditsError } = await queryByVessel;

    if (auditsError) {
      console.error("Error fetching audits:", auditsError);
      throw auditsError;
    }

    // Aggregate data by vessel
    const auditsByVessel: Record<string, { nome_navio: string; total: number }> = {};
    const auditsByDate: Record<string, number> = {};

    auditsData?.forEach((audit: any) => {
      const vesselName = audit.vessels?.name || "Sem Navio";
      const auditDate = audit.audit_date;

      // Count by vessel
      if (!auditsByVessel[vesselName]) {
        auditsByVessel[vesselName] = { nome_navio: vesselName, total: 0 };
      }
      auditsByVessel[vesselName].total++;

      // Count by date
      if (!auditsByDate[auditDate]) {
        auditsByDate[auditDate] = 0;
      }
      auditsByDate[auditDate]++;
    });

    // Convert to arrays for charts
    const dadosPorNavio = Object.values(auditsByVessel).sort((a, b) => b.total - a.total);
    const tendenciaPorData = Object.entries(auditsByDate)
      .map(([data, total]) => ({ data, total }))
      .sort((a, b) => a.data.localeCompare(b.data));

    console.log("Auditorias summary generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      dadosPorNavio,
      tendenciaPorData,
      totalAuditorias: auditsData?.length || 0,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating auditorias summary:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
