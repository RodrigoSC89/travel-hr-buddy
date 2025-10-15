// ============================================================================
// Supabase Edge Function: simulate-hours
// Purpose: Automatic hourometer simulation for operational components
// Schedule: Runs hourly via cron (0 * * * *)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Component {
  id: string;
  component_name: string;
  current_hours: number;
  maintenance_interval_hours: number;
  system_id: string;
}

interface JobCreated {
  component_name: string;
  priority: string;
  current_hours: number;
  maintenance_interval_hours: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting hourometer simulation...');

    // Fetch all operational components
    const { data: components, error: fetchError } = await supabase
      .from('mmi_components')
      .select('id, component_name, current_hours, maintenance_interval_hours, system_id')
      .eq('is_operational', true);

    if (fetchError) {
      console.error('❌ Error fetching components:', fetchError);
      throw fetchError;
    }

    if (!components || components.length === 0) {
      console.log('ℹ️  No operational components found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No operational components to process',
          processed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processing ${components.length} operational components...`);

    let totalHoursAdded = 0;
    let jobsCreated: JobCreated[] = [];
    const alerts = { critical: 0, high: 0, medium: 0 };

    // Process each component
    for (const component of components as Component[]) {
      try {
        // Generate random hours increment (0.5 to 2.0 hours)
        const hoursToAdd = Math.random() * 1.5 + 0.5;
        const roundedHours = Math.round(hoursToAdd * 10) / 10;
        
        const previousHours = component.current_hours || 0;
        const newHours = previousHours + roundedHours;

        // Update component hours
        const { error: updateError } = await supabase
          .from('mmi_components')
          .update({ current_hours: newHours })
          .eq('id', component.id);

        if (updateError) {
          console.error(`❌ Error updating component ${component.component_name}:`, updateError);
          continue;
        }

        // Log the hourometer change
        const { error: logError } = await supabase
          .from('mmi_hourometer_logs')
          .insert({
            component_id: component.id,
            previous_hours: previousHours,
            new_hours: newHours,
            recorded_by: 'system',
            source: 'automated',
            notes: 'Automatic hourometer simulation',
          });

        if (logError) {
          console.error(`⚠️  Error logging hours for ${component.component_name}:`, logError);
        }

        totalHoursAdded += roundedHours;

        // Check if maintenance is needed (95% threshold)
        const maintenanceThreshold = component.maintenance_interval_hours * 0.95;
        
        if (newHours >= maintenanceThreshold) {
          // Determine priority based on how close to interval
          let priority = 'medium';
          let alertType: 'critical' | 'high' | 'medium' = 'medium';

          if (newHours >= component.maintenance_interval_hours) {
            priority = 'critical';
            alertType = 'critical';
          } else if (newHours >= component.maintenance_interval_hours * 0.98) {
            priority = 'high';
            alertType = 'high';
          }

          // Check if a pending job already exists for this component
          const { data: existingJobs } = await supabase
            .from('mmi_jobs')
            .select('id')
            .eq('component_id', component.id)
            .in('status', ['pending', 'in_progress'])
            .limit(1);

          if (!existingJobs || existingJobs.length === 0) {
            // Create maintenance job
            const dueDate = new Date();
            if (priority === 'critical') {
              dueDate.setDate(dueDate.getDate() + 2); // 2 days for critical
            } else if (priority === 'high') {
              dueDate.setDate(dueDate.getDate() + 5); // 5 days for high
            } else {
              dueDate.setDate(dueDate.getDate() + 10); // 10 days for medium
            }

            const jobTitle = `Manutenção programada - ${component.component_name}`;
            const jobDescription = `Componente atingiu ${Math.round((newHours / component.maintenance_interval_hours) * 100)}% do intervalo de manutenção (${newHours.toFixed(1)}h de ${component.maintenance_interval_hours}h).`;

            const { error: jobError } = await supabase
              .from('mmi_jobs')
              .insert({
                component_id: component.id,
                title: jobTitle,
                description: jobDescription,
                status: 'pending',
                priority: priority,
                due_date: dueDate.toISOString().split('T')[0],
                suggestion_ia: `Realizar manutenção preventiva conforme especificação do fabricante. Componente operou ${newHours.toFixed(1)} horas.`,
                can_postpone: priority !== 'critical',
              });

            if (jobError) {
              console.error(`❌ Error creating job for ${component.component_name}:`, jobError);
            } else {
              console.log(`✅ Created ${priority} priority job for ${component.component_name}`);
              alerts[alertType]++;
              jobsCreated.push({
                component_name: component.component_name,
                priority: priority,
                current_hours: newHours,
                maintenance_interval_hours: component.maintenance_interval_hours,
              });
            }
          }
        }

        console.log(`✅ ${component.component_name}: ${previousHours.toFixed(1)}h → ${newHours.toFixed(1)}h (+${roundedHours.toFixed(1)}h)`);

      } catch (componentError) {
        console.error(`❌ Error processing component ${component.component_name}:`, componentError);
        continue;
      }
    }

    // Prepare summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      processed: components.length,
      hours_added: Math.round(totalHoursAdded * 10) / 10,
      jobs_created: jobsCreated.length,
      alerts: alerts,
      jobs_details: jobsCreated,
    };

    console.log('✅ Hourometer simulation completed successfully!');
    console.log(`📊 Summary: ${components.length} components processed, ${summary.hours_added}h added, ${jobsCreated.length} jobs created`);
    console.log(`⚠️  Alerts: ${alerts.critical} critical, ${alerts.high} high, ${alerts.medium} medium`);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in simulate-hours:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
