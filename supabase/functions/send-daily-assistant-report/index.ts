// ✅ Supabase Edge Function — Envio automático de gráfico por e-mail (PDF)

import { serve } from 'https://deno.land/std/http/server.ts';
import { Resend } from 'npm:resend';
import jsPDF from 'npm:jspdf';
import autoTable from 'npm:jspdf-autotable';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistantLog {
  sent_at: string;
  user_email: string;
  status: string;
  message: string;
}

/**
 * Log execution status to assistant_report_logs table
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  logs_count: number = 0,
  error: any = null
) {
  try {
    await supabase.from('assistant_report_logs').insert({
      status,
      message,
      logs_count,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: 'automated',
    });
  } catch (logError) {
    console.error('Failed to log execution:', logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  try {
    console.log('🚀 Starting daily assistant report generation...');

    // Fetch logs from last 24 hours
    const { data: logs, error } = await supabase
      .from('assistant_report_logs')
      .select('*')
      .gte('sent_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString());

    if (error) {
      console.error('Erro ao buscar logs:', error);
      await logExecution(supabase, 'error', 'Erro ao buscar logs', 0, error);
      return new Response('Erro ao buscar logs', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log(`✅ Fetched ${logs?.length || 0} logs from last 24h`);

    // Generate PDF
    const doc = new jsPDF();
    doc.text('📬 Envio diário de relatórios do Assistente IA', 14, 16);
    
    autoTable(doc, {
      startY: 24,
      head: [['Data', 'Usuário', 'Status', 'Mensagem']],
      body: logs.map((log: any) => [
        new Date(log.sent_at).toLocaleString(),
        log.user_email || '-',
        log.status,
        log.message || '-'
      ]),
      styles: { fontSize: 8 },
    });

    const pdfBuffer = doc.output('arraybuffer');

    console.log('📧 Sending email with PDF report...');

    // Send email via Resend
    const { error: sendErr } = await resend.emails.send({
      from: Deno.env.get('EMAIL_FROM') || 'nao-responda@nautilus.ai',
      to: Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai',
      subject: '📬 Relatório Diário do Assistente IA',
      html: `<p>Olá! Segue o relatório com os envios de hoje do Assistente IA.</p>`,
      attachments: [
        {
          filename: 'relatorio-assistente.pdf',
          content: Buffer.from(pdfBuffer),
        }
      ]
    });

    if (sendErr) {
      console.error('Erro ao enviar e-mail:', sendErr);
      await logExecution(supabase, 'error', 'Erro ao enviar e-mail', logs?.length || 0, sendErr);
      return new Response('Erro ao enviar e-mail', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ Email sent successfully!');
    
    // Log successful execution
    await logExecution(
      supabase, 
      'success', 
      `Relatório enviado com sucesso para ${Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai'}`,
      logs?.length || 0
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: '✅ Relatório enviado com sucesso',
        logsCount: logs?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in send-daily-assistant-report:', error);
    
    // Log critical error
    await logExecution(supabase, 'critical', 'Erro crítico na função', 0, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
