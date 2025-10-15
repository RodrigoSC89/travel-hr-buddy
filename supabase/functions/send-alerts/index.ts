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
  description: string;
  priority: string;
  due_date: string;
  component: {
    name: string;
    system: {
      name: string;
      vessel: {
        name: string;
      }
    }
  }
}

interface VesselJobs {
  vessel_name: string;
  jobs: Job[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting alert notification process...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping email sending");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch critical and high-priority pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('mmi_jobs')
      .select(`
        id,
        title,
        description,
        priority,
        due_date,
        status,
        component:mmi_components!mmi_jobs_component_id_fkey (
          name,
          system:mmi_systems!mmi_components_system_id_fkey (
            name,
            vessel:vessels!mmi_systems_vessel_id_fkey (
              name
            )
          )
        )
      `)
      .in('priority', ['critical', 'high'])
      .in('status', ['pending', 'scheduled'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log("No critical or high-priority jobs to alert");
      return new Response(JSON.stringify({ 
        message: "No alerts to send",
        jobs_found: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${jobs.length} jobs requiring alerts`);

    // Group jobs by vessel
    const jobsByVessel: Map<string, Job[]> = new Map();
    
    for (const job of jobs as any[]) {
      const vesselName = job.component?.system?.vessel?.name || 'Unknown Vessel';
      if (!jobsByVessel.has(vesselName)) {
        jobsByVessel.set(vesselName, []);
      }
      jobsByVessel.get(vesselName)!.push(job as Job);
    }

    console.log(`Jobs grouped into ${jobsByVessel.size} vessels`);

    // Generate and send email for each vessel
    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    for (const [vesselName, vesselJobs] of jobsByVessel.entries()) {
      try {
        // Generate HTML email
        const htmlContent = generateEmailHTML(vesselName, vesselJobs);
        const textContent = generateEmailText(vesselName, vesselJobs);

        // Get recipients from profiles (managers, admins)
        const { data: recipients, error: recipientsError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .in('role', ['admin', 'manager'])
          .eq('notification_preferences->maintenance_alerts', true);

        if (recipientsError || !recipients || recipients.length === 0) {
          console.warn(`No recipients found for vessel ${vesselName}`);
          continue;
        }

        // Send email via Resend API
        if (resendApiKey) {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Nautilus One <alerts@nautilusone.com>",
              to: recipients.map((r: any) => r.email),
              subject: `🚨 Alertas de Manutenção - ${vesselName} (${vesselJobs.length} jobs)`,
              html: htmlContent,
              text: textContent,
              tags: [
                { name: "category", value: "maintenance-alert" },
                { name: "vessel", value: vesselName }
              ]
            }),
          });

          if (emailResponse.ok) {
            const result = await emailResponse.json();
            console.log(`Email sent for ${vesselName}:`, result.id);
            emailsSent.push(vesselName);
          } else {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email for ${vesselName}:`, errorText);
            emailsFailed.push(vesselName);
          }
        } else {
          console.log(`[DRY RUN] Would send email to ${recipients.length} recipients for ${vesselName}`);
          emailsSent.push(`${vesselName} (dry run)`);
        }

      } catch (error) {
        console.error(`Error processing vessel ${vesselName}:`, error);
        emailsFailed.push(vesselName);
      }
    }

    // Prepare response
    const response = {
      message: "Alert notification process completed",
      timestamp: new Date().toISOString(),
      summary: {
        jobs_found: jobs.length,
        vessels: jobsByVessel.size,
        emails_sent: emailsSent.length,
        emails_failed: emailsFailed.length
      },
      vessels_notified: emailsSent,
      vessels_failed: emailsFailed,
      jobs_by_vessel: Array.from(jobsByVessel.entries()).map(([vessel, jobs]) => ({
        vessel,
        job_count: jobs.length,
        critical_count: jobs.filter(j => j.priority === 'critical').length,
        high_count: jobs.filter(j => j.priority === 'high').length
      }))
    };

    console.log("Alert process completed:", response.summary);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in send-alerts function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateEmailHTML(vesselName: string, jobs: Job[]): string {
  const criticalJobs = jobs.filter(j => j.priority === 'critical');
  const highJobs = jobs.filter(j => j.priority === 'high');

  const jobRows = jobs.map(job => {
    const priorityColor = job.priority === 'critical' ? '#dc2626' : '#f59e0b';
    const priorityBg = job.priority === 'critical' ? '#fee2e2' : '#fef3c7';
    const dueDate = new Date(job.due_date).toLocaleDateString('pt-BR');
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827;">${job.title}</div>
          <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">
            ${job.component?.name || 'N/A'} - ${job.component?.system?.name || 'N/A'}
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="background: ${priorityBg}; color: ${priorityColor}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
            ${job.priority}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">
          ${dueDate}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alertas de Manutenção - ${vesselName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🚨 Alertas de Manutenção
              </h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 18px;">
                ${vesselName}
              </p>
            </td>
          </tr>
          
          <!-- Summary -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 18px;">Resumo</h2>
                <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                  <strong>${jobs.length} jobs</strong> de manutenção requerem atenção:<br>
                  • <span style="color: #dc2626; font-weight: 600;">${criticalJobs.length} Críticos</span><br>
                  • <span style="color: #f59e0b; font-weight: 600;">${highJobs.length} Alta Prioridade</span>
                </p>
              </div>
              
              <!-- Jobs Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">
                      Job / Componente
                    </th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">
                      Prioridade
                    </th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">
                      Data Prevista
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${jobRows}
                </tbody>
              </table>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://nautilusone.com/mmi/jobs" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                  Acessar Central de Manutenção
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Nautilus One</strong> - Sistema de Gestão Marítima<br>
                Alerta gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                Para alterar suas preferências de notificação, acesse Configurações &gt; Notificações
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generateEmailText(vesselName: string, jobs: Job[]): string {
  const criticalJobs = jobs.filter(j => j.priority === 'critical');
  const highJobs = jobs.filter(j => j.priority === 'high');

  let text = `ALERTAS DE MANUTENÇÃO - ${vesselName}\n`;
  text += `${'='.repeat(60)}\n\n`;
  text += `Resumo:\n`;
  text += `- Total de jobs: ${jobs.length}\n`;
  text += `- Críticos: ${criticalJobs.length}\n`;
  text += `- Alta Prioridade: ${highJobs.length}\n\n`;
  text += `${'='.repeat(60)}\n\n`;
  text += `JOBS:\n\n`;

  jobs.forEach((job, index) => {
    text += `${index + 1}. [${job.priority.toUpperCase()}] ${job.title}\n`;
    text += `   Componente: ${job.component?.name || 'N/A'}\n`;
    text += `   Sistema: ${job.component?.system?.name || 'N/A'}\n`;
    text += `   Data Prevista: ${new Date(job.due_date).toLocaleDateString('pt-BR')}\n`;
    if (job.description) {
      text += `   Descrição: ${job.description}\n`;
    }
    text += `\n`;
  });

  text += `${'='.repeat(60)}\n`;
  text += `Acesse o sistema: https://nautilusone.com/mmi/jobs\n\n`;
  text += `Nautilus One - Sistema de Gestão Marítima\n`;
  text += `Alerta gerado automaticamente em ${new Date().toLocaleString('pt-BR')}\n`;

  return text;
}
