import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  title: string;
  priority: string;
  status: string;
  scheduled_date: string;
  component?: {
    name: string;
    current_hours: number;
  };
  system?: {
    name: string;
    category: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting send-alerts function");

    // Get critical and high priority jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select(`
        *,
        mmi_components:component_id (name, current_hours),
        mmi_systems:system_id (name, category)
      `)
      .in("priority", ["critical", "high"])
      .in("status", ["pending", "in_progress", "overdue"])
      .order("priority", { ascending: false })
      .order("scheduled_date", { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No critical jobs found",
          alerts_sent: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Group jobs by vessel
    const jobsByVessel = jobs.reduce((acc: Record<string, any[]>, job: any) => {
      const vesselId = job.vessel_id || "general";
      if (!acc[vesselId]) {
        acc[vesselId] = [];
      }
      acc[vesselId].push(job);
      return acc;
    }, {});

    const alertsSent = [];

    // Send email for each vessel
    for (const [vesselId, vesselJobs] of Object.entries(jobsByVessel)) {
      const criticalCount = vesselJobs.filter((j: any) => j.priority === "critical").length;
      const highCount = vesselJobs.filter((j: any) => j.priority === "high").length;

      // Generate email HTML
      const emailHtml = generateEmailTemplate(vesselId, vesselJobs);

      // Send email via Resend (if API key is configured)
      if (resendApiKey) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Nautilus One MMI <alerts@nautilusone.com>",
              to: ["maintenance-team@nautilusone.com"], // Configure recipient list
              subject: `🚨 Alertas de Manutenção - ${criticalCount} Crítico(s), ${highCount} Alto(s)`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error("Failed to send email via Resend:", errorText);
          } else {
            const emailResult = await emailResponse.json();
            alertsSent.push({
              vessel_id: vesselId,
              jobs_count: vesselJobs.length,
              email_id: emailResult.id,
            });
            console.log(`Email sent for vessel ${vesselId}: ${emailResult.id}`);
          }
        } catch (emailError) {
          console.error(`Error sending email for vessel ${vesselId}:`, emailError);
        }
      } else {
        console.warn("RESEND_API_KEY not configured, email not sent");
        // Log alert without sending email
        alertsSent.push({
          vessel_id: vesselId,
          jobs_count: vesselJobs.length,
          status: "not_sent_no_api_key",
        });
      }
    }

    console.log(`Sent ${alertsSent.length} alert(s)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${alertsSent.length} alert(s)`,
        alerts_sent: alertsSent.length,
        details: alertsSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-alerts function:", error);

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

function generateEmailTemplate(vesselId: string, jobs: any[]): string {
  const now = new Date().toISOString();
  
  const jobRows = jobs
    .map((job) => {
      const scheduledDate = new Date(job.scheduled_date).toLocaleDateString("pt-BR");
      const priorityColor = job.priority === "critical" ? "#dc2626" : "#ea580c";
      const componentName = job.mmi_components?.name || "N/A";
      const systemName = job.mmi_systems?.name || "N/A";

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-size: 14px;">${job.title}</td>
          <td style="padding: 12px; font-size: 14px;">${systemName}</td>
          <td style="padding: 12px; font-size: 14px;">${componentName}</td>
          <td style="padding: 12px; font-size: 14px;">
            <span style="background-color: ${priorityColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
              ${job.priority.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; font-size: 14px;">${scheduledDate}</td>
          <td style="padding: 12px; font-size: 14px;">
            <span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px;">
              ${job.status.toUpperCase()}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alertas de Manutenção MMI</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0;">
      <div style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🚨 Alertas de Manutenção</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Nautilus One - MMI (Manutenção Inteligente)</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Os seguintes jobs de manutenção requerem atenção imediata:
          </p>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <strong style="color: #92400e;">⚠️ Total de Jobs:</strong> ${jobs.length} job(s) crítico(s) ou de alta prioridade
          </div>

          <!-- Jobs Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Job</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Sistema</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Componente</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Prioridade</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Data Agendada</th>
                <th style="padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #374151;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${jobRows}
            </tbody>
          </table>

          <!-- Call to Action -->
          <div style="margin-top: 30px; text-align: center;">
            <a href="${Deno.env.get("SUPABASE_URL")}/mmi/dashboard" 
               style="display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Acessar Dashboard MMI
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Este é um alerta automático do sistema MMI (Manutenção Inteligente)<br>
            Função: send-alerts | Timestamp: ${now}
          </p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
            <strong>Nautilus One</strong> - Manutenção Inteligente embarcada com IA real 🌊
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
