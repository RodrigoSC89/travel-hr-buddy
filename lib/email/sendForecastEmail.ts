/**
 * Email Service - Send Forecast Email via Resend
 * Sends forecast reports via email using Resend API
 */

import { Resend } from "resend";

export interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export interface ResendEmailResult {
  success: boolean;
  data?: unknown;
  error?: unknown;
}

/**
 * Send email via Resend API
 * @param options - Email configuration options
 * @returns Result object with success flag and data/error details
 */
export async function resendEmail(options: ResendEmailOptions): Promise<ResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    const error = new Error("RESEND_API_KEY is not configured in environment variables");
    console.error("❌ Erro ao enviar email:", error);
    return { success: false, error };
  }

  const resend = new Resend(apiKey);
  const { to, subject, text, html } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Nautilus One <no-reply@nautilus.system>",
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || `<pre>${text}</pre>`,
    });

    if (error) {
      console.error("❌ Erro ao enviar email:", error);
      return { success: false, error };
    }

    console.log("✅ Email sent successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Erro inesperado ao enviar email:", err);
    return { success: false, error: err };
  }
}
