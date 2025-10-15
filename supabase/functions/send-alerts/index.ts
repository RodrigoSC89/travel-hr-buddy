import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Priority colors for email template
const PRIORITY_COLORS: Record<string, string> = {
  crítica: "#EF4444", // Red
  alta: "#F97316",    // Orange
  média: "#EAB308",   // Yellow
  baixa: "#10B981"    // Green
};

// Priority icons
const PRIORITY_ICONS: Record<string, string> = {
  crítica: "🚨",
  alta: "⚠️",
  média: "📋",
  baixa: "✅"
};

// Generate HTML email template
const generateEmailHTML = (jobs: any[], vesselName: string): string => {
  const jobRows = jobs.map(job => {
    const color = PRIORITY_COLORS[job.priority] || "#6B7280";
    const icon = PRIORITY_ICONS[job.priority] || "📋";
    const dueDate = new Date(job.due_date).toLocaleDateString('pt-BR');
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          ${icon} <strong>${job.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          ${job.component?.name || 'N/A'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
            ${job.priority.toUpperCase()}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          ${dueDate}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">
          <span style="background: ${job.status === 'pendente' ? '#FEF3C7' : '#DBEAFE'}; color: ${job.status === 'pendente' ? '#92400E' : '#1E40AF'}; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
            ${job.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alertas MMI - ${vesselName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 800px; margin: 0 auto; background: white;">
    <!-- Header with gradient -->
    <tr>
      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
          ⚓ Nautilus One - MMI
        </h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
          Manutenção Inteligente
        </p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 20px;">
        <h2 style="color: #1F2937; margin: 0 0 8px 0; font-size: 24px;">
          Alertas de Manutenção - ${vesselName}
        </h2>
        <p style="color: #6B7280; margin: 0 0 24px 0; font-size: 14px;">
          ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
          <p style="margin: 0; color: #92400E; font-size: 14px;">
            <strong>⚠️ Atenção:</strong> Você tem <strong>${jobs.length}</strong> ${jobs.length === 1 ? 'job de manutenção que requer' : 'jobs de manutenção que requerem'} sua atenção.
          </p>
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #F9FAFB;">
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #E5E7EB;">
                Job
              </th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #E5E7EB;">
                Componente
              </th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #E5E7EB;">
                Prioridade
              </th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #E5E7EB;">
                Data Prevista
              </th>
              <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #E5E7EB;">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            ${jobRows}
          </tbody>
        </table>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${Deno.env.get('FRONTEND_URL') || 'https://app.nautilus-one.com'}/mmi/jobs" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            🔧 Acessar MMI Dashboard
          </a>
        </div>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 12px; margin: 0;">
            💡 <strong>Dica:</strong> Use o AI Copilot para análise de risco e sugestões de postergação.
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #F9FAFB; padding: 24px 20px; text-align: center; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px; margin: 0 0 8px 0;">
          © ${new Date().getFullYear()} Nautilus One. Todos os direitos reservados.
        </p>
        <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
          Você está recebendo este e-mail porque é responsável pela manutenção de ${vesselName}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting alert generation...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Resend API key
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - skipping email send");
    }

    // Fetch critical and high priority jobs due within 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: jobs, error: jobsError } = await supabase
      .from('mmi_jobs')
      .select(`
        id,
        title,
        description,
        priority,
        status,
        due_date,
        component_id,
        mmi_components (
          id,
          name,
          system_id,
          mmi_systems (
            id,
            name,
            vessel_id
          )
        )
      `)
      .in('priority', ['crítica', 'alta'])
      .in('status', ['pendente', 'em_andamento', 'postergada'])
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError);
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log("No critical or high priority jobs found");
      return new Response(JSON.stringify({ 
        message: "No alerts to send",
        jobs_checked: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${jobs.length} jobs requiring alerts`);

    // Group jobs by vessel
    const jobsByVessel: Record<string, any[]> = {};
    
    for (const job of jobs) {
      const component = job.mmi_components;
      if (!component) continue;
      
      const system = component.mmi_systems;
      const vesselId = system?.vessel_id || 'unknown';
      const vesselName = vesselId; // In production, fetch actual vessel name
      
      if (!jobsByVessel[vesselName]) {
        jobsByVessel[vesselName] = [];
      }
      
      jobsByVessel[vesselName].push({
        ...job,
        component: {
          name: component.name,
          system: system?.name
        }
      });
    }

    const results = {
      total_jobs: jobs.length,
      vessels_alerted: 0,
      emails_sent: 0,
      errors: [] as string[]
    };

    // Send alert for each vessel
    for (const [vesselName, vesselJobs] of Object.entries(jobsByVessel)) {
      try {
        console.log(`Generating alert for ${vesselName} (${vesselJobs.length} jobs)`);
        
        const htmlContent = generateEmailHTML(vesselJobs, vesselName);

        // Send email via Resend API
        if (RESEND_API_KEY) {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: Deno.env.get("RESEND_FROM_EMAIL") || "alerts@nautilus-one.com",
              to: Deno.env.get("ALERT_EMAIL_TO") || "maintenance@nautilus-one.com",
              subject: `🚨 MMI Alert - ${vesselJobs.length} Jobs Pendentes - ${vesselName}`,
              html: htmlContent,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to send email for ${vesselName}:`, error);
            results.errors.push(`${vesselName}: ${error}`);
            continue;
          }

          const emailResult = await response.json();
          console.log(`✅ Email sent for ${vesselName}:`, emailResult);
          results.emails_sent++;
        } else {
          console.log(`📧 Would send email for ${vesselName} (${vesselJobs.length} jobs)`);
        }

        results.vessels_alerted++;

      } catch (vesselError) {
        console.error(`Error processing vessel ${vesselName}:`, vesselError);
        results.errors.push(`${vesselName}: ${vesselError.message}`);
      }
    }

    console.log("Alert generation complete:", results);

    return new Response(JSON.stringify({
      message: "Alert generation completed",
      timestamp: new Date().toISOString(),
      results: results
    }), {
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
