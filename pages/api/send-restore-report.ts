import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, toEmail, html, summary }: EmailRequest = req.body;

    if (!toEmail) {
      return res.status(400).json({ error: "Missing toEmail field" });
    }

    // Email configuration from environment variables
    const EMAIL_CONFIG = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    const transporter = nodemailer.createTransport(EMAIL_CONFIG);

    // Prepare attachments if image is provided
    const attachments = [];
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      attachments.push({
        filename: `restore-chart-${new Date().toISOString().split("T")[0]}.png`,
        content: imageBuffer,
        contentType: "image/png",
      });
    }

    // Use custom HTML if provided, otherwise generate default
    const emailHtml = html || generateDefaultEmailHtml(summary);

    const mailOptions = {
      from: process.env.EMAIL_FROM || "relatorios@yourdomain.com",
      to: toEmail,
      subject: "📊 Relatório Diário - Gráfico de Restauração",
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: "Email sent successfully" 
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ 
      error: "Failed to send email",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

/**
 * Generate default email HTML if not provided
 */
function generateDefaultEmailHtml(summary?: EmailRequest['summary']): string {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .summary { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .summary-item { margin: 8px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Diário de Restauração</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Segue o relatório diário de métricas de restauração de documentos.</p>
          ${summary ? `
            <div class="summary">
              <h3>📈 Resumo</h3>
              <div class="summary-item"><strong>Total de Restaurações:</strong> ${summary.total || 0}</div>
              <div class="summary-item"><strong>Documentos Únicos:</strong> ${summary.unique_docs || 0}</div>
              <div class="summary-item"><strong>Média Diária:</strong> ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}</div>
            </div>
          ` : ''}
          <p>Para mais detalhes, acesse o dashboard completo do sistema.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático. Por favor, não responda.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}
