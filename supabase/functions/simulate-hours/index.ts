import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hour increments per component type (per hour of real time)
const HOUR_INCREMENTS: Record<string, number> = {
  motor_principal: 1.0,
  motor_diesel: 1.0,
  motor_auxiliar: 0.8,
  bomba_hidraulica: 0.5,
  bomba: 0.5,
  gerador: 0.7,
  compressor: 0.6,
  filtro: 0.9,
  valvula: 0.3,
  sensor: 0.1,
  default: 0.5
};

// Maintenance warning thresholds (hours before due)
const WARNING_HOURS = 50;
const CRITICAL_HOURS = 20;

// Get increment based on component name
const getHourIncrement = (componentName: string): number => {
  const lowerName = componentName.toLowerCase();
  
  for (const [key, value] of Object.entries(HOUR_INCREMENTS)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  
  return HOUR_INCREMENTS.default;
};

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
      .select(`
        id,
        name,
        system_id,
        operational,
        mmi_systems(name)
      `)
      .eq('operational', true);

    if (componentsError) {
      console.error("Error fetching components:", componentsError);
      throw new Error(`Failed to fetch components: ${componentsError.message}`);
    }

    if (!components || components.length === 0) {
      console.log("No operational components found");
      return new Response(JSON.stringify({ 
        message: "No operational components to simulate",
        components_processed: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${components.length} operational components`);

    const results = {
      total_components: components.length,
      logs_created: 0,
      alerts_generated: 0,
      errors: [] as string[]
    };

    // Process each component
    for (const component of components) {
      try {
        // Get the latest hourometer reading
        const { data: latestLog } = await supabase
          .from('mmi_hourometer_logs')
          .select('hours')
          .eq('component_id', component.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const currentHours = latestLog?.hours || 0;
        const increment = getHourIncrement(component.name);
        const newHours = Number((currentHours + increment).toFixed(2));

        // Create new hourometer log
        const { error: logError } = await supabase
          .from('mmi_hourometer_logs')
          .insert({
            component_id: component.id,
            hours: newHours,
            source: 'automated',
            notes: `Auto-simulation: +${increment}h (${currentHours}h → ${newHours}h)`
          });

        if (logError) {
          console.error(`Error creating log for ${component.name}:`, logError);
          results.errors.push(`${component.name}: ${logError.message}`);
          continue;
        }

        results.logs_created++;
        console.log(`✅ ${component.name}: ${currentHours}h → ${newHours}h (+${increment}h)`);

        // Check for maintenance jobs that might be approaching
        const { data: jobs } = await supabase
          .from('mmi_jobs')
          .select('id, title, hours_trigger, priority, status')
          .eq('component_id', component.id)
          .in('status', ['pendente', 'postergada'])
          .not('hours_trigger', 'is', null);

        if (jobs && jobs.length > 0) {
          for (const job of jobs) {
            const hoursUntilMaintenance = job.hours_trigger - newHours;

            // Generate alert if maintenance is approaching
            if (hoursUntilMaintenance <= CRITICAL_HOURS && hoursUntilMaintenance > 0) {
              console.log(`🚨 CRITICAL: ${component.name} - ${job.title} due in ${hoursUntilMaintenance}h`);
              
              // Update job to critical priority if not already
              if (job.priority !== 'crítica') {
                await supabase
                  .from('mmi_jobs')
                  .update({ 
                    priority: 'crítica',
                    suggestion_ia: `⚠️ ATENÇÃO: Componente alcançou ${newHours}h. Manutenção prevista para ${job.hours_trigger}h em apenas ${hoursUntilMaintenance}h de operação.`
                  })
                  .eq('id', job.id);
              }
              
              results.alerts_generated++;
            } else if (hoursUntilMaintenance <= WARNING_HOURS && hoursUntilMaintenance > CRITICAL_HOURS) {
              console.log(`⚠️ WARNING: ${component.name} - ${job.title} due in ${hoursUntilMaintenance}h`);
              
              // Update job to high priority if currently lower
              if (!['crítica', 'alta'].includes(job.priority)) {
                await supabase
                  .from('mmi_jobs')
                  .update({ 
                    priority: 'alta',
                    suggestion_ia: `Componente com ${newHours}h de operação. Manutenção programada para ${job.hours_trigger}h. Planeje a execução.`
                  })
                  .eq('id', job.id);
              }
              
              results.alerts_generated++;
            } else if (hoursUntilMaintenance <= 0) {
              console.log(`❌ OVERDUE: ${component.name} - ${job.title} is ${Math.abs(hoursUntilMaintenance)}h overdue`);
              
              // Mark as critical and overdue
              await supabase
                .from('mmi_jobs')
                .update({ 
                  priority: 'crítica',
                  status: 'em_andamento',
                  suggestion_ia: `🚨 MANUTENÇÃO ATRASADA: Componente com ${newHours}h. Limite de ${job.hours_trigger}h ultrapassado em ${Math.abs(hoursUntilMaintenance)}h. EXECUTE IMEDIATAMENTE.`
                })
                .eq('id', job.id);
              
              results.alerts_generated++;
            }
          }
        }

      } catch (componentError) {
        console.error(`Error processing component ${component.name}:`, componentError);
        results.errors.push(`${component.name}: ${componentError.message}`);
      }
    }

    console.log("Simulation complete:", results);

    return new Response(JSON.stringify({
      message: "Hourometer simulation completed",
      timestamp: new Date().toISOString(),
      results: results
    }), {
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
