/**
 * Email Template Service
 * Professional HTML email templates for alerts, reports, notifications
 */

export type EmailTemplate = 
  | "alert"
  | "daily-summary"
  | "weekly-report"
  | "audit-notification"
  | "certification-expiring"
  | "training-completed"
  | "welcome"
  | "password-reset";

export interface EmailData {
  // Common
  recipientName?: string;
  timestamp?: Date;
  actionUrl?: string;
  actionLabel?: string;

  // Alert
  alertTitle?: string;
  alertMessage?: string;
  alertSeverity?: "critical" | "warning" | "info" | "success";
  alertSource?: string;

  // Summary/Report
  vesselName?: string;
  complianceScore?: number;
  crewWellness?: string;
  equipmentStatus?: string;
  fuelStatus?: string;
  alerts?: Array<{ title: string; severity: string }>;

  // Certification
  certificationName?: string;
  expiryDate?: Date;
  daysRemaining?: number;
  crewMemberName?: string;

  // Training
  courseName?: string;
  completionDate?: Date;
  score?: number;
  certificateUrl?: string;
}

const colors = {
  primary: "#0ea5e9",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#3B82F6",
  muted: "#64748b",
  background: "#f8fafc",
  border: "#e2e8f0",
  text: "#334155",
  textLight: "#64748b"
};

function baseTemplate(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nautilus One</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>
  
  <!-- Main container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid ${colors.border};">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: ${colors.primary};">
                🧭 Nautilus One
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${colors.textLight};">
                Maritime Management Platform
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          ${content}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${colors.background}; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: ${colors.textLight};">
                © ${new Date().getFullYear()} Nautilus One Maritime Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: ${colors.muted};">
                Este email foi enviado automaticamente. Por favor não responda diretamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function alertTemplate(data: EmailData): string {
  const severityColors: Record<string, string> = {
    critical: colors.danger,
    warning: colors.warning,
    info: colors.info,
    success: colors.success
  };
  const color = severityColors[data.alertSeverity || "info"];
  const emoji = { critical: "🚨", warning: "⚠️", info: "ℹ️", success: "✅" }[data.alertSeverity || "info"];

  const content = `
    <tr>
      <td style="padding: 0;">
        <div style="background: ${color}; color: white; padding: 24px 40px;">
          <h2 style="margin: 0; font-size: 20px;">${emoji} ${data.alertTitle || "Alert"}</h2>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: ${colors.text}; line-height: 1.6;">
          ${data.alertMessage || ""}
        </p>
        ${data.alertSource ? `<p style="margin: 0 0 20px; font-size: 14px; color: ${colors.textLight};">
          <strong>Source:</strong> ${data.alertSource}
        </p>` : ""}
        ${data.actionUrl ? `
        <a href="${data.actionUrl}" style="display: inline-block; background: ${color}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          ${data.actionLabel || "View Details"} →
        </a>` : ""}
      </td>
    </tr>`;

  return baseTemplate(content, `${emoji} ${data.alertTitle}: ${data.alertMessage?.slice(0, 100)}`);
}

function dailySummaryTemplate(data: EmailData): string {
  const alertsHtml = data.alerts?.length
    ? data.alerts.map(a => `<li style="margin: 4px 0; color: ${a.severity === "critical" ? colors.danger : colors.warning};">• ${a.title}</li>`).join("")
    : `<li style="color: ${colors.success};">✅ No critical issues</li>`;

  const content = `
    <tr>
      <td style="padding: 0;">
        <div style="background: linear-gradient(135deg, ${colors.primary}, #0284c7); color: white; padding: 24px 40px;">
          <h2 style="margin: 0; font-size: 20px;">📊 Daily Summary</h2>
          <p style="margin: 8px 0 0; opacity: 0.9;">${data.vesselName || "Fleet Overview"}</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding: 12px; background: ${colors.background}; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textLight}; text-transform: uppercase;">Compliance Score</p>
              <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700; color: ${(data.complianceScore || 0) >= 90 ? colors.success : colors.warning};">
                ${data.complianceScore || 0}%
              </p>
            </td>
            <td width="50%" style="padding: 12px; background: ${colors.background}; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textLight}; text-transform: uppercase;">Crew Wellness</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: ${colors.text};">
                ${data.crewWellness || "Good"}
              </p>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 12px; background: ${colors.background}; border-radius: 8px; margin-top: 8px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textLight}; text-transform: uppercase;">Equipment</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: ${colors.text};">
                ${data.equipmentStatus || "Operational"}
              </p>
            </td>
            <td width="50%" style="padding: 12px; background: ${colors.background}; border-radius: 8px;">
              <p style="margin: 0; font-size: 12px; color: ${colors.textLight}; text-transform: uppercase;">Fuel Status</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: ${colors.text};">
                ${data.fuelStatus || "Normal"}
              </p>
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 24px;">
          <h3 style="margin: 0 0 12px; font-size: 14px; color: ${colors.text};">Issues & Alerts</h3>
          <ul style="margin: 0; padding-left: 0; list-style: none;">
            ${alertsHtml}
          </ul>
        </div>
        
        ${data.actionUrl ? `
        <div style="margin-top: 24px;">
          <a href="${data.actionUrl}" style="display: inline-block; background: ${colors.primary}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View Full Report →
          </a>
        </div>` : ""}
      </td>
    </tr>`;

  return baseTemplate(content, `Daily Summary: ${data.vesselName} - Compliance ${data.complianceScore}%`);
}

function certificationExpiringTemplate(data: EmailData): string {
  const urgencyColor = (data.daysRemaining || 30) <= 7 ? colors.danger : 
                       (data.daysRemaining || 30) <= 30 ? colors.warning : colors.info;

  const content = `
    <tr>
      <td style="padding: 0;">
        <div style="background: ${urgencyColor}; color: white; padding: 24px 40px;">
          <h2 style="margin: 0; font-size: 20px;">⏰ Certification Expiring</h2>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: ${colors.text};">
          The following certification is expiring soon:
        </p>
        <div style="background: ${colors.background}; padding: 20px; border-radius: 8px; border-left: 4px solid ${urgencyColor};">
          <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: ${colors.text};">
            ${data.certificationName || "Certificate"}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: ${colors.textLight};">
            <strong>Crew Member:</strong> ${data.crewMemberName || "N/A"}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: ${colors.textLight};">
            <strong>Expiry Date:</strong> ${data.expiryDate?.toLocaleDateString("pt-BR") || "N/A"}
          </p>
          <p style="margin: 0; font-size: 14px; color: ${urgencyColor}; font-weight: 600;">
            ⏳ ${data.daysRemaining} days remaining
          </p>
        </div>
        ${data.actionUrl ? `
        <div style="margin-top: 24px;">
          <a href="${data.actionUrl}" style="display: inline-block; background: ${urgencyColor}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Renew Certificate →
          </a>
        </div>` : ""}
      </td>
    </tr>`;

  return baseTemplate(content, `⏰ ${data.certificationName} expires in ${data.daysRemaining} days`);
}

function trainingCompletedTemplate(data: EmailData): string {
  const content = `
    <tr>
      <td style="padding: 0;">
        <div style="background: ${colors.success}; color: white; padding: 24px 40px;">
          <h2 style="margin: 0; font-size: 20px;">🎓 Training Completed!</h2>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px; text-align: center;">
        <div style="margin-bottom: 24px;">
          <span style="display: inline-block; width: 80px; height: 80px; background: ${colors.success}; border-radius: 50%; line-height: 80px; font-size: 40px;">
            🏆
          </span>
        </div>
        <h3 style="margin: 0 0 8px; font-size: 20px; color: ${colors.text};">
          Congratulations${data.recipientName ? `, ${data.recipientName}` : ""}!
        </h3>
        <p style="margin: 0 0 24px; font-size: 16px; color: ${colors.textLight};">
          You have successfully completed the training:
        </p>
        <div style="background: ${colors.background}; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: ${colors.text};">
            ${data.courseName || "Training Course"}
          </p>
          ${data.score !== undefined ? `
          <p style="margin: 0 0 8px; font-size: 14px; color: ${colors.textLight};">
            <strong>Score:</strong> <span style="color: ${data.score >= 80 ? colors.success : colors.warning}; font-weight: 600;">${data.score}%</span>
          </p>` : ""}
          <p style="margin: 0; font-size: 14px; color: ${colors.textLight};">
            <strong>Completed:</strong> ${data.completionDate?.toLocaleDateString("pt-BR") || new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
        ${data.certificateUrl ? `
        <div style="margin-top: 24px;">
          <a href="${data.certificateUrl}" style="display: inline-block; background: ${colors.primary}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Download Certificate →
          </a>
        </div>` : ""}
      </td>
    </tr>`;

  return baseTemplate(content, `🎓 Training "${data.courseName}" completed successfully!`);
}

export function generateEmailHtml(template: EmailTemplate, data: EmailData): string {
  switch (template) {
    case "alert":
      return alertTemplate(data);
    case "daily-summary":
      return dailySummaryTemplate(data);
    case "certification-expiring":
      return certificationExpiringTemplate(data);
    case "training-completed":
      return trainingCompletedTemplate(data);
    default:
      return alertTemplate(data);
  }
}
