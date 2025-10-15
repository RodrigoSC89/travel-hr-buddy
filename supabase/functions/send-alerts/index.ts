// ============================================================================
// Supabase Edge Function: send-alerts
// Purpose: Email notification system for critical/high-priority maintenance jobs
// Schedule: Runs daily at 8 AM via cron (0 8 * * *)
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MMIJob {
  id: string;
  title: string;
  description: string;
  priority: string;
  due_date: string;
  component_id: string;
  suggestion_ia: string;
  mmi_components?: {
    component_name: string;
    current_hours: number;
    maintenance_interval_hours: number;
    mmi_systems?: {
      system_name: string;
      vessel_id: string;
    };
  };
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai';
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'alertas@nautilus.ai';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured, skipping email sending');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email service not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting maintenance alerts...');

    // Fetch critical and high-priority pending jobs
    const { data: jobs, error: fetchError } = await supabase
      .from('mmi_jobs')
      .select(`
        id,
        title,
        description,
        priority,
        due_date,
        component_id,
        suggestion_ia,
        mmi_components (
          component_name,
          current_hours,
          maintenance_interval_hours,
          mmi_systems (
            system_name,
            vessel_id
          )
        )
      `)
      .in('status', ['pending', 'in_progress'])
      .in('priority', ['critical', 'high'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching jobs:', fetchError);
      throw fetchError;
    }

    if (!jobs || jobs.length === 0) {
      console.log('ℹ️  No critical or high-priority jobs found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No alerts to send',
          jobs_found: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${jobs.length} jobs requiring alerts`);

    // Group jobs by vessel (if vessel_id exists)
    const jobsByVessel = new Map<string, MMIJob[]>();
    
    for (const job of jobs as MMIJob[]) {
      const vesselId = job.mmi_components?.mmi_systems?.vessel_id || 'general';
      if (!jobsByVessel.has(vesselId)) {
        jobsByVessel.set(vesselId, []);
      }
      jobsByVessel.get(vesselId)!.push(job);
    }

    // Generate HTML email content
    const emailHtml = generateEmailHtml(jobs as MMIJob[]);

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `🚢 Nautilus MMI - ${jobs.length} Trabalhos Prioritários Requerem Atenção`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('❌ Error sending email:', errorData);
      throw new Error(`Email API error: ${errorData}`);
    }

    const emailResult = await emailResponse.json();
    console.log('✅ Email sent successfully:', emailResult);

    // Prepare response summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      jobs_found: jobs.length,
      emails_sent: 1,
      recipients: [adminEmail],
      job_breakdown: {
        critical: jobs.filter((j) => (j as MMIJob).priority === 'critical').length,
        high: jobs.filter((j) => (j as MMIJob).priority === 'high').length,
      },
      email_id: emailResult.id,
    };

    console.log('✅ Alerts sent successfully!');
    console.log(`📊 Summary: ${summary.jobs_found} jobs, ${summary.emails_sent} email(s) sent`);
    console.log(`⚠️  Breakdown: ${summary.job_breakdown.critical} critical, ${summary.job_breakdown.high} high`);

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in send-alerts:', error);
    
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

// Generate professional HTML email template
function generateEmailHtml(jobs: MMIJob[]): string {
  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c';     // orange-600
      case 'medium': return '#ca8a04';   // yellow-600
      default: return '#6b7280';          // gray-500
    }
  };

  const priorityEmoji = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '⚪';
    }
  };

  const priorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'CRÍTICO';
      case 'high': return 'ALTO';
      case 'medium': return 'MÉDIO';
      default: return 'BAIXO';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const jobCards = jobs.map((job) => `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid ${priorityColor(job.priority)};
    ">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="
          display: inline-block;
          padding: 4px 12px;
          background: ${priorityColor(job.priority)};
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        ">
          ${priorityEmoji(job.priority)} ${priorityLabel(job.priority)}
        </span>
      </div>
      
      <h3 style="
        margin: 0 0 12px 0;
        color: #1f2937;
        font-size: 18px;
        font-weight: 600;
      ">
        ${job.title}
      </h3>
      
      <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        ${job.description ? `<p style="margin: 8px 0;">${job.description}</p>` : ''}
        
        ${job.mmi_components ? `
          <p style="margin: 8px 0;">
            <strong>Componente:</strong> ${job.mmi_components.component_name}
            ${job.mmi_components.current_hours ? 
              ` (${job.mmi_components.current_hours.toFixed(1)}h de ${job.mmi_components.maintenance_interval_hours}h)` 
              : ''}
          </p>
        ` : ''}
        
        ${job.mmi_components?.mmi_systems?.system_name ? `
          <p style="margin: 8px 0;">
            <strong>Sistema:</strong> ${job.mmi_components.mmi_systems.system_name}
          </p>
        ` : ''}
        
        <p style="margin: 8px 0;">
          <strong>Prazo:</strong> ${formatDate(job.due_date)}
        </p>
        
        ${job.suggestion_ia ? `
          <div style="
            margin-top: 12px;
            padding: 12px;
            background: #f3f4f6;
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
          ">
            <p style="margin: 0; color: #374151; font-size: 13px;">
              <strong>💡 Sugestão IA:</strong> ${job.suggestion_ia}
            </p>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nautilus MMI - Alertas de Manutenção</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    ">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin-bottom: 24px;
        ">
          <h1 style="
            margin: 0 0 12px 0;
            color: white;
            font-size: 24px;
            font-weight: 700;
          ">
            🚢 Nautilus MMI
          </h1>
          <p style="
            margin: 0;
            color: rgba(255,255,255,0.9);
            font-size: 16px;
          ">
            Manutenção Inteligente - Alerta de Trabalhos Prioritários
          </p>
        </div>
        
        <!-- Summary -->
        <div style="
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <p style="
            margin: 0 0 12px 0;
            color: #1f2937;
            font-size: 16px;
          ">
            <strong>${jobs.length} trabalho(s) prioritário(s)</strong> requerem sua atenção:
          </p>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <span style="color: #dc2626; font-size: 24px; font-weight: 700;">
                ${jobs.filter(j => j.priority === 'critical').length}
              </span>
              <span style="color: #6b7280; font-size: 14px; display: block;">
                Críticos
              </span>
            </div>
            <div style="flex: 1;">
              <span style="color: #ea580c; font-size: 24px; font-weight: 700;">
                ${jobs.filter(j => j.priority === 'high').length}
              </span>
              <span style="color: #6b7280; font-size: 14px; display: block;">
                Altos
              </span>
            </div>
          </div>
        </div>
        
        <!-- Job Cards -->
        ${jobCards}
        
        <!-- Footer -->
        <div style="
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        ">
          <p style="margin: 0 0 8px 0;">
            Este é um alerta automático do sistema Nautilus MMI.
          </p>
          <p style="margin: 0;">
            Timestamp: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
