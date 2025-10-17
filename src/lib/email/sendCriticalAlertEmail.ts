/**
 * Critical Alert Email Service
 * Sends critical alert emails to the security team when AI detects critical failures
 */

import { Resend } from "resend";

export interface CriticalAlertEmailParams {
  auditoriaId: string;
  descricao: string;
}

export interface CriticalAlertEmailResult {
  success: boolean;
  data?: { id: string };
  error?: unknown;
}

/**
 * Send critical alert email to security team
 * @param params - Alert parameters (auditoria ID and description)
 * @returns CriticalAlertEmailResult with success flag and optional data/error
 */
export async function sendCriticalAlertEmail(
  params: CriticalAlertEmailParams
): Promise<CriticalAlertEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not configured in environment variables");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables",
    };
  }

  const { auditoriaId, descricao } = params;
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "alertas@nautilus.one",
      to: ["seguranca@empresa.com"],
      subject: `⚠️ Alerta Crítico - Auditoria ${auditoriaId}`,
      html: `<h3>⚠️ Falha crítica detectada</h3><p><strong>Auditoria:</strong> ${auditoriaId}</p><pre>${descricao}</pre><p>Ver painel de alertas: <a href="https://nautilus.one/admin/alerts">Acessar</a></p>`,
    });

    if (error) {
      console.error("❌ Erro ao enviar alerta crítico por email:", error);
      return { success: false, error };
    }

    if (data) {
      console.log("✅ Email de alerta crítico enviado com sucesso:", data);
      return { success: true, data };
    }

    return { success: false, error: "No data returned from Resend API" };
  } catch (err) {
    console.error("❌ Erro ao enviar alerta crítico por email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
