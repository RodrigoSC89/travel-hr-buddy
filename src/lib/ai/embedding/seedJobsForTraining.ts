// @ts-nocheck - Tables jobs/job_embeddings not in generated schema
/**
 * File: /lib/ai/embedding/seedJobsForTraining.ts
 * Seeds job data for AI training with embeddings
 * NOTE: Requires jobs and job_embeddings tables migration
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
  // Coleta os 10 últimos jobs finalizados com sugestão IA
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, component_id, status, ai_suggestion, created_at")
    .eq("status", "completed")
    .not("ai_suggestion", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !jobs) {
    logger.error("Erro ao buscar jobs", { error });
    throw new Error("Erro ao buscar jobs");
  }

  const embeddedJobs = await Promise.all(
    (jobs as JobRow[]).map(async (job) => {
      const content = `Job: ${job.title}\nComponente: ${job.component_id || "N/A"}\nSugestão IA: ${job.ai_suggestion || ""}`;
      const embedding = await createSimpleEmbedding(content);
      return {
        id: job.id,
        embedding,
        metadata: {
          component_id: job.component_id,
          title: job.title,
          created_at: job.created_at,
        },
      };
    })
  );

  // Armazena no Supabase (tabela: job_embeddings)
  for (const item of embeddedJobs) {
    await supabase.from("job_embeddings").upsert({
      job_id: item.id,
      embedding: item.embedding as unknown as Json,
      metadata: item.metadata as Json,
    });
  }

  return embeddedJobs;
}
