/**
 * API Endpoint: Send Restore Report Email
 * 
 * Sends an email with restore metrics and optional chart image attachment.
 * This endpoint is called by the daily-restore-report Edge Function.
 * 
 * @module send-restore-report
 */

import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

/**
 * Email request payload interface
 */
interface EmailRequest {
  imageBase64?: string;
  toEmail: string;
  html?: string;
  summary?: {
    total: number;
    unique_docs: number;
    avg_per_day: number;
  };
}

/**
 * Email configuration interface
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
}

/**
 * Validate email configuration
 */
function validateEmailConfig(): EmailConfig {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email configuration incomplete. Please set EMAIL_USER and EMAIL_PASS environment variables."
    );
  }

  return {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  };
}

/**
 * Main API handler
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed. Use POST." 
    });
  }

  try {
    const { imageBase64, toEmail, html, summary }: EmailRequest = req.body;

    // Validate required fields
    if (!toEmail) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required field: toEmail" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid email address format" 
      });
    }

    console.log(`📧 Preparing to send email to: ${toEmail}`);

    // Validate and get email configuration
    const emailConfig = validateEmailConfig();
    const transporter = nodemailer.createTransport(emailConfig);

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP connection failed:", verifyError);
      throw new Error(
        `SMTP connection failed. Please check your email configuration.`
      );
    }

    // Prepare attachments if image is provided
    const attachments = [];
    if (imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        attachments.push({
          filename: `restore-chart-${new Date().toISOString().split("T")[0]}.png`,
          content: imageBuffer,
          contentType: "image/png",
        });
        console.log("📎 Chart image attachment prepared");
      } catch (imageError) {
        console.warn("⚠️ Failed to process image attachment:", imageError);
        // Continue without attachment
      }
    }

    // Use custom HTML if provided, otherwise generate default
    const emailHtml = html || generateDefaultEmailHtml(summary);

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@yourdomain.com",
      to: toEmail,
      subject: "📊 Relatório Diário - Gráfico de Restauração",
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Send email
    console.log("📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Generate default email HTML if not provided
 */
function generateDefaultEmailHtml(summary?: EmailRequest["summary"]): string {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Diário de Restauração</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 22px;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .content {
            padding: 25px;
          }
          .summary {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .summary h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #2d3748;
          }
          .summary-item {
            margin: 10px 0;
            padding: 5px 0;
          }
          .summary-item strong {
            color: #4a5568;
          }
          .footer {
            text-align: center;
            padding: 25px;
            background: #f7fafc;
            color: #718096;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário de Restauração</h1>
            <p><strong>Nautilus One - Travel HR Buddy</strong></p>
            <p>${currentDate}</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Segue o relatório diário de métricas de restauração de documentos.</p>
            ${
              summary
                ? `
              <div class="summary">
                <h3>📈 Resumo</h3>
                <div class="summary-item">
                  <strong>Total de Restaurações:</strong> ${summary.total || 0}
                </div>
                <div class="summary-item">
                  <strong>Documentos Únicos:</strong> ${summary.unique_docs || 0}
                </div>
                <div class="summary-item">
                  <strong>Média Diária:</strong> ${
                    summary.avg_per_day ? summary.avg_per_day.toFixed(2) : "0.00"
                  }
                </div>
              </div>
            `
                : ""
            }
            <p>Para mais detalhes, acesse o dashboard completo do sistema.</p>
          </div>
          <div class="footer">
            <p><strong>Este é um email automático. Por favor, não responda.</strong></p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
