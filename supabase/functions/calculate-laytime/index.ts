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

    // Fetch port calls for the voyage
    const { data: portCalls, error } = await sb
      .from("port_calls")
      .select("*")
      .eq("voyage_id", voyageId)
      .order("arrival_date", { ascending: true });

    if (error) throw error;

    // Fetch voyage for cargo info
    const { data: voyage } = await sb
      .from("voyage_plans")
      .select("cargo_type, cargo_quantity, laytime_allowed_hours")
      .eq("id", voyageId)
      .maybeSingle();

    // Default laytime rates (tons/hour) by cargo type
    const loadingRates: Record<string, number> = {
      bulk: 5000, container: 40, tanker: 3000, general: 2000, default: 3000,
    };

    const cargoType = voyage?.cargo_type?.toLowerCase() || "default";
    const cargoQty = voyage?.cargo_quantity || 50000;
    const rate = loadingRates[cargoType] || loadingRates.default;

    // Calculate allowed laytime (hours)
    const allowed_hours = voyage?.laytime_allowed_hours || Math.ceil(cargoQty / rate);

    // Calculate used laytime from port calls
    let used_hours = 0;
    const portDetails = (portCalls || []).map((pc: Record<string, unknown>) => {
      const arrival = pc.arrival_date ? new Date(pc.arrival_date as string) : null;
      const departure = pc.departure_date ? new Date(pc.departure_date as string) : null;

      let portHours = 0;
      if (arrival && departure) {
        portHours = (departure.getTime() - arrival.getTime()) / 3600000;
        // Subtract excluded time (weather, strikes, etc.)
        const excludedHours = (pc.excluded_hours as number) || 0;
        portHours = Math.max(0, portHours - excludedHours);
      }
      used_hours += portHours;

      return {
        port_name: pc.port_name || pc.port,
        arrival: pc.arrival_date,
        departure: pc.departure_date,
        hours_at_port: Math.round(portHours * 10) / 10,
        excluded_hours: (pc.excluded_hours as number) || 0,
      };
    });

    // Demurrage/Despatch calculation
    const difference_hours = used_hours - allowed_hours;
    const demurrage_rate_per_hour = 1500; // USD/hour (industry average)
    const despatch_rate_per_hour = demurrage_rate_per_hour * 0.5; // 50% of demurrage

    let result: "demurrage" | "despatch" | "balanced";
    let demurrage_amount = 0;
    let despatch_amount = 0;

    if (difference_hours > 0.5) {
      result = "demurrage";
      demurrage_amount = Math.round(difference_hours * demurrage_rate_per_hour);
    } else if (difference_hours < -0.5) {
      result = "despatch";
      despatch_amount = Math.round(Math.abs(difference_hours) * despatch_rate_per_hour);
    } else {
      result = "balanced";
    }

    return new Response(
      JSON.stringify({
        voyage_id: voyageId,
        allowed_hours: Math.round(allowed_hours * 10) / 10,
        used_hours: Math.round(used_hours * 10) / 10,
        difference_hours: Math.round(difference_hours * 10) / 10,
        result,
        demurrage_amount,
        despatch_amount,
        demurrage_rate_per_hour,
        despatch_rate_per_hour,
        port_details: portDetails,
        cargo_quantity: cargoQty,
        cargo_type: cargoType,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
