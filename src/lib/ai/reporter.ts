import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * AI Insight Reporter — coleta métricas em segundo plano e envia para Supabase
 */
export const reportInsight = async (category, payload) => {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      category,
      payload,
    };

    // Armazena localmente e envia depois
    localStorage.setItem(`insight-${entry.timestamp}`, JSON.stringify(entry));

    // Envia em background sem bloquear a UI
    queueMicrotask(async () => {
      await supabase.from("ai_insights").insert(entry);
      console.log(`🧠 Insight enviado: ${category}`);
    });
  } catch (err) {
    console.warn("⚠️ Falha ao enviar insight:", err);
  }
};
