/**
 * Query Similar Jobs Service
 * Fetches similar maintenance jobs using vector similarity search
 */

import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "@/services/mmi/embeddingService";
import type { SimilarJobResult } from "./types";
import { logger } from "@/lib/logger";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- embedding is a number[] but RPC expects vector type
    const { data, error } = await supabase.rpc("match_mmi_jobs", {
      query_embedding: embedding as unknown as string,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      logger.error("Error querying similar jobs", error as Error, { 
        inputLength: input.length,
        matchThreshold,
        matchCount 
      });
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
    logger.error("Error fetching similar jobs", error as Error, { 
      input: input.substring(0, 100),
      matchThreshold,
      matchCount 
    });
    
    // Return empty on error - no mock data
    return [];
  }
};
