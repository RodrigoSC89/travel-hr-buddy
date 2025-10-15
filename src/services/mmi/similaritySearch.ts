/**
 * Example integration of MMI Jobs Similarity Search with frontend
 * 
 * This file demonstrates how to integrate the similarity search API
 * with the existing MMI Jobs components.
 */

import { supabase } from '@/lib/supabase';

// Type definitions
export interface SimilarJob {
  id: string;
  title: string;
  description: string;
  similarity: number;
}

export interface SimilaritySearchResult {
  data: SimilarJob[];
  meta: {
    query: string;
    match_threshold: number;
    match_count: number;
    results_count: number;
    timestamp: string;
  };
}

/**
 * Search for similar jobs using the Supabase Edge Function
 */
export async function searchSimilarJobs(
  query: string,
  options?: {
    match_threshold?: number;
    match_count?: number;
  }
): Promise<SimilaritySearchResult> {
  const { data, error } = await supabase.functions.invoke('mmi-jobs-similar', {
    body: {
      query,
      match_threshold: options?.match_threshold ?? 0.7,
      match_count: options?.match_count ?? 10,
    },
  });

  if (error) {
    console.error('Error searching similar jobs:', error);
    throw new Error(`Failed to search similar jobs: ${error.message}`);
  }

  return data as SimilaritySearchResult;
}

/**
 * Get AI suggestions for a job based on historical similar jobs
 */
export async function getAISuggestionsForJob(jobDescription: string) {
  const result = await searchSimilarJobs(jobDescription, {
    match_threshold: 0.75,
    match_count: 5,
  });

  // Filter and format suggestions from similar jobs
  const suggestions = result.data
    .filter(job => job.similarity > 0.8) // Only very similar jobs
    .map(job => ({
      job_id: job.id,
      title: job.title,
      similarity: job.similarity,
      recommendation: `Based on similar job "${job.title}" (${Math.round(job.similarity * 100)}% match)`,
    }));

  return suggestions;
}

/**
 * Find duplicate or very similar jobs
 */
export async function findDuplicateJobs(jobDescription: string) {
  const result = await searchSimilarJobs(jobDescription, {
    match_threshold: 0.9, // Very high threshold for duplicates
    match_count: 5,
  });

  return result.data.filter(job => job.similarity > 0.95);
}

/**
 * Example: React hook for searching similar jobs
 */
export function useSimilarJobs(query: string | null) {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SimilarJob[]>([]);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await searchSimilarJobs(query);
        setResults(result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading, error };
}

/**
 * Example: Component integration with JobCards
 * 
 * Usage in MMIJobsPanel.tsx or JobCards.tsx:
 */
export function SimilarJobsPanel({ currentJobDescription }: { currentJobDescription: string }) {
  const { results, loading, error } = useSimilarJobs(currentJobDescription);

  if (loading) {
    return <div>Searching similar jobs...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold mb-2">🔍 Similar Historical Jobs</h3>
      <div className="space-y-2">
        {results.map((job) => (
          <div key={job.id} className="p-2 bg-white rounded shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-sm">{job.title}</p>
                <p className="text-xs text-gray-600 mt-1">{job.description.substring(0, 100)}...</p>
              </div>
              <div className="ml-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {Math.round(job.similarity * 100)}% match
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Add to JobCards.tsx to show similar jobs when creating a new job
 */
export function JobCreateFormWithSuggestions() {
  const [description, setDescription] = React.useState('');
  const { results: similarJobs } = useSimilarJobs(description);

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the maintenance job..."
        className="w-full p-2 border rounded"
      />
      
      {similarJobs.length > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-semibold text-yellow-800">
            ⚠️ Found {similarJobs.length} similar existing job(s)
          </p>
          <ul className="mt-2 space-y-1">
            {similarJobs.map((job) => (
              <li key={job.id} className="text-xs text-yellow-700">
                • {job.title} ({Math.round(job.similarity * 100)}% similar)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Batch search for multiple queries
 */
export async function batchSearchSimilarJobs(queries: string[]) {
  const results = await Promise.all(
    queries.map(query => searchSimilarJobs(query))
  );
  
  return results;
}

/**
 * Example: Get recommendations for postponing a job
 */
export async function getPostponeRecommendations(jobDescription: string) {
  const result = await searchSimilarJobs(jobDescription, {
    match_threshold: 0.7,
    match_count: 10,
  });

  // Analyze similar jobs that were successfully postponed
  const postponedJobs = result.data.filter(job => 
    job.similarity > 0.8 // High similarity
  );

  if (postponedJobs.length === 0) {
    return {
      canPostpone: false,
      reason: 'No similar historical jobs found for comparison',
    };
  }

  return {
    canPostpone: true,
    reason: `Found ${postponedJobs.length} similar job(s) in history`,
    similarJobs: postponedJobs,
  };
}

// Import React for the hook
import * as React from 'react';
