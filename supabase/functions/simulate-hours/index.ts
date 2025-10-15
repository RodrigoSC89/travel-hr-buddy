import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Component {
  id: string;
  name: string;
  current_hours: number;
  status: string;
  expected_lifetime_hours: number;
  next_maintenance_hours?: number;
}

interface HourometerLog {
  component_id: string;
  hours_recorded: number;
  recording_type: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { component_id } = await req.json().catch(() => ({}));

    console.log("Starting hourometer simulation", { component_id });

    // Query for components to simulate
    let query = supabase
      .from("mmi_components")
      .select("*")
      .eq("status", "operational");

    if (component_id) {
      query = query.eq("id", component_id);
    }

    const { data: components, error: componentsError } = await query;

    if (componentsError) {
      throw new Error(`Failed to fetch components: ${componentsError.message}`);
    }

    if (!components || components.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No operational components found to simulate",
          simulated: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results = [];
    const logs: HourometerLog[] = [];

    for (const component of components as Component[]) {
      // Simulate hours increment based on component status
      // For operational components, simulate 1 hour increment
      const hoursIncrement = 1.0;
      const newHours = (component.current_hours || 0) + hoursIncrement;

      // Update component hours
      const { error: updateError } = await supabase
        .from("mmi_components")
        .update({
          current_hours: newHours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", component.id);

      if (updateError) {
        console.error(`Failed to update component ${component.id}:`, updateError);
        continue;
      }

      // Create hourometer log
      logs.push({
        component_id: component.id,
        hours_recorded: newHours,
        recording_type: "simulated",
        notes: `Automatic simulation - incremented by ${hoursIncrement} hour(s)`,
      });

      // Check if maintenance is needed
      let maintenanceAlert = false;
      if (
        component.next_maintenance_hours &&
        newHours >= component.next_maintenance_hours
      ) {
        maintenanceAlert = true;
        console.log(`Maintenance alert for component ${component.name} at ${newHours} hours`);
      }

      results.push({
        component_id: component.id,
        component_name: component.name,
        previous_hours: component.current_hours,
        new_hours: newHours,
        maintenance_alert: maintenanceAlert,
      });
    }

    // Bulk insert logs
    if (logs.length > 0) {
      const { error: logsError } = await supabase
        .from("mmi_hourometer_logs")
        .insert(logs);

      if (logsError) {
        console.error("Failed to insert hourometer logs:", logsError);
      }
    }

    console.log(`Simulated hours for ${results.length} components`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Simulated hours for ${results.length} component(s)`,
        simulated: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in simulate-hours function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
