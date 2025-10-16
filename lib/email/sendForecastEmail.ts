/**
 * Email Service - Send Forecast Email via Resend
 * Sends forecast reports via email using Resend API
 */

export interface ResendEmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email via Resend API
 * @param options - Email configuration options
 * @throws Error if RESEND_API_KEY is not configured or request fails
 */
export async function resendEmail(options: ResendEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured in environment variables");
  }

  const { to, subject, text, html } = options;

  // Convert to array if single email
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "noreply@nautilus.system",
        to: recipients,
        subject: subject,
        text: text,
        html: html || `<pre>${text}</pre>`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Email sent successfully:", data);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
