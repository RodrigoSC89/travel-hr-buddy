/**
 * Email Service - Send SGSO Reports via Resend
 * Sends SGSO (Safety Management System) reports via email with PDF attachments
 */

import { Resend } from "resend";

export interface SendSGSOReportOptions {
  vessel: string;
  to: string | string[];
  pdfBuffer: Buffer;
  dashboardLink?: string;
}

export interface SendSGSOReportResult {
  success: boolean;
  data?: { id: string };
  error?: unknown;
}

/**
 * Send SGSO report email via Resend SDK with PDF attachment
 * @param options - Email configuration options with vessel name, recipients, and PDF buffer
 * @returns SendSGSOReportResult with success flag and optional data/error
 */
export async function sendSGSOReport(
  options: SendSGSOReportOptions
): Promise<SendSGSOReportResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not configured in environment variables");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables",
    };
  }

  const { vessel, to, pdfBuffer, dashboardLink } = options;
  const resend = new Resend(apiKey);
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      border-radius: 5px 5px 0 0;
      text-align: center;
    }
    .content {
      background-color: #f9fafb;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background-color: #eff6ff;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
      border-left: 4px solid #2563eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📄 Relatório SGSO</h1>
    <p style="margin: 5px 0 0 0;">${currentDate}</p>
  </div>
  
  <div class="content">
    <h2>Relatório de Segurança - ${vessel}</h2>
    
    <div class="info-box">
      <p style="margin: 0;">
        <strong>Embarcação:</strong> ${vessel}<br>
        <strong>Período:</strong> ${currentDate}
      </p>
    </div>

    <p>
      Segue em anexo o relatório SGSO (Sistema de Gestão de Segurança Operacional) 
      da embarcação <strong>${vessel}</strong>.
    </p>

    <p>
      Este relatório contém informações sobre:
    </p>
    <ul>
      <li>Métricas de segurança operacional</li>
      <li>Incidentes e não-conformidades</li>
      <li>Status de práticas ANP</li>
      <li>Ações corretivas e preventivas</li>
    </ul>

    ${
      dashboardLink
        ? `
    <p style="text-align: center;">
      <a href="${dashboardLink}" class="button">
        🔗 Acessar Painel SGSO
      </a>
    </p>
    `
        : ""
    }

    <div class="footer">
      <p>
        <strong>Anexo:</strong> relatorio-sgso-${vessel.replace(/\s+/g, "-").toLowerCase()}.pdf
      </p>
      <p>
        Este é um relatório automatizado enviado mensalmente.<br>
        Sistema de Gestão de Segurança Operacional - Nautilus One
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "SGSO Reports <relatorios@nautilus-one.com>",
      to: Array.isArray(to) ? to : [to],
      subject: `📄 Relatório SGSO - ${vessel}`,
      html: htmlContent,
      attachments: [
        {
          filename: `relatorio-sgso-${vessel.replace(/\s+/g, "-").toLowerCase()}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      return { success: false, error };
    }

    if (data) {
      console.log("✅ SGSO report email sent successfully:", data);
      return { success: true, data };
    }

    return { success: false, error: "No data returned from Resend API" };
  } catch (err) {
    console.error("❌ Unexpected error sending SGSO report email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
