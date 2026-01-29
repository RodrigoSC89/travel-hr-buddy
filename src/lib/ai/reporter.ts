/**
 * AI Insight Reporter — coleta métricas em segundo plano e envia para Supabase
 * PATCH: Using centralized Supabase client instead of VITE_ env vars
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export const reportInsight = async (category: string, payload: unknown): Promise<void> => {
  try {
    // Check if user is authenticated before inserting
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Skip insight reporting for unauthenticated users
      return;
    }

    // Store locally first
    const localEntry = {
      timestamp: new Date().toISOString(),
      category,
      payload,
    };
    localStorage.setItem(`insight-${localEntry.timestamp}`, JSON.stringify(localEntry));

    // Envia em background sem bloquear a UI - with proper schema
    queueMicrotask(async () => {
      try {
        await supabase.from("ai_insights").insert({
          category,
          title: `Insight: ${category}`,
          description: typeof payload === 'string' ? payload : JSON.stringify(payload),
          user_id: user.id,
          actionable: false,
          priority: "low",
          status: "active",
          confidence: 100,
        });
        logger.info(`Insight enviado: ${category}`);
      } catch (err) {
        logger.warn("Falha ao enviar insight", { error: err });
      }
    });
  } catch (err) {
    logger.warn("Falha ao processar insight", { error: err, category });
  }
};

