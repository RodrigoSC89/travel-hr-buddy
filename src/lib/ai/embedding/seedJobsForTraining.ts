// File: /lib/ai/embedding/seedJobsForTraining.ts

import { createClient } from "@/lib/supabase/client";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

export async function seedJobsForTraining() {
  const supabase = createClient();

  // Coleta os 10 últimos jobs finalizados com sugestão IA
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, component_id, status, ai_suggestion, created_at")
    .eq("status", "completed")
    .not("ai_suggestion", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !jobs) throw new Error("Erro ao buscar jobs");

  const embeddedJobs = await Promise.all(
    jobs.map(async (job) => {
      const content = `Job: ${job.title}\nComponente: ${job.component_id}\nSugestão IA: ${job.ai_suggestion}`;
      const embedding = await createEmbedding(content);
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
      embedding: item.embedding,
      metadata: item.metadata,
    });
  }

  return embeddedJobs;
}
