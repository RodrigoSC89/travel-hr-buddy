// ✅ Supabase Edge Function — Send Multi-User Restore Reports
// Loops through users and sends individual restore summary reports

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

/**
 * Generate HTML email content for user restore summary
 */
function generateEmailHtml(email: string, summary: RestoreSummary): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat { display: inline-block; margin: 10px 20px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #666; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório de Restaurações Individual</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>Olá, ${email}!</h2>
            <p>Aqui está o resumo das suas restaurações de documentos:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div class="stat">
                <div class="stat-value">${summary.total}</div>
                <div class="stat-label">Total de Restaurações</div>
              </div>
              <div class="stat">
                <div class="stat-value">${summary.unique_docs}</div>
                <div class="stat-label">Documentos Únicos</div>
              </div>
              <div class="stat">
                <div class="stat-value">${summary.avg_per_day}</div>
                <div class="stat-label">Média por Dia</div>
              </div>
            </div>
            
            <p>Continue utilizando o sistema para restaurar e gerenciar seus documentos com eficiência!</p>
          </div>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado pelo sistema.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "relatorios@nautilus.ai",
      to: toEmail,
      subject: subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting multi-user restore report generation...");

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body to get user emails
    const body = await req.json();
    const users = body.users || ['ana@empresa.com', 'joao@empresa.com'];
    
    console.log(`📧 Processing ${users.length} users...`);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const results = [];
    
    // Loop through each user
    for (const email of users) {
      try {
        console.log(`Processing user: ${email}`);
        
        // Call get_restore_summary RPC function for this user
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_restore_summary', { email_input: email });

        if (summaryError) {
          console.error(`Error fetching summary for ${email}:`, summaryError);
          results.push({
            email,
            success: false,
            error: summaryError.message
          });
          continue;
        }

        // Get the summary (it's returned as an array with one element)
        const summary: RestoreSummary = summaryData?.[0] || {
          total: 0,
          unique_docs: 0,
          avg_per_day: 0
        };

        console.log(`Summary for ${email}:`, summary);

        // Generate and send email
        const emailHtml = generateEmailHtml(email, summary);
        const subject = `📊 Relatório de Restaurações - ${new Date().toLocaleDateString('pt-BR')}`;

        await sendEmailViaResend(email, subject, emailHtml, RESEND_API_KEY);

        console.log(`✅ Email sent successfully to ${email}`);
        
        results.push({
          email,
          success: true,
          summary
        });
      } catch (error) {
        console.error(`Error processing ${email}:`, error);
        results.push({
          email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    console.log("✅ Multi-user report generation complete");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Multi-user reports processed",
        results,
        total_users: users.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error in multi-user restore reports:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
