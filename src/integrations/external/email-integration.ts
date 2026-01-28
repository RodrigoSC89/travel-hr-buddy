/**
 * Email Integration Service
 * Handles transactional emails via Resend/SendGrid
 */
import { supabase } from "@/integrations/supabase/client";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  contentType?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplateData {
  [key: string]: string | number | boolean;
}

// Pre-built email templates
const EMAIL_TEMPLATES = {
  certificateExpiring: (data: {
    crewName: string;
    certificateType: string;
    certificateNumber: string;
    expiryDate: string;
    daysRemaining: number;
    actionUrl: string;
  }) => ({
    subject: `⚠️ Certificado Expirando - ${data.certificateType}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0066cc, #004499); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .btn { display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Certificado</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.crewName}</strong>,</p>
              
              <div class="alert-box">
                <strong>Atenção:</strong> Seu certificado está próximo do vencimento!
              </div>
              
              <div class="info-row"><span>Certificado:</span><strong>${data.certificateType}</strong></div>
              <div class="info-row"><span>Número:</span><strong>${data.certificateNumber}</strong></div>
              <div class="info-row"><span>Data de Vencimento:</span><strong>${data.expiryDate}</strong></div>
              <div class="info-row"><span>Dias Restantes:</span><strong style="color: ${data.daysRemaining <= 7 ? 'red' : 'orange'}">${data.daysRemaining} dias</strong></div>
              
              <p>Por favor, providencie a renovação deste certificado o quanto antes para evitar problemas operacionais.</p>
              
              <a href="${data.actionUrl}" class="btn">Ver Detalhes do Certificado</a>
              
              <div class="footer">
                <p>Nauti One - Sistema de Gestão Marítima</p>
                <p><a href="${data.actionUrl.split('/certificates')[0]}/notifications-center">Gerenciar Notificações</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  maintenanceReminder: (data: {
    recipientName: string;
    equipmentName: string;
    vesselName: string;
    scheduledDate: string;
    taskDescription: string;
    actionUrl: string;
  }) => ({
    subject: `🔧 Manutenção Programada - ${data.equipmentName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745, #1e7e34); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .btn { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Lembrete de Manutenção</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${data.recipientName}</strong>,</p>
              <p>Este é um lembrete sobre uma manutenção programada:</p>
              
              <div class="info-box">
                <p><strong>Equipamento:</strong> ${data.equipmentName}</p>
                <p><strong>Embarcação:</strong> ${data.vesselName}</p>
                <p><strong>Data:</strong> ${data.scheduledDate}</p>
                <p><strong>Descrição:</strong> ${data.taskDescription}</p>
              </div>
              
              <a href="${data.actionUrl}" class="btn">Ver Detalhes</a>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  weatherAlert: (data: {
    recipientName: string;
    alertType: string;
    location: string;
    severity: "low" | "medium" | "high" | "extreme";
    details: string;
    recommendations: string[];
    validUntil: string;
  }) => ({
    subject: `🌊 Alerta Meteorológico: ${data.alertType} - ${data.location}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${data.severity === 'extreme' ? '#dc3545' : data.severity === 'high' ? '#fd7e14' : '#ffc107'}; color: ${data.severity === 'low' ? '#333' : 'white'}; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .recommendation { background: white; padding: 10px 15px; margin: 5px 0; border-left: 3px solid #0066cc; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌊 ${data.alertType}</h1>
              <p>Região: ${data.location}</p>
            </div>
            <div class="content">
              <p>Olá <strong>${data.recipientName}</strong>,</p>
              <p>${data.details}</p>
              
              <h3>Recomendações:</h3>
              ${data.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
              
              <p><small>Válido até: ${data.validUntil}</small></p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

export class EmailIntegration {
  /**
   * Send a custom email
   */
  static async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue", {
        body: {
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
          from: options.from || "noreply@nautione.com",
          replyTo: options.replyTo,
          attachments: options.attachments,
        },
      });

      if (error) throw new Error(error.message);

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to send email",
      };
    }
  }

  /**
   * Send certificate expiry notification
   */
  static async sendCertificateExpiryEmail(
    toEmail: string,
    data: Parameters<typeof EMAIL_TEMPLATES.certificateExpiring>[0]
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.certificateExpiring(data);
    return this.send({
      to: toEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send maintenance reminder
   */
  static async sendMaintenanceReminderEmail(
    toEmail: string,
    data: Parameters<typeof EMAIL_TEMPLATES.maintenanceReminder>[0]
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.maintenanceReminder(data);
    return this.send({
      to: toEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send weather alert
   */
  static async sendWeatherAlertEmail(
    toEmail: string,
    data: Parameters<typeof EMAIL_TEMPLATES.weatherAlert>[0]
  ): Promise<EmailResult> {
    const template = EMAIL_TEMPLATES.weatherAlert(data);
    return this.send({
      to: toEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  /**
   * Send bulk emails
   */
  static async sendBulk(
    recipients: string[],
    options: Omit<EmailOptions, "to">
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = await Promise.allSettled(
      recipients.map((to) => this.send({ ...options, to }))
    );

    const sent = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - sent;
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => r.reason?.message || "Unknown error");

    return { sent, failed, errors };
  }
}

// Convenience exports
export const sendEmail = EmailIntegration.send.bind(EmailIntegration);
export const sendCertificateExpiryEmail = EmailIntegration.sendCertificateExpiryEmail.bind(EmailIntegration);
export const sendMaintenanceReminderEmail = EmailIntegration.sendMaintenanceReminderEmail.bind(EmailIntegration);
export const sendWeatherAlertEmail = EmailIntegration.sendWeatherAlertEmail.bind(EmailIntegration);
