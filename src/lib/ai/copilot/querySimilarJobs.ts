/**
 * RAG Query Service - Query Similar Jobs
 * Provides semantic search for similar historical jobs using vector embeddings
 */

import { supabase } from "@/integrations/supabase/client";
import { createEmbedding } from "@/lib/ai/openai/createEmbedding";

/**
 * Query similar jobs using RAG (Retrieval-Augmented Generation)
 * 
 * This function allows Copilot to:
 * 🔍 Search for past jobs with high semantic similarity
 * 🧠 Use historical data as context for new suggestions
 * 📈 Learn technical patterns from each vessel/situation
 * 
 * @param userInput - The user's query or job description
 * @param limit - Maximum number of similar jobs to return (default: 5)
 * @returns Promise with array of similar jobs and their similarity scores
 * @throws Error if embedding creation or database query fails
 */
export async function querySimilarJobs(userInput: string, limit = 5) {
  // Create embedding from user input
  const queryEmbedding = await createEmbedding(userInput);

  // Vector query on job_embeddings table
  const { data, error } = await supabase.rpc("match_job_embeddings", {
    query_embedding: queryEmbedding,
    match_threshold: 0.78,
    match_count: limit,
  });

  if (error)
    throw new Error(`Error fetching similar examples: ${error.message}`);

  return data;
}
