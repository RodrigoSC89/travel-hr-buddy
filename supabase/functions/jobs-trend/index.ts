import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrendDataPoint {
  data: string;
  concluídos: number;
  iniciados: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get("timeRange") || "30d";

    // Calculate number of days based on time range
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    // Generate mock trend data
    const trendData: TrendDataPoint[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic mock data with some variation
      const baseCompleted = 5;
      const baseStarted = 8;
      const randomFactor = Math.sin(i / 3) * 2; // Creates wave pattern
      
      trendData.push({
        data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        concluídos: Math.max(1, Math.floor(baseCompleted + Math.random() * 4 + randomFactor)),
        iniciados: Math.max(2, Math.floor(baseStarted + Math.random() * 5 + randomFactor)),
      });
    }

    return new Response(JSON.stringify(trendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
