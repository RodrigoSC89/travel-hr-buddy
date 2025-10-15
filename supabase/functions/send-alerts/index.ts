/**
 * send-alerts Edge Function
 * 
 * Purpose: Email notification system for critical/high-priority maintenance jobs
 * Schedule: Runs daily at 08:00 via cron (0 8 * * *)
 * 
 * Features:
 * - Professional HTML templates with gradient design
 * - Job grouping by vessel
 * - Priority color coding (critical=red, high=orange, medium=yellow)
 * - Resend API integration
 * - Summary statistics
 */

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
  vessel: string;
  component: string;
  asset_name: string;
  status: string;
  suggestion_ia: string | null;
}

interface VesselJobs {
  vessel: string;
  jobs: Job[];
}

// Priority colors for visual distinction
const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: '#ef4444', text: '#ffffff', label: '🔴 CRÍTICO' },
  high: { bg: '#f97316', text: '#ffffff', label: '🟠 ALTO' },
  medium: { bg: '#eab308', text: '#ffffff', label: '🟡 MÉDIO' },
  low: { bg: '#22c55e', text: '#ffffff', label: '🟢 BAIXO' }
};

function generateEmailHTML(jobsByVessel: VesselJobs[], summary: any): string {
  const jobsHTML = jobsByVessel.map(({ vessel, jobs }) => `
    <div style="margin-bottom: 30px; background: #f8fafc; border-radius: 8px; padding: 20px;">
      <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
        🚢 ${vessel || 'Sem embarcação definida'}
      </h2>
      ${jobs.map(job => {
        const priority = priorityColors[job.priority] || priorityColors.medium;
        const dueDate = new Date(job.due_date);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        
        return `
          <div style="background: white; border-left: 4px solid ${priority.bg}; padding: 15px; margin-bottom: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <h3 style="color: #334155; margin: 0; font-size: 16px; flex: 1;">
                ${job.title}
              </h3>
              <span style="background: ${priority.bg}; color: ${priority.text}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; margin-left: 10px;">
                ${priority.label}
              </span>
            </div>
            
            ${job.description ? `
              <p style="color: #64748b; font-size: 14px; margin: 10px 0; line-height: 1.5;">
                ${job.description}
              </p>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0; font-size: 13px;">
              <div>
                <strong style="color: #475569;">Componente:</strong>
                <span style="color: #64748b;">${job.component || job.asset_name || 'N/A'}</span>
              </div>
              <div>
                <strong style="color: #475569;">Vencimento:</strong>
                <span style="color: ${isOverdue ? '#ef4444' : '#64748b'}; font-weight: ${isOverdue ? 'bold' : 'normal'};">
                  ${dueDate.toLocaleDateString('pt-BR')}
                  ${isOverdue ? ' (ATRASADO)' : ` (${daysUntilDue} dias)`}
                </span>
              </div>
            </div>
            
            ${job.suggestion_ia ? `
              <div style="background: #f1f5f9; border-left: 3px solid #3b82f6; padding: 10px; margin-top: 10px; border-radius: 4px;">
                <strong style="color: #1e40af; font-size: 12px;">💡 Sugestão IA:</strong>
                <p style="color: #475569; font-size: 13px; margin: 5px 0 0 0; line-height: 1.4;">
                  ${job.suggestion_ia}
                </p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alertas de Manutenção MMI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 800px; margin: 0 auto; background: white;">
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">
        🔔 Alertas de Manutenção MMI
      </h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
        Sistema de Manutenção Inteligente - Nautilus One
      </p>
    </div>
    
    <!-- Summary Statistics -->
    <div style="background: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${summary.critical_count}</div>
          <div style="font-size: 12px; color: #64748b;">Críticos</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #f97316;">${summary.high_count}</div>
          <div style="font-size: 12px; color: #64748b;">Alta Prioridade</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #eab308;">${summary.medium_count}</div>
          <div style="font-size: 12px; color: #64748b;">Média Prioridade</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${summary.total_jobs}</div>
          <div style="font-size: 12px; color: #64748b;">Total de Jobs</div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px 20px;">
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 0;">
        Este é o relatório diário de alertas de manutenção. Os jobs abaixo requerem atenção imediata ou estão próximos do vencimento.
      </p>
      
      ${jobsHTML}
      
      ${summary.total_jobs === 0 ? `
        <div style="text-align: center; padding: 40px 20px; color: #64748b;">
          <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
          <p style="font-size: 16px; margin: 0;">Nenhum alerta de manutenção no momento!</p>
          <p style="font-size: 14px; margin: 10px 0 0 0;">Todas as manutenções estão em dia.</p>
        </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div style="background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 12px;">
      <p style="margin: 0 0 10px 0;">
        Este é um email automático gerado pelo sistema MMI.
      </p>
      <p style="margin: 0; opacity: 0.7;">
        © ${new Date().getFullYear()} Nautilus One - Sistema de Manutenção Inteligente
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
    console.log("📧 Starting send-alerts function...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const alertEmailTo = Deno.env.get("ALERT_EMAIL_TO") || "alerts@example.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Fetch critical and high-priority pending jobs
    const { data: jobs, error: fetchError } = await supabase
      .from('mmi_jobs')
      .select('*')
      .eq('status', 'pending')
      .in('priority', ['critical', 'high', 'medium'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (fetchError) {
      console.error("Error fetching jobs:", fetchError);
      throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
    }

    console.log(`📊 Found ${jobs?.length || 0} jobs requiring attention`);

    // Group jobs by vessel
    const jobsByVessel: VesselJobs[] = [];
    const vesselsMap = new Map<string, Job[]>();

    (jobs || []).forEach((job: Job) => {
      const vessel = job.vessel || 'Sem embarcação';
      if (!vesselsMap.has(vessel)) {
        vesselsMap.set(vessel, []);
      }
      vesselsMap.get(vessel)!.push(job);
    });

    vesselsMap.forEach((jobs, vessel) => {
      jobsByVessel.push({ vessel, jobs });
    });

    // Calculate summary statistics
    const summary = {
      total_jobs: jobs?.length || 0,
      critical_count: jobs?.filter(j => j.priority === 'critical').length || 0,
      high_count: jobs?.filter(j => j.priority === 'high').length || 0,
      medium_count: jobs?.filter(j => j.priority === 'medium').length || 0,
      vessels_affected: jobsByVessel.length
    };

    // Generate HTML email
    const emailHTML = generateEmailHTML(jobsByVessel, summary);

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MMI Alerts <alerts@resend.dev>",
        to: alertEmailTo,
        subject: `🔔 Alertas de Manutenção MMI - ${summary.critical_count} Críticos, ${summary.high_count} Altos`,
        html: emailHTML,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      throw new Error(`Failed to send email: ${emailResponse.statusText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("✅ Email sent successfully:", emailResult);

    return new Response(JSON.stringify({
      message: "Alerts sent successfully",
      timestamp: new Date().toISOString(),
      summary,
      email_id: emailResult.id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error in send-alerts function:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
