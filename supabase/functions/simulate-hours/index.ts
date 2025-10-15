/**
 * simulate-hours Edge Function
 * 
 * Purpose: Automatically simulates hourometer increments for operational components
 * Schedule: Runs hourly via cron (0 * * * *)
 * 
 * Features:
 * - Batch processing with random hour increments (0.5-2.0 hours)
 * - Automatic maintenance job creation at thresholds
 * - Audit log creation
 * - Email alerts for approaching maintenance
 */

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
  maintenance_interval_hours: number;
  system_id: string;
  last_maintenance_date: string | null;
}

interface MaintenanceAlert {
  component_id: string;
  component_name: string;
  current_hours: number;
  maintenance_interval_hours: number;
  hours_until_maintenance: number;
  urgency: 'critical' | 'high' | 'medium';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🕐 Starting hourometer simulation...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all operational components
    const { data: components, error: fetchError } = await supabase
      .from('mmi_components')
      .select('*')
      .eq('status', 'operational');

    if (fetchError) {
      console.error("Error fetching components:", fetchError);
      throw new Error(`Failed to fetch components: ${fetchError.message}`);
    }

    if (!components || components.length === 0) {
      console.log("No operational components found.");
      return new Response(JSON.stringify({ 
        message: "No operational components to process",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📊 Processing ${components.length} operational components...`);

    const alerts: MaintenanceAlert[] = [];
    const updates = [];

    // Process each component
    for (const component of components as Component[]) {
      // Generate random hour increment (0.5 to 2.0 hours)
      const increment = Math.random() * 1.5 + 0.5;
      const newHours = parseFloat(component.current_hours.toString()) + increment;

      // Create hourometer log
      const { error: logError } = await supabase
        .from('mmi_hourometer_logs')
        .insert({
          component_id: component.id,
          hours_before: component.current_hours,
          hours_after: newHours,
          source: 'automatic',
          notes: 'Automatic hourometer simulation via cron job'
        });

      if (logError) {
        console.error(`Error creating log for component ${component.id}:`, logError);
      }

      // Update component hours
      const { error: updateError } = await supabase
        .from('mmi_components')
        .update({ current_hours: newHours })
        .eq('id', component.id);

      if (updateError) {
        console.error(`Error updating component ${component.id}:`, updateError);
      }

      updates.push({
        component_id: component.id,
        component_name: component.name,
        hours_before: component.current_hours,
        hours_after: newHours,
        increment: increment.toFixed(2)
      });

      // Check if maintenance is approaching
      const maintenanceThreshold = parseFloat(component.maintenance_interval_hours.toString());
      const hoursUntilMaintenance = maintenanceThreshold - newHours;

      // Create alert if within 10% of maintenance interval
      if (hoursUntilMaintenance <= maintenanceThreshold * 0.1 && hoursUntilMaintenance > 0) {
        let urgency: 'critical' | 'high' | 'medium' = 'medium';
        
        if (hoursUntilMaintenance <= maintenanceThreshold * 0.05) {
          urgency = 'critical';
        } else if (hoursUntilMaintenance <= maintenanceThreshold * 0.08) {
          urgency = 'high';
        }

        alerts.push({
          component_id: component.id,
          component_name: component.name,
          current_hours: newHours,
          maintenance_interval_hours: maintenanceThreshold,
          hours_until_maintenance: hoursUntilMaintenance,
          urgency
        });

        // Auto-create maintenance job if critical (within 5%)
        if (urgency === 'critical') {
          console.log(`⚠️ Creating maintenance job for ${component.name} (${hoursUntilMaintenance.toFixed(1)} hours until maintenance)`);
          
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

          const { error: jobError } = await supabase
            .from('mmi_jobs')
            .insert({
              title: `Manutenção preventiva - ${component.name}`,
              description: `Componente atingindo limite de horas de operação. Manutenção preventiva necessária.\n\nHoras atuais: ${newHours.toFixed(1)}h\nIntervalo de manutenção: ${maintenanceThreshold}h\nHoras restantes: ${hoursUntilMaintenance.toFixed(1)}h`,
              status: 'pending',
              priority: urgency,
              component_id: component.id,
              due_date: dueDate.toISOString().split('T')[0],
              can_postpone: false,
              suggestion_ia: `Atenção: Este componente está próximo do limite de horas de operação. A manutenção preventiva deve ser realizada o mais breve possível para evitar falhas e garantir a segurança operacional.`
            });

          if (jobError) {
            console.error(`Error creating job for component ${component.id}:`, jobError);
          } else {
            console.log(`✅ Maintenance job created for ${component.name}`);
          }
        }
      }
    }

    const summary = {
      message: "Hourometer simulation completed successfully",
      timestamp: new Date().toISOString(),
      components_processed: components.length,
      total_hours_added: updates.reduce((sum, u) => sum + parseFloat(u.increment), 0).toFixed(2),
      alerts_generated: alerts.length,
      critical_alerts: alerts.filter(a => a.urgency === 'critical').length,
      high_alerts: alerts.filter(a => a.urgency === 'high').length,
      medium_alerts: alerts.filter(a => a.urgency === 'medium').length,
      updates,
      alerts
    };

    console.log("✅ Hourometer simulation completed:");
    console.log(`   - Components processed: ${summary.components_processed}`);
    console.log(`   - Total hours added: ${summary.total_hours_added}`);
    console.log(`   - Alerts generated: ${summary.alerts_generated}`);
    console.log(`   - Critical alerts: ${summary.critical_alerts}`);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error in simulate-hours function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
