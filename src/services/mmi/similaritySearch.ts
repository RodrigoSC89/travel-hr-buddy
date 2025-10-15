/**
 * MMI Jobs Similarity Search Service
 * 
 * Provides type-safe functions and React hooks for finding similar jobs
 * using the mmi-jobs-similar Edge Function with dual-mode operation.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// Type Definitions
// ============================================================================

export interface SimilarJob {
  id: string;
  title: string;
  description?: string;
  status: string;
  similarity: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface JobComparisonResponse {
  success: boolean;
  mode: "job_comparison";
  job_id: string;
  job_title: string;
  similar_jobs: SimilarJob[];
  count: number;
  match_threshold: number;
}

export interface SemanticSearchResponse {
  success: boolean;
  mode: "semantic_search";
  query: string;
  similar_jobs: SimilarJob[];
  count: number;
  match_threshold: number;
}

export interface SemanticSearchOptions {
  query: string;
  match_threshold?: number;
  match_count?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Find similar jobs by job ID (GET mode)
 * 
 * @param jobId - The ID of the job to find similar jobs for
 * @returns Promise with job comparison results
 */
export async function findSimilarJobsById(jobId: string): Promise<JobComparisonResponse> {
  // Manually construct URL with query params since Supabase client doesn't support it well for GET
  const url = `${supabase.supabaseUrl}/functions/v1/mmi-jobs-similar?jobId=${jobId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
      apikey: supabase.supabaseKey,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to find similar jobs");
  }

  return await response.json();
}

/**
 * Perform semantic search with arbitrary text (POST mode)
 * 
 * @param options - Search options including query text and thresholds
 * @returns Promise with semantic search results
 */
export async function semanticSearchJobs(
  options: SemanticSearchOptions
): Promise<SemanticSearchResponse> {
  const { data, error } = await supabase.functions.invoke("mmi-jobs-similar", {
    method: "POST",
    body: {
      query: options.query,
      match_threshold: options.match_threshold || 0.7,
      match_count: options.match_count || 10,
    },
  });

  if (error) {
    throw new Error(`Failed to perform semantic search: ${error.message}`);
  }

  return data as SemanticSearchResponse;
}

// ============================================================================
// React Hooks
// ============================================================================

/**
 * React hook to find similar jobs by job ID
 * 
 * @param jobId - The job ID to find similar jobs for
 * @returns Object with similar jobs, loading state, and error
 */
export function useSimilarJobsById(jobId: string | null) {
  const [data, setData] = useState<JobComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    findSimilarJobsById(jobId)
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jobId]);

  return { data, loading, error, similarJobs: data?.similar_jobs || [] };
}

/**
 * React hook for semantic search
 * 
 * @param query - Search query text
 * @param options - Optional search options
 * @returns Object with search results, loading state, and error
 */
export function useSemanticSearch(
  query: string | null,
  options?: Omit<SemanticSearchOptions, "query">
) {
  const [data, setData] = useState<SemanticSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    semanticSearchJobs({ query, ...options })
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, options?.match_threshold, options?.match_count]);

  return { data, loading, error, results: data?.similar_jobs || [] };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect potential duplicate jobs using high similarity threshold (90%)
 * 
 * @param query - Text to search for duplicates
 * @returns Promise with potential duplicate jobs
 */
export async function detectDuplicateJobs(query: string): Promise<SimilarJob[]> {
  const result = await semanticSearchJobs({
    query,
    match_threshold: 0.9,
    match_count: 5,
  });

  return result.similar_jobs;
}

/**
 * Get AI-powered job suggestions using moderate threshold (70%)
 * 
 * @param query - Text to search for suggestions
 * @returns Promise with suggested similar jobs
 */
export async function getJobSuggestions(query: string): Promise<SimilarJob[]> {
  const result = await semanticSearchJobs({
    query,
    match_threshold: 0.7,
    match_count: 10,
  });

  return result.similar_jobs;
}

/**
 * Find recurring issues by filtering similar jobs by category
 * 
 * @param query - Text describing the issue
 * @param category - Category to filter by (e.g., "engine", "hydraulics")
 * @returns Promise with similar jobs in the same category
 */
export async function findRecurringIssues(
  query: string,
  category?: string
): Promise<SimilarJob[]> {
  const result = await semanticSearchJobs({
    query,
    match_threshold: 0.75,
    match_count: 20,
  });

  // Filter by category if provided
  if (category) {
    return result.similar_jobs.filter(
      (job) => job.metadata?.category === category
    );
  }

  return result.similar_jobs;
}
