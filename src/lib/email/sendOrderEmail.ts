/**
 * Email Service for MMI Orders
 * Sends work order notifications using Resend API
 */

interface SendOrderEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send work order notification email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML email content
 */
export async function sendOrderEmail({
  to,
  subject,
  html,
}: SendOrderEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate environment variable
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    
    if (!apiKey) {
      console.error("VITE_RESEND_API_KEY is not configured");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    // Call Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "os@nautilus.systems",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return {
        success: false,
        error: errorData.message || "Failed to send email",
      };
    }

    const data = await response.json();
    console.log("Email sent successfully:", data);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate HTML email content for a work order
 */
export function generateOrderEmailHTML(order: {
  order_number?: string;
  vessel_name: string;
  system_name: string;
  description: string;
  priority: string;
}): string {
  const priorityColors: Record<string, string> = {
    crítica: "#DC2626",
    alta: "#F97316",
    normal: "#EAB308",
    baixa: "#22C55E",
  };

  const priorityColor = priorityColors[order.priority] || "#6B7280";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Ordem de Serviço</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    <h1 style="color: #1e40af; margin: 0 0 10px 0;">Nova Ordem de Serviço</h1>
    <p style="color: #6b7280; margin: 0;">Sistema MMI - Nautilus One</p>
  </div>
  
  <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
    ${order.order_number ? `<p style="margin: 0 0 15px 0;"><strong>Número OS:</strong> ${order.order_number}</p>` : ""}
    <p style="margin: 0 0 15px 0;"><strong>Embarcação:</strong> ${order.vessel_name}</p>
    <p style="margin: 0 0 15px 0;"><strong>Sistema:</strong> ${order.system_name}</p>
    <p style="margin: 0 0 15px 0;">
      <strong>Prioridade:</strong> 
      <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; background-color: ${priorityColor}; color: white; font-weight: bold;">
        ${order.priority.toUpperCase()}
      </span>
    </p>
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
      <strong>Descrição:</strong>
      <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${order.description}</p>
    </div>
  </div>
  
  <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      Esta é uma notificação automática do sistema Nautilus One.
    </p>
  </div>
</body>
</html>
  `.trim();
}
