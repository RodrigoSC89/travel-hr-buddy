/**
 * Send DP Incident Action Plan via Email
 * Sends the AI-generated action plan to responsible parties
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { resendEmail } from "@/lib/email/sendForecastEmail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, email } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Fetch incident from database
    const { data: incident, error } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !incident) {
      console.error("Error fetching incident:", error);
      return res.status(404).json({ error: "Incidente não encontrado" });
    }

    // Check if action plan exists
    if (!incident.plan_of_action) {
      return res.status(400).json({ error: "Plano de ação ainda não gerado." });
    }

    // Format the email content
    const subject = `📄 Plano de Ação para Incidente: ${incident.title} (Navio: ${incident.vessel || "N/A"})`;

    // Build HTML email with action plan details
    const planData = incident.plan_of_action;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
          Plano de Ação Gerado (IA)
        </h1>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Incidente:</strong> ${incident.title}</p>
          <p><strong>Navio:</strong> ${incident.vessel || "N/A"}</p>
          <p><strong>Data:</strong> ${incident.incident_date || incident.date || "N/A"}</p>
          <p><strong>Local:</strong> ${incident.location || "N/A"}</p>
          <p><strong>Classe DP:</strong> ${incident.class_dp || "N/A"}</p>
        </div>

        <hr style="border: 1px solid #e5e7eb; margin: 25px 0;" />

        <div style="margin: 20px 0;">
          <h2 style="color: #1e40af;">🧠 Diagnóstico Técnico</h2>
          <p style="line-height: 1.6;">${planData.diagnostico || "N/A"}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #1e40af;">🛠️ Causa Raiz Provável</h2>
          <p style="line-height: 1.6;">${planData.causa_raiz || "N/A"}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #1e40af;">✅ Ações Corretivas</h2>
          <ul style="line-height: 1.8;">
            ${planData.acoes_corretivas?.map((acao: string) => `<li>${acao}</li>`).join("") || "<li>Nenhuma ação especificada</li>"}
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #1e40af;">🔄 Ações Preventivas</h2>
          <ul style="line-height: 1.8;">
            ${planData.acoes_preventivas?.map((acao: string) => `<li>${acao}</li>`).join("") || "<li>Nenhuma ação especificada</li>"}
          </ul>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📌 Responsável:</strong> ${planData.responsavel || "A definir"}</p>
          <p><strong>⏱️ Prazo:</strong> ${planData.prazo || "A definir"}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #1e40af;">🔗 Normas Referenciadas</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${planData.normas?.map((norma: string) => `<span style="background-color: #dbeafe; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${norma}</span>`).join("") || "<span>Nenhuma norma especificada</span>"}
          </div>
        </div>

        <hr style="border: 1px solid #e5e7eb; margin: 25px 0;" />

        <p style="color: #6b7280; font-size: 14px;">
          Por favor, revise este plano e atualize o status na plataforma Nautilus One.
        </p>

        <div style="margin-top: 30px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>ℹ️ Nota:</strong> Este é um plano de ação gerado automaticamente por IA baseado nas normas IMCA e IMO. 
            Recomenda-se revisão técnica antes da implementação.
          </p>
        </div>
      </div>
    `;

    // Send email via Resend
    const emailResult = await resendEmail({
      to: email,
      subject: subject,
      text: `Plano de Ação para o incidente: ${incident.title}`,
      html: htmlContent,
    });

    if (!emailResult.success) {
      console.error("Error sending email:", emailResult.error);
      return res.status(500).json({ 
        error: "Erro ao enviar email",
        details: emailResult.error 
      });
    }

    // Update incident with send information
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
      return res.status(500).json({ 
        error: "Email enviado mas erro ao atualizar registro",
        details: updateError.message 
      });
    }

    return res.status(200).json({ 
      ok: true,
      emailId: emailResult.data?.id,
      message: "Plano de ação enviado com sucesso"
    });

  } catch (error) {
    console.error("Error in send-plan endpoint:", error);
    return res.status(500).json({ 
      error: "Erro ao enviar plano de ação",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
