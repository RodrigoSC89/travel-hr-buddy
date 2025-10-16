/**
 * Send Real Forecast Report API Endpoint
 * Generates and sends AI-powered maintenance forecast via email
 * 
 * This endpoint:
 * 1. Fetches jobs from the last 180 days
 * 2. Generates AI forecast using GPT-4
 * 3. Saves forecast to history
 * 4. Sends email report
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import { resendEmail } from "@/lib/email/sendForecastEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient();

  try {
    // 1. Buscar jobs dos últimos 180 dias
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("id, title, component_id, status, created_at, due_date")
      .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString());

    if (error || !jobs) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({ error: "Erro ao buscar dados dos jobs." });
    }

    console.log(`✅ Fetched ${jobs.length} jobs from last 180 days`);

    // 2. Criar prompt e enviar para GPT-4
    const input = jobs.map(j => `• ${j.component_id}: ${j.title} (${j.status})`).join("\n");

    const prompt = `Você é um analista de manutenção marítima. Com base nos dados abaixo, gere uma previsão de falhas potenciais por componente:\n\n${input}`;

    console.log("🤖 Generating AI forecast with GPT-4...");

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = response.choices?.[0]?.message?.content || "[sem resposta]";

    console.log("✅ AI forecast generated successfully");

    // 3. Gravar histórico
    const { error: historyError } = await supabase.from("forecast_history").insert({
      forecast_summary: summary,
      source: "cron-job",
      created_by: "cron@nautilus.system",
    });

    if (historyError) {
      console.error("Warning: Failed to save forecast history:", historyError);
      // Don't fail the request, just log the error
    } else {
      console.log("✅ Forecast saved to history");
    }

    // 4. Enviar e-mail
    console.log("📧 Sending email report...");

    await resendEmail({
      to: "engenharia@nautilus.system",
      subject: "📊 Previsão de Falhas (Produção)",
      text: summary,
    });

    console.log("✅ Email sent successfully");

    return res.status(200).json({ 
      ok: true, 
      count: jobs.length,
      message: "Forecast generated and sent successfully"
    });

  } catch (error) {
    console.error("❌ Error in send-real-forecast:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
}
