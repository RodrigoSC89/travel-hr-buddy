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
  operational_hours: number;
  max_hours_before_maintenance: number;
  system_id: string;
}

interface SimulationResult {
  component_id: string;
  component_name: string;
  previous_hours: number;
  new_hours: number;
  increment: number;
  maintenance_needed: boolean;
  maintenance_threshold: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting hourometer simulation...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all operational components
    const { data: components, error: componentsError } = await supabase
      .from('mmi_components')
      .select('id, name, operational_hours, max_hours_before_maintenance, system_id')
      .eq('status', 'operational');

    if (componentsError) {
      throw new Error(`Failed to fetch components: ${componentsError.message}`);
    }

    if (!components || components.length === 0) {
      console.log("No operational components found");
      return new Response(JSON.stringify({ 
        message: "No operational components to process",
        processed: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${components.length} components...`);

    const results: SimulationResult[] = [];
    const maintenanceJobs: Array<{ component_id: string; component_name: string }> = [];

    // Process each component
    for (const component of components as Component[]) {
      // Generate random hour increment (1-5 hours)
      const increment = Math.floor(Math.random() * 5) + 1;
      const previousHours = component.operational_hours || 0;
      const newHours = previousHours + increment;

      // Update component hours
      const { error: updateError } = await supabase
        .from('mmi_components')
        .update({ 
          operational_hours: newHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', component.id);

      if (updateError) {
        console.error(`Failed to update component ${component.id}:`, updateError);
        continue;
      }

      // Create hourometer log entry
      const { error: logError } = await supabase
        .from('mmi_hourometer_logs')
        .insert({
          component_id: component.id,
          hours_recorded: newHours,
          recorded_at: new Date().toISOString(),
          recorded_by: 'system',
          source: 'automatic',
          notes: `Automatic hourometer simulation: +${increment} hours`
        });

      if (logError) {
        console.error(`Failed to create log for component ${component.id}:`, logError);
      }

      // Check if maintenance is needed
      const maintenanceNeeded = newHours >= component.max_hours_before_maintenance;

      results.push({
        component_id: component.id,
        component_name: component.name,
        previous_hours: previousHours,
        new_hours: newHours,
        increment: increment,
        maintenance_needed: maintenanceNeeded,
        maintenance_threshold: component.max_hours_before_maintenance
      });

      // If maintenance threshold reached, create maintenance job
      if (maintenanceNeeded) {
        // Check if there's already a pending job for this component
        const { data: existingJobs } = await supabase
          .from('mmi_jobs')
          .select('id')
          .eq('component_id', component.id)
          .in('status', ['pending', 'scheduled'])
          .limit(1);

        if (!existingJobs || existingJobs.length === 0) {
          // Create new maintenance job
          const { error: jobError } = await supabase
            .from('mmi_jobs')
            .insert({
              component_id: component.id,
              title: `Manutenção preventiva - ${component.name}`,
              description: `Componente atingiu ${newHours} horas de operação. Limite: ${component.max_hours_before_maintenance} horas.`,
              job_type: 'preventive',
              priority: newHours > component.max_hours_before_maintenance * 1.1 ? 'critical' : 'high',
              status: 'pending',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
              can_postpone: newHours <= component.max_hours_before_maintenance * 1.05,
              suggestion_ia: 'Manutenção preventiva recomendada pelo sistema de monitoramento de horas.',
              metadata: {
                triggered_by: 'hourometer_simulation',
                operational_hours: newHours,
                threshold: component.max_hours_before_maintenance,
                auto_generated: true
              }
            });

          if (jobError) {
            console.error(`Failed to create job for component ${component.id}:`, jobError);
          } else {
            maintenanceJobs.push({
              component_id: component.id,
              component_name: component.name
            });
            console.log(`Created maintenance job for ${component.name}`);
          }
        } else {
          console.log(`Maintenance job already exists for ${component.name}`);
        }
      }
    }

    // Prepare response
    const response = {
      message: "Hourometer simulation completed successfully",
      timestamp: new Date().toISOString(),
      summary: {
        components_processed: components.length,
        total_hours_added: results.reduce((sum, r) => sum + r.increment, 0),
        maintenance_needed: results.filter(r => r.maintenance_needed).length,
        jobs_created: maintenanceJobs.length
      },
      results: results,
      maintenance_jobs_created: maintenanceJobs
    };

    console.log("Simulation completed:", response.summary);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in simulate-hours function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
