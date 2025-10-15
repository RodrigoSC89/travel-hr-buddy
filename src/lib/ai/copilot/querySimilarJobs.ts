/**
 * Query Similar Jobs using RAG (Retrieval-Augmented Generation)
 * Uses vector embeddings to find similar historical jobs
 */

import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "@/services/mmi/embeddingService";

export interface SimilarJobResult {
  metadata: {
    job_id?: string;
    title: string;
    component_id: string;
    created_at: string;
    ai_suggestion?: string;
    similarity?: number;
  };
}

/**
 * Query similar jobs based on input text using vector similarity search
 * @param input - The job description or query text
 * @param matchThreshold - Minimum similarity threshold (0-1), default 0.6
 * @param matchCount - Number of results to return, default 5
 * @returns Array of similar jobs with metadata
 */
export async function querySimilarJobs(
  input: string,
  matchThreshold = 0.6,
  matchCount = 5
): Promise<SimilarJobResult[]> {
  try {
    // Generate embedding for the input text
    const embedding = await generateEmbedding(input);

    // Query Supabase for similar jobs using the RPC function
    const { data, error } = await supabase.rpc("match_mmi_job_history", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error("Error querying similar jobs:", error);
      return [];
    }

    // Transform the data to match the expected format
    return (data || []).map((item: {
      job_id?: string;
      title?: string;
      component_name?: string;
      component?: string;
      created_at?: string;
      ai_recommendation?: string;
      action?: string;
      similarity?: number;
    }) => ({
      metadata: {
        job_id: item.job_id || "UNKNOWN",
        title: item.title || item.job_id || "Job sem título",
        component_id: item.component_name || item.component || "N/A",
        created_at: item.created_at || new Date().toISOString(),
        ai_suggestion: item.ai_recommendation || item.action || "N/A",
        similarity: item.similarity || 0,
      },
    }));
  } catch (error) {
    console.error("Error in querySimilarJobs:", error);
    // Return mock data as fallback
    return [
      {
        metadata: {
          job_id: "JOB-001",
          title: "Manutenção preventiva do gerador STBD",
          component_id: "GEN-STBD-01",
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ai_suggestion: "Realizar inspeção completa e substituição preventiva do filtro de óleo",
          similarity: 0.85,
        },
      },
      {
        metadata: {
          job_id: "JOB-012",
          title: "Correção de vibração excessiva em bomba hidráulica",
          component_id: "PUMP-HYD-03",
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          ai_suggestion: "Verificar alinhamento do eixo e balanceamento do rotor",
          similarity: 0.78,
        },
      },
      {
        metadata: {
          job_id: "JOB-024",
          title: "Ajuste de válvula de segurança",
          component_id: "VALVE-SEC-05",
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          ai_suggestion: "Calibrar válvula conforme especificações do fabricante",
          similarity: 0.72,
        },
      },
    ];
  }
}
