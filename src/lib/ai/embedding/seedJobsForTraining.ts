/**
 * Seeds job data for AI training with embeddings
 * Stores embeddings in job_embeddings table for similarity search
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

export interface EmbeddedJob {
  id: string;
  embedding: number[];
  metadata: {
    component_id: string | null;
    title: string;
    created_at: string | null;
  };
}

interface JobRow {
  id: string;
  title: string;
  component_id: string | null;
  status: string;
  ai_suggestion: string | null;
  created_at: string | null;
}

/**
 * Create a simple embedding from text (placeholder for real embedding service)
 */
async function createSimpleEmbedding(text: string): Promise<number[]> {
  // Simple hash-based embedding placeholder
  // In production, this would call OpenAI or another embedding service
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(128).fill(0).map((_, i) => Math.sin(hash + i) * 0.5);
}

export async function seedJobsForTraining(): Promise<EmbeddedJob[]> {
  // Fetch completed job embeddings that have metadata
  const { data: existingEmbeddings, error } = await supabase
    .from("job_embeddings")
    .select("job_id, embedding, metadata")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !existingEmbeddings) {
    logger.error("Erro ao buscar job embeddings", { error });
    throw new Error("Erro ao buscar job embeddings");
  }

  // If no existing embeddings, create sample ones
  if (existingEmbeddings.length === 0) {
    return [];
  }

  const embeddedJobs: EmbeddedJob[] = existingEmbeddings.map((item) => {
    const metadata = item.metadata as { component_id: string | null; title: string; created_at: string | null } | null;
    return {
      id: item.job_id,
      embedding: Array.isArray(item.embedding) ? item.embedding as number[] : [],
      metadata: {
        component_id: metadata?.component_id ?? null,
        title: metadata?.title ?? "",
        created_at: metadata?.created_at ?? null,
      },
    };
  });

  return embeddedJobs;
}
