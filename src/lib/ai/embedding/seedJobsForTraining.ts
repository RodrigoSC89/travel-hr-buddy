/**
 * Seed Job Embeddings for AI Training
 * 
 * This module provides functionality to generate and store embeddings
 * for completed jobs with AI suggestions, to be used for training
 * and improving AI recommendations.
 */

import { createClient } from "@/lib/supabase/client";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

/**
 * Interface for job data returned from Supabase
 */
interface Job {
  id: string;
  title: string;
  component_id: string;
  status: string;
  ai_suggestion: string;
  created_at: string;
}

/**
 * Interface for embedded job data
 */
interface EmbeddedJob {
  id: string;
  embedding: number[];
  metadata: {
    component_id: string;
    title: string;
    created_at: string;
  };
}

/**
 * Seeds the job_embeddings table with embeddings from completed jobs
 * 
 * This function:
 * 1. Fetches the 10 most recent completed jobs with AI suggestions
 * 2. Generates embeddings for each job using OpenAI
 * 3. Stores the embeddings in the job_embeddings table
 * 
 * Note: The job_embeddings table must be created in Supabase first.
 * Run the migration SQL:
 * 
 * CREATE TABLE job_embeddings (
 *   job_id uuid PRIMARY KEY,
 *   embedding vector(1536),
 *   metadata jsonb
 * );
 * 
 * @returns Promise that resolves to an array of embedded jobs
 * @throws Error if unable to fetch jobs or store embeddings
 */
export async function seedJobsForTraining(): Promise<EmbeddedJob[]> {
  const supabase = createClient();

  // Fetch the 10 most recent completed jobs with AI suggestions
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, component_id, status, ai_suggestion, created_at")
    .eq("status", "completed")
    .not("ai_suggestion", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !jobs) {
    throw new Error(`Error fetching jobs: ${error?.message || "No jobs found"}`);
  }

  // Generate embeddings for each job
  const embeddedJobs = await Promise.all(
    jobs.map(async (job: Job) => {
      // Create a text representation of the job for embedding
      const content = `Job: ${job.title}\nComponent: ${job.component_id}\nAI Suggestion: ${job.ai_suggestion}`;
      
      // Generate the embedding
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

  // Store embeddings in the job_embeddings table
  for (const item of embeddedJobs) {
    const { error: upsertError } = await supabase
      .from("job_embeddings")
      .upsert({
        job_id: item.id,
        embedding: item.embedding,
        metadata: item.metadata,
      });

    if (upsertError) {
      console.error(`Error upserting embedding for job ${item.id}:`, upsertError);
      throw new Error(`Failed to store embedding: ${upsertError.message}`);
    }
  }

  return embeddedJobs;
}
