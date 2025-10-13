import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "relatorios@nautilus.ai";

interface RestoreSummary {
  email: string;
  total_restores: number;
  unique_documents: number;
  avg_per_day: number;
}

serve(async (req) => {
  try {
    // Validate environment variables
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    // Parse request body
    const { users } = await req.json();
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid request: 'users' must be a non-empty array of email addresses" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results = [];
    const errors = [];

    // Process each user
    for (const email of users) {
      try {
        console.log(`Processing report for: ${email}`);

        // Call the get_restore_summary RPC function
        const { data, error } = await supabase.rpc("get_restore_summary", {
          email_input: email,
        });

        if (error) {
          console.error(`Error fetching summary for ${email}:`, error);
          errors.push({ email, error: error.message });
          continue;
        }

        const summary: RestoreSummary = data || {
          email,
          total_restores: 0,
          unique_documents: 0,
          avg_per_day: 0,
        };

        // Generate HTML email
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .stat-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Restaurações</h1>
      <p>Resumo das suas atividades de restauração</p>
    </div>
    <div class="content">
      <p>Olá,</p>
      <p>Aqui está o seu resumo de restaurações de documentos:</p>
      
      <div class="stat-card">
        <div class="stat-value">${summary.total_restores}</div>
        <div class="stat-label">Total de Restaurações</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${summary.unique_documents}</div>
        <div class="stat-label">Documentos Únicos</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${summary.avg_per_day.toFixed(1)}</div>
        <div class="stat-label">Média por Dia</div>
      </div>
      
      <p style="margin-top: 30px;">
        Este relatório foi gerado automaticamente pelo sistema de auditoria.
      </p>
    </div>
    <div class="footer">
      <p>Travel HR Buddy - Sistema de Gestão de Documentos</p>
      <p>Este é um e-mail automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>
        `;

        // Send email via Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: EMAIL_FROM,
            to: email,
            subject: "📊 Relatório de Restaurações - Travel HR Buddy",
            html: htmlContent,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error(`Failed to send email to ${email}:`, errorText);
          errors.push({ email, error: `Email send failed: ${errorText}` });
          continue;
        }

        const resendData = await resendResponse.json();
        console.log(`Email sent successfully to ${email}:`, resendData);
        
        results.push({
          email,
          status: "success",
          summary,
          emailId: resendData.id,
        });

      } catch (userError) {
        console.error(`Error processing ${email}:`, userError);
        errors.push({ 
          email, 
          error: userError instanceof Error ? userError.message : "Unknown error" 
        });
      }
    }

    // Return results
    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} of ${users.length} users`,
        success: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in send-multi-user-restore-reports:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
});
