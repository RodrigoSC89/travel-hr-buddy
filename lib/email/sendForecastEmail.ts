// File: /lib/email/sendForecastEmail.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Nautilus One <no-reply@nautilus.system>",
      to,
      subject,
      text,
    });

    if (error) {
      console.error("Erro ao enviar email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Erro inesperado ao enviar email:", err);
    return { success: false, error: err };
  }
}
