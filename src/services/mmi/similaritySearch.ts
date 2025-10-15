/**
 * MMI Jobs Similarity Search Service
 * 
 * Provides TypeScript service layer for interacting with the 
 * mmi-jobs-similar Edge Function.
 * 
 * Supports both:
 * 1. Finding similar jobs to an existing job (by jobId)
 * 2. Semantic search with any text query
 */

import { supabase } from "@/integrations/supabase/client";

export interface SimilarJob {
  id: string;
  title: string;
  description: string;
  status: string;
  similarity: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SimilarJobsResponseGET {
  success: boolean;
  job_id: string;
  similar_jobs: SimilarJob[];
  count: number;
}

export interface SimilarJobsResponsePOST {
  data: SimilarJob[];
  meta: {
    query: string;
    results_count: number;
    timestamp: string;
  };
}

export interface SemanticSearchParams {
  query: string;
  match_threshold?: number;
  match_count?: number;
}

/**
 * Find jobs similar to an existing job
 * @param jobId - UUID of the job to find similar jobs for
 * @returns Similar jobs response
 */
export const findSimilarJobsById = async (
  jobId: string
): Promise<SimilarJobsResponseGET> => {
  const { data, error } = await supabase.functions.invoke("mmi-jobs-similar", {
    method: "GET",
    // Supabase types don't include query params properly for GET requests
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - params not in type definition
    params: { jobId },
  });

  if (error) {
    throw new Error(`Failed to find similar jobs: ${error.message}`);
  }

  return data as SimilarJobsResponseGET;
};

/**
 * Perform semantic search for jobs using a text query
 * @param params - Search parameters (query, threshold, count)
 * @returns Search results with metadata
 */
export const semanticSearchJobs = async (
  params: SemanticSearchParams
): Promise<SimilarJobsResponsePOST> => {
  const { data, error } = await supabase.functions.invoke("mmi-jobs-similar", {
    body: params,
  });

  if (error) {
    throw new Error(`Failed to search jobs: ${error.message}`);
  }

  return data as SimilarJobsResponsePOST;
};

/**
 * React hook for finding similar jobs by ID
 * @param jobId - UUID of the job to find similar jobs for
 * @returns Loading state, results, and error
 */
export const useSimilarJobsById = (jobId: string | null) => {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SimilarJob[]>([]);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!jobId) return;

    const fetchSimilarJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await findSimilarJobsById(jobId);
        setResults(response.similar_jobs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarJobs();
  }, [jobId]);

  return { loading, results, error };
};

/**
 * React hook for semantic search
 * @param query - Search query text
 * @param options - Optional search parameters
 * @returns Loading state, results, metadata, and error
 */
export const useSemanticSearch = (
  query: string | null,
  options?: { match_threshold?: number; match_count?: number }
) => {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SimilarJob[]>([]);
  const [meta, setMeta] = React.useState<SimilarJobsResponsePOST["meta"] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!query) return;

    const searchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await semanticSearchJobs({
          query,
          ...options,
        });
        setResults(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    searchJobs();
  }, [query, options?.match_threshold, options?.match_count]);

  return { loading, results, meta, error };
};

/**
 * Helper: Detect potential duplicate jobs
 * @param query - Job description to check
 * @param threshold - Minimum similarity to consider a duplicate (default: 0.9)
 * @returns Array of potential duplicate jobs
 */
export const detectDuplicateJobs = async (
  query: string,
  threshold: number = 0.9
): Promise<SimilarJob[]> => {
  const response = await semanticSearchJobs({
    query,
    match_threshold: threshold,
    match_count: 5,
  });

  return response.data;
};

/**
 * Helper: Get AI-powered job suggestions based on a description
 * @param description - Job or issue description
 * @param count - Number of suggestions to return
 * @returns Array of similar jobs that might help resolve the issue
 */
export const getJobSuggestions = async (
  description: string,
  count: number = 5
): Promise<SimilarJob[]> => {
  const response = await semanticSearchJobs({
    query: description,
    match_threshold: 0.7,
    match_count: count,
  });

  return response.data;
};

/**
 * Helper: Find recurring issues by category
 * @param category - Category to search (e.g., "hydraulics", "engine")
 * @param timeframeQuery - Optional time context
 * @returns Array of similar jobs in the category
 */
export const findRecurringIssues = async (
  category: string,
  timeframeQuery?: string
): Promise<SimilarJob[]> => {
  const query = timeframeQuery
    ? `${category} ${timeframeQuery}`
    : category;

  const response = await semanticSearchJobs({
    query,
    match_threshold: 0.75,
    match_count: 10,
  });

  // Filter by category in metadata if available
  return response.data.filter(
    (job) => job.metadata?.category === category || true
  );
};

// Re-export React for the hooks
import * as React from "react";
