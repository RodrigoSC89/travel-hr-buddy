/**
 * Example Component: Similar Jobs Display
 * 
 * Demonstrates how to use the MMI Jobs Similarity Search service
 * in a React component.
 */

import { useState } from "react";
import {
  useSemanticSearch,
  useSimilarJobsById,
  type SimilarJob,
} from "@/services/mmi/similaritySearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * Example 1: Find similar jobs to an existing job
 */
export function SimilarJobsByIdExample({ jobId }: { jobId: string }) {
  const { loading, results, error } = useSimilarJobsById(jobId);

  if (loading) return <div>Loading similar jobs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Similar Jobs</h3>
      {results.map((job) => (
        <SimilarJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

/**
 * Example 2: Semantic search with text query
 */
export function SemanticSearchExample() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  
  const { loading, results, meta } = useSemanticSearch(searchQuery, {
    match_threshold: 0.7,
    match_count: 10,
  });

  const handleSearch = () => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for jobs (e.g., hydraulic system maintenance)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {loading && <div>Searching...</div>}
      
      {meta && (
        <div className="text-sm text-gray-600">
          Found {meta.results_count} results for &quot;{meta.query}&quot;
        </div>
      )}

      <div className="space-y-4">
        {results.map((job) => (
          <SimilarJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable component to display a similar job
 */
function SimilarJobCard({ job }: { job: SimilarJob }) {
  const similarityPercent = Math.round(job.similarity * 100);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{job.title}</CardTitle>
          <Badge variant={similarityPercent >= 80 ? "default" : "secondary"}>
            {similarityPercent}% match
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{job.description}</p>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline">{job.status}</Badge>
          {job.metadata?.category && (
            <Badge variant="outline">{job.metadata.category as string}</Badge>
          )}
          {job.metadata?.severity && (
            <Badge variant="outline">{job.metadata.severity as string}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Using the service functions directly
 */
export function DirectServiceExample() {
  const [results, setResults] = useState<SimilarJob[]>([]);
  const [loading, setLoading] = useState(false);

  const checkForDuplicates = async (description: string) => {
    setLoading(true);
    try {
      const { detectDuplicateJobs } = await import("@/services/mmi/similaritySearch");
      const duplicates = await detectDuplicateJobs(description, 0.9);
      setResults(duplicates);
    } catch (error) {
      console.error("Error checking duplicates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (description: string) => {
    setLoading(true);
    try {
      const { getJobSuggestions } = await import("@/services/mmi/similaritySearch");
      const suggestions = await getJobSuggestions(description, 5);
      setResults(suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          onClick={() => checkForDuplicates("engine overheating issue")}
          disabled={loading}
        >
          Check for Duplicates
        </Button>
        <Button 
          onClick={() => getSuggestions("hydraulic system leak")}
          disabled={loading}
        >
          Get Suggestions
        </Button>
      </div>

      {loading && <div>Loading...</div>}

      <div className="space-y-4">
        {results.map((job) => (
          <SimilarJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
