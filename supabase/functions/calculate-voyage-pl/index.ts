import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { voyageId } = await req.json();
    if (!voyageId) {
      return new Response(JSON.stringify({ error: "voyageId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch voyage with related data
    const { data: voyage, error: vErr } = await sb
      .from("voyage_plans")
      .select("*")
      .eq("id", voyageId)
      .single();

    if (vErr || !voyage) {
      return new Response(JSON.stringify({ error: "Voyage not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch bunker records for this voyage's vessel
    const { data: bunkerRecords } = await sb
      .from("bunker_operations")
      .select("quantity_mt, total_cost, unit_price")
      .eq("vessel_id", voyage.vessel_id)
      .gte("operation_date", voyage.departure_date || "2000-01-01")
      .lte("operation_date", voyage.arrival_date || "2099-12-31");

    // Fetch port calls
    const { data: portCalls } = await sb
      .from("port_calls")
      .select("port_charges, agency_fees, pilotage_cost, towage_cost")
      .eq("voyage_id", voyageId);

    // Fetch voyage accounting if exists
    const { data: accounting } = await sb
      .from("voyage_accounting")
      .select("*")
      .eq("voyage_id", voyageId)
      .maybeSingle();

    // Calculate P&L
    const freight_revenue = accounting?.freight_revenue ?? voyage.estimated_revenue ?? 0;
    const hire_revenue = accounting?.hire_revenue ?? 0;

    const bunker_cost = bunkerRecords?.reduce(
      (sum: number, b: { total_cost?: number; quantity_mt?: number; unit_price?: number }) =>
        sum + (b.total_cost ?? (b.quantity_mt ?? 0) * (b.unit_price ?? 0)),
      0
    ) ?? 0;

    const port_costs = portCalls?.reduce(
      (sum: number, p: { port_charges?: number; agency_fees?: number; pilotage_cost?: number; towage_cost?: number }) =>
        sum + (p.port_charges ?? 0) + (p.agency_fees ?? 0) + (p.pilotage_cost ?? 0) + (p.towage_cost ?? 0),
      0
    ) ?? 0;

    // Calculate voyage duration in days
    const depDate = voyage.departure_date ? new Date(voyage.departure_date) : new Date();
    const arrDate = voyage.arrival_date ? new Date(voyage.arrival_date) : new Date();
    const days = Math.max(1, (arrDate.getTime() - depDate.getTime()) / 86400000);

    // Estimated crew cost per day (industry average)
    const crew_cost_per_day = accounting?.crew_cost_per_day ?? 5000;
    const crew_cost = days * crew_cost_per_day;

    const insurance_cost = accounting?.insurance_cost ?? days * 800;
    const other_costs = accounting?.other_costs ?? 0;

    const total_revenue = freight_revenue + hire_revenue;
    const total_expenses = bunker_cost + port_costs + crew_cost + insurance_cost + other_costs;
    const net_profit = total_revenue - total_expenses;
    const tce_per_day = net_profit / days;
    const roi_percent = total_expenses > 0 ? (net_profit / total_expenses) * 100 : 0;
    const breakeven_freight = total_expenses;

    const result = {
      voyage_id: voyageId,
      voyage_number: voyage.voyage_number,
      vessel_id: voyage.vessel_id,
      days: Math.round(days * 10) / 10,
      // Revenue
      freight_revenue: Math.round(freight_revenue),
      hire_revenue: Math.round(hire_revenue),
      total_revenue: Math.round(total_revenue),
      // Costs
      bunker_cost: Math.round(bunker_cost),
      port_costs: Math.round(port_costs),
      crew_cost: Math.round(crew_cost),
      insurance_cost: Math.round(insurance_cost),
      other_costs: Math.round(other_costs),
      total_expenses: Math.round(total_expenses),
      // P&L
      net_profit: Math.round(net_profit),
      tce_per_day: Math.round(tce_per_day),
      roi_percent: Math.round(roi_percent * 10) / 10,
      breakeven_freight: Math.round(breakeven_freight),
      // Status
      is_profitable: net_profit > 0,
      margin_percent: total_revenue > 0 ? Math.round((net_profit / total_revenue) * 1000) / 10 : 0,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
