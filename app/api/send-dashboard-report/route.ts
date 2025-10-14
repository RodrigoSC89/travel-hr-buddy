// /app/api/send-dashboard-report/route.ts
// Next.js API Route for sending automated dashboard reports with PDF attachment

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/send-dashboard-report
 * 
 * Generates a PDF snapshot of the public dashboard and emails it to admin users.
 * This endpoint can be triggered manually or via cron job.
 * 
 * Features:
 * - Finds admin user email from profiles table
 * - Uses Puppeteer to generate PDF from public dashboard (?public=1)
 * - Sends PDF via Resend email service
 * - Includes proper error handling and logging
 * 
 * Environment Variables Required:
 * - RESEND_API_KEY: Resend API key for sending emails
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - BASE_URL: Base URL of the application (e.g., https://yourdomain.com)
 */
export async function GET() {
  try {
    console.log("📊 Starting dashboard report generation...");

    // Buscar admin user email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (userError || !userData?.email) {
      throw new Error("Admin email not found.");
    }

    console.log(`✅ Admin email found: ${userData.email}`);

    // Gerar PDF da versão pública do painel usando Puppeteer
    console.log("🖨️  Launching Puppeteer to generate PDF...");
    
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    const dashboardUrl = `${process.env.BASE_URL}/admin/dashboard?public=1`;
    console.log(`📍 Navigating to: ${dashboardUrl}`);
    
    await page.goto(dashboardUrl, {
      waitUntil: "networkidle0",
      timeout: 60000, // 60 seconds timeout
    });

    // Wait a bit more for any charts/animations to load
    await page.waitForTimeout(2000);

    console.log("📄 Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });
    
    await browser.close();
    console.log("✅ PDF generated successfully");

    // Enviar via Resend
    const currentDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    console.log("📧 Sending email via Resend...");
    
    const emailResult = await resend.emails.send({
      from: process.env.EMAIL_FROM || "dashboard@empresa.com",
      to: userData.email,
      subject: `📊 Dashboard Mensal - Painel Automatizado - ${currentDate}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📊 Dashboard Mensal
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Painel Automatizado - ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0; font-size: 16px; color: #333333;">
                Olá,
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Segue em anexo o relatório mensal do painel de controle. O dashboard foi capturado automaticamente e inclui todas as métricas e visualizações atualizadas.
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                O PDF anexo contém:
              </p>
              <ul style="margin: 10px 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>Estatísticas em tempo real</li>
                <li>Visualizações de tendências</li>
                <li>Resumo de atividades recentes</li>
                <li>Gráficos e métricas principais</li>
              </ul>
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Ver Dashboard Online
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                Este é um relatório automático enviado pelo sistema Nautilus One.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
                © ${new Date().getFullYear()} Nautilus One. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      attachments: [
        {
          filename: `dashboard-${new Date().toISOString().split("T")[0]}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    console.log("✅ Email sent successfully:", emailResult);

    return NextResponse.json({ 
      success: true, 
      sent: true,
      emailId: emailResult.data?.id,
      recipient: userData.email,
      message: "Dashboard report sent successfully"
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[SEND_DASHBOARD_REPORT]", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.stack 
      }, 
      { status: 500 }
    );
  }
}
