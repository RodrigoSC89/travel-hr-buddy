/**
 * Order Email Service
 * Sends service orders (OS) by email using Resend API
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendOrderEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface SendOrderEmailResult {
  success: boolean;
  data?: { id: string };
  error?: unknown;
}

/**
 * Send order email using Resend API
 * @param params - Email parameters (to, subject, html)
 * @returns SendOrderEmailResult with success flag and optional data/error
 */
export async function sendOrderEmail({
  to,
  subject,
  html,
}: SendOrderEmailParams): Promise<SendOrderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not configured in environment variables");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "os@nautilus.systems",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Erro ao enviar OS por email:", error);
      return { success: false, error };
    }

    if (data) {
      console.log("✅ Email de OS enviado com sucesso:", data);
      return { success: true, data };
    }

    return { success: false, error: "No data returned from Resend API" };
  } catch (err) {
    console.error("❌ Erro ao enviar OS por email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
