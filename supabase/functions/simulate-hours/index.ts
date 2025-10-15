import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Component {
  id: string;
  name: string;
  operational: boolean;
  current_hours?: number;
  next_maintenance_hours?: number;
}

interface HourometerLog {
  component_id: string;
  hours_recorded: number;
  recorded_by: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting hourometer simulation...");

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all operational components
    const { data: components, error: componentsError } = await supabase
      .from("mmi_components")
      .select("id, name, operational, current_hours, next_maintenance_hours")
      .eq("operational", true);

    if (componentsError) {
      throw new Error(`Failed to fetch components: ${componentsError.message}`);
    }

    if (!components || components.length === 0) {
      console.log("No operational components found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No operational components to process",
          components_processed: 0,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${components.length} operational components`);

    const results = {
      components_processed: 0,
      logs_created: 0,
      alerts_detected: 0,
      errors: [] as string[],
    };

    // Process each component
    for (const component of components as Component[]) {
      try {
        // Simulate hourometer increment (1-5 hours based on component type)
        const increment = Math.floor(Math.random() * 5) + 1;
        const newHours = (component.current_hours || 0) + increment;

        // Update component hours
        const { error: updateError } = await supabase
          .from("mmi_components")
          .update({ current_hours: newHours })
          .eq("id", component.id);

        if (updateError) {
          results.errors.push(`Failed to update ${component.name}: ${updateError.message}`);
          continue;
        }

        // Create hourometer log
        const log: HourometerLog = {
          component_id: component.id,
          hours_recorded: newHours,
          recorded_by: "system-simulation",
          notes: `Automatic simulation: +${increment} hours`,
        };

        const { error: logError } = await supabase
          .from("mmi_hourometer_logs")
          .insert(log);

        if (logError) {
          results.errors.push(`Failed to create log for ${component.name}: ${logError.message}`);
          continue;
        }

        results.components_processed++;
        results.logs_created++;

        // Check if maintenance is approaching or overdue
        if (component.next_maintenance_hours && newHours >= component.next_maintenance_hours) {
          console.log(`⚠️ Maintenance alert: ${component.name} has reached/exceeded maintenance threshold`);
          results.alerts_detected++;

          // Check if there's already a job for this component
          const { data: existingJobs } = await supabase
            .from("mmi_jobs")
            .select("id")
            .eq("component_id", component.id)
            .in("status", ["pending", "in_progress"])
            .limit(1);

          // Only create alert if no pending/in-progress job exists
          if (!existingJobs || existingJobs.length === 0) {
            console.log(`Creating maintenance alert for ${component.name}`);
            // Note: Alert creation would be handled by send-alerts function
          }
        } else if (
          component.next_maintenance_hours &&
          newHours >= component.next_maintenance_hours * 0.9
        ) {
          console.log(`⚠️ Maintenance approaching: ${component.name} at 90% of threshold`);
          results.alerts_detected++;
        }

        console.log(
          `✓ Processed ${component.name}: ${component.current_hours || 0}h → ${newHours}h`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error processing ${component.name}: ${errorMessage}`);
        console.error(`Error processing component ${component.name}:`, error);
      }
    }

    console.log(`Simulation complete. Processed: ${results.components_processed}, Logs: ${results.logs_created}, Alerts: ${results.alerts_detected}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Hourometer simulation completed",
        ...results,
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
