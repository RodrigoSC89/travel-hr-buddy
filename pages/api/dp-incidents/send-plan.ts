import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: "ID e email são obrigatórios." });
    }

    // Fetch the incident
    const { data: incident, error: fetchError } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !incident) {
      return res.status(404).json({ error: "Incidente não encontrado." });
    }

    if (!incident.plan_of_action) {
      return res.status(400).json({ error: "Plano de ação ainda não gerado." });
    }

    // Send email using Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return res.status(500).json({ error: "Configuração de email não encontrada." });
    }

    const resend = new Resend(apiKey);

    const subject = `📄 Plano de Ação para Incidente: ${incident.title} (Navio: ${incident.vessel})`;

    const html = `
      <h1>Plano de Ação Gerado (IA)</h1>
      <p><strong>Incidente:</strong> ${incident.title}</p>
      <p><strong>Navio:</strong> ${incident.vessel}</p>
      <p><strong>Data:</strong> ${incident.incident_date}</p>
      <hr />
      <pre style="white-space: pre-wrap; background: #f3f3f3; padding: 10px; border-radius: 6px;">${incident.plan_of_action}</pre>
      <hr />
      <p>Por favor, revise este plano e atualize o status na plataforma Nautilus One.</p>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      to: email,
      from: process.env.EMAIL_FROM || "nautilus@suasistema.com",
      subject,
      html,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return res.status(500).json({ error: "Erro ao enviar email." });
    }

    // Update the incident with send information
    const { error: updateError } = await supabase
      .from("dp_incidents")
      .update({
        plan_sent_to: email,
        plan_sent_at: new Date().toISOString(),
        plan_status: "pendente",
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating incident:", updateError);
      return res.status(500).json({ error: "Erro ao atualizar incidente." });
    }

    return res.status(200).json({ ok: true, emailId: emailData?.id });
  } catch (error) {
    console.error("Error in send-plan endpoint:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
