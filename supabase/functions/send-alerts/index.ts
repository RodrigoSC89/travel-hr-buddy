import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  title: string;
  priority: string;
  due_date: string;
  status: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
}

interface AlertEmailData {
  vessel: string;
  jobs: Job[];
}

function generateEmailHTML(alerts: AlertEmailData[]): string {
  const priorityColors = {
    critical: "#dc2626",
    high: "#f59e0b",
    medium: "#3b82f6",
    low: "#10b981",
  };

  const jobsHtml = alerts
    .map((alert) => {
      const jobRows = alert.jobs
        .map(
          (job) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <strong>${job.title}</strong><br/>
            <span style="color: #6b7280; font-size: 14px;">${job.component.name} - ${job.component.asset.name}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="
              display: inline-block;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              color: white;
              background-color: ${priorityColors[job.priority as keyof typeof priorityColors] || "#6b7280"};
            ">
              ${job.priority.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${new Date(job.due_date).toLocaleDateString("pt-BR")}
          </td>
        </tr>
      `
        )
        .join("");

      return `
        <div style="margin-bottom: 32px;">
          <h2 style="
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
          ">
            🚢 ${alert.vessel}
          </h2>
          <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Job / Componente</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Prioridade</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Data Limite</th>
              </tr>
            </thead>
            <tbody>
              ${jobRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alertas de Manutenção - Nautilus One</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      padding: 32px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    ">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        🔧 Alertas de Manutenção
      </h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
        Nautilus One - MMI (Manutenção Inteligente)
      </p>
    </div>

    <!-- Content -->
    <div style="background-color: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Prezado(a),
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Seguem os <strong>jobs de manutenção críticos e de alta prioridade</strong> que requerem atenção:
      </p>

      ${jobsHtml}

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${Deno.env.get("APP_URL") || "https://app.nautilus-one.com"}/mmi/jobs" style="
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        ">
          Acessar Módulo MMI →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;">
        © ${new Date().getFullYear()} Nautilus One. Todos os direitos reservados.
      </p>
      <p style="margin: 8px 0 0 0;">
        Este é um alerta automático do sistema MMI.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting maintenance alerts process...");

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch critical and high priority jobs that are pending or in progress
    const { data: jobs, error: jobsError } = await supabase
      .from("mmi_jobs")
      .select(`
        id,
        title,
        priority,
        due_date,
        status,
        component:mmi_components (
          name,
          asset:mmi_systems (
            name,
            vessel
          )
        )
      `)
      .in("priority", ["critical", "high"])
      .in("status", ["pending", "in_progress"])
      .order("priority", { ascending: true })
      .order("due_date", { ascending: true });

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log("No critical or high priority jobs found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No alerts to send",
          jobs_found: 0,
          emails_sent: 0,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${jobs.length} critical/high priority jobs`);

    // Group jobs by vessel
    const jobsByVessel = jobs.reduce((acc: Record<string, Job[]>, job: any) => {
      const vessel = job.component?.asset?.vessel || "Unknown Vessel";
      if (!acc[vessel]) {
        acc[vessel] = [];
      }
      acc[vessel].push({
        id: job.id,
        title: job.title,
        priority: job.priority,
        due_date: job.due_date,
        status: job.status,
        component: {
          name: job.component?.name || "Unknown Component",
          asset: {
            name: job.component?.asset?.name || "Unknown Asset",
            vessel: vessel,
          },
        },
      });
      return acc;
    }, {});

    const alerts: AlertEmailData[] = Object.entries(jobsByVessel).map(
      ([vessel, vesselJobs]) => ({
        vessel,
        jobs: vesselJobs,
      })
    );

    // Generate HTML email
    const emailHtml = generateEmailHTML(alerts);

    // Send email via Resend API
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email send");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Alerts generated but email not sent (no API key)",
          jobs_found: jobs.length,
          vessels_affected: alerts.length,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const emailRecipient = Deno.env.get("MMI_ALERTS_EMAIL") || "maintenance@nautilus-one.com";

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nautilus One MMI <noreply@nautilus-one.com>",
        to: [emailRecipient],
        subject: `⚠️ Alertas de Manutenção - ${alerts.length} embarcação(ões) com jobs prioritários`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Failed to send email: ${emailResponse.status} - ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Maintenance alerts sent successfully",
        jobs_found: jobs.length,
        vessels_affected: alerts.length,
        email_id: emailResult.id,
        timestamp: new Date().toISOString(),
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
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
