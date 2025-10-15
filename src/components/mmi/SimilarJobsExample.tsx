/**
 * Example React components showing how to use the MMI Jobs Similarity Search API
 * 
 * These components demonstrate both GET and POST modes of operation
 */

import React, { useState } from "react";
import {
  useSimilarJobsById,
  useSemanticSearch,
  detectDuplicateJobs,
  getJobSuggestions,
  findRecurringIssues,
  type SimilarJob,
} from "@/services/mmi/similaritySearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// ============================================================================
// Example 1: Find Similar Jobs by ID (GET mode)
// ============================================================================

export function SimilarJobsByIdExample() {
  const [jobId, setJobId] = useState<string>("550e8400-e29b-41d4-a716-446655440001");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { data, loading, error, similarJobs } = useSimilarJobsById(activeJobId);

  const handleSearch = () => {
    setActiveJobId(jobId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Similar Jobs by ID</CardTitle>
        <CardDescription>
          GET mode: Find jobs similar to an existing job in the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter job ID..."
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading || !jobId}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            Error: {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Found {data.count} similar jobs to "{data.job_title}"
            </div>
            <SimilarJobsList jobs={similarJobs} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 2: Semantic Search (POST mode)
// ============================================================================

export function SemanticSearchExample() {
  const [query, setQuery] = useState<string>("hydraulic system maintenance");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const { data, loading, error, results } = useSemanticSearch(activeQuery);

  const handleSearch = () => {
    setActiveQuery(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Search</CardTitle>
        <CardDescription>
          POST mode: Search for jobs using natural language queries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading || !query}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            Error: {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Found {data.count} jobs matching "{data.query}"
            </div>
            <SimilarJobsList jobs={results} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 3: Duplicate Detection
// ============================================================================

export function DuplicateDetectionExample() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<SimilarJob[]>([]);

  const handleCheckDuplicates = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await detectDuplicateJobs(query);
      setDuplicates(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duplicate Detection</CardTitle>
        <CardDescription>
          Check for potential duplicate jobs (90% similarity threshold)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Describe the job..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleCheckDuplicates} disabled={loading || !query}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            Error: {error}
          </div>
        )}

        {duplicates.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Found {duplicates.length} potential duplicates
            </div>
            <SimilarJobsList jobs={duplicates} />
          </div>
        )}

        {duplicates.length === 0 && !loading && !error && query && (
          <div className="text-sm text-muted-foreground">
            No duplicates found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Reusable Component: Similar Jobs List
// ============================================================================

function SimilarJobsList({ jobs }: { jobs: SimilarJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No similar jobs found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="font-medium">{job.title}</div>
              {job.description && (
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{job.status}</Badge>
                {job.metadata?.category && (
                  <Badge variant="secondary">{job.metadata.category}</Badge>
                )}
              </div>
            </div>
            <Badge variant="default">
              {Math.round(job.similarity * 100)}% match
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
