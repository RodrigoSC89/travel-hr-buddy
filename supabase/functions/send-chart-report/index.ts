import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  imageBase64: string;
  toEmail?: string;
  subject?: string;
  chartType?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, toEmail, subject, chartType }: EmailRequest = await req.json();
    
    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    // Get email configuration from environment
    const emailHost = Deno.env.get("EMAIL_HOST") || "smtp.gmail.com";
    const emailPort = parseInt(Deno.env.get("EMAIL_PORT") || "587", 10);
    const emailUser = Deno.env.get("EMAIL_USER");
    const emailPass = Deno.env.get("EMAIL_PASS");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const defaultEmailTo = Deno.env.get("EMAIL_TO") || "admin@empresa.com";

    if (!emailUser || !emailPass) {
      throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
    }

    const recipientEmail = toEmail || defaultEmailTo;
    const emailSubject = subject || `📊 ${chartType || "Chart"} Report - Nautilus One`;

    // Clean base64 string (remove data:image/png;base64, prefix if present)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Import SMTP library (using a Deno-compatible SMTP library)
    // Note: For production use, consider using SendGrid, Mailgun, or other email service APIs
    // This is a simplified implementation that would need proper SMTP support in Deno

    // For now, we'll use fetch to call an external email API or service
    // In production, you'd integrate with SendGrid, Mailgun, AWS SES, etc.
    
    console.log(`Preparing to send email to: ${recipientEmail}`);
    console.log(`Email configuration: ${emailHost}:${emailPort} from ${emailFrom}`);
    console.log(`Chart type: ${chartType || "Generic"}`);
    
    // Build the email message
    const emailMessage = {
      from: emailFrom,
      to: recipientEmail,
      subject: emailSubject,
      text: `Segue em anexo o gráfico ${chartType || ""} de relatórios.\n\nEste é um email automático gerado pelo sistema Nautilus One.`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Relatório de Gráficos</h1>
                <p>Nautilus One - Travel HR Buddy</p>
              </div>
              <div class="content">
                <p>Olá,</p>
                <p>Segue em anexo o gráfico ${chartType || ""} solicitado.</p>
                <p>Este relatório foi gerado automaticamente pelo sistema e contém as informações mais recentes disponíveis.</p>
                <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              <div class="footer">
                <p>Este é um email automático. Por favor, não responda.</p>
                <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `${chartType || "chart"}-report-${new Date().toISOString().split('T')[0]}.png`,
          content: cleanBase64,
          encoding: "base64",
        },
      ],
    };

    // Log the attempt (in production, you'd actually send the email here)
    console.log("Email prepared successfully");
    console.log(`Attachment size: ${cleanBase64.length} bytes`);

    // Return success response
    // Note: In a real implementation, you would integrate with an email service here
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email prepared successfully. Integration with email service required for actual sending.",
        recipient: recipientEmail,
        subject: emailSubject,
        timestamp: new Date().toISOString(),
        note: "To complete this feature, integrate with SendGrid, Mailgun, AWS SES, or configure SMTP in production"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-chart-report:", error);
    
    // Type guard for Error objects
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An error occurred while sending the report";
    
    const errorDetails = error instanceof Error 
      ? error.toString() 
      : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
