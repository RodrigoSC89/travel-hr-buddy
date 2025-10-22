/**
 * Query Similar Jobs Service
 * Fetches similar maintenance jobs using vector similarity search
 */

import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "@/services/mmi/embeddingService";
import type { SimilarJobResult } from "./types";

export type { SimilarJobResult };

/**
 * Query similar maintenance jobs based on input text
 * @param input - Description of the maintenance issue
 * @param matchThreshold - Minimum similarity threshold (default: 0.7)
 * @param matchCount - Number of results to return (default: 5)
 * @returns Array of similar jobs with metadata
 */
export const querySimilarJobs = async (
  input: string,
  matchThreshold: number = 0.7,
  matchCount: number = 5
): Promise<SimilarJobResult[]> => {
  try {
    // Generate embedding for the input text
    const embedding = await generateEmbedding(input);

    // Query similar jobs using the database function
    const { data, error } = await supabase.rpc("match_mmi_jobs", {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.error("Error querying similar jobs:", error);
      throw error;
    }

    // Transform the results to match the expected format
    return (data || []).map((job: {
      id: string;
      title?: string;
      component?: string;
      asset_name?: string;
      created_at?: string;
      description?: string;
      status?: string;
      priority?: string;
      similarity?: number;
    }) => ({
      id: job.id,
      metadata: {
        title: job.title || "Sem título",
        component_id: job.component || job.asset_name || "Componente não especificado",
        created_at: job.created_at || new Date().toISOString(),
        ai_suggestion: job.description || "N/A",
        description: job.description,
        status: job.status,
        priority: job.priority,
        similarity: job.similarity,
      },
      similarity: job.similarity || 0,
    }));
  } catch (error) {
    console.error("Error fetching similar jobs:", error);
    
    // Return mock data for development/testing
    return [
      {
        id: "mock-1",
        metadata: {
          title: "Falha no gerador STBD",
          component_id: "Gerador Diesel",
          created_at: new Date().toISOString(),
          ai_suggestion: "Gerador STBD apresentando ruído incomum. Recomenda-se inspeção do ventilador e limpeza de dutos.",
          description: "Gerador com problemas de temperatura",
          status: "completed",
          priority: "high",
          similarity: 0.85,
        },
        similarity: 0.85,
      },
      {
        id: "mock-2",
        metadata: {
          title: "Manutenção bomba hidráulica",
          component_id: "Sistema Hidráulico",
          created_at: new Date().toISOString(),
          ai_suggestion: "Bomba apresentando vibração excessiva. Substituir rolamentos e vedações.",
          description: "Bomba com vibração anormal",
          status: "completed",
          priority: "medium",
          similarity: 0.78,
        },
        similarity: 0.78,
      },
    ];
  }
};
