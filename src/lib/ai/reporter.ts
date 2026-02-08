import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

/**
 * AI Insight Reporter — coleta métricas em segundo plano e envia para Supabase
 */
export const reportInsight = async (category: string, payload: unknown): Promise<void> => {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      category,
      payload,
    };

    // Armazena localmente e envia depois
    localStorage.setItem(`insight-${entry.timestamp}`, JSON.stringify(entry));

    // Envia em background sem bloquear a UI usando ai_logs table
    queueMicrotask(async () => {
      await supabase.from("ai_logs").insert({
        service: "insight_reporter",
        prompt_hash: category,
        prompt_length: JSON.stringify(payload).length,
        status: "success",
      });
      logger.info(`Insight enviado: ${category}`);
    });
  } catch (err) {
    logger.warn("Falha ao enviar insight", { error: err, category });
  }
};
