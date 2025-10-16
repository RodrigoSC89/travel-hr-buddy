/**
 * Email Service - Send Forecast Email via Resend
 * Sends forecast reports via email using Resend SDK
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
  data?: { id: string };
  error?: unknown;
}

/**
 * Send email via Resend SDK
 * @param options - Email configuration options
 * @returns ResendEmailResult with success flag and optional data/error
 */
export async function resendEmail(options: ResendEmailOptions): Promise<ResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is not configured in environment variables");
    return { 
      success: false, 
      error: "RESEND_API_KEY is not configured in environment variables" 
    };
  }

  const { to, subject, text, html } = options;
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@nautilus.system",
      to,
      subject,
      text,
      html: html || `<pre>${text}</pre>`,
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      return { success: false, error };
    }

    if (data) {
      console.log("✅ Email sent successfully:", data);
      return { success: true, data };
    }

    return { success: false, error: "No data returned from Resend API" };
  } catch (err) {
    console.error("❌ Unexpected error sending email:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error occurred" 
    };
  }
}
