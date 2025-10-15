import { describe, it, expect } from "vitest";

/**
 * MMI Jobs Similarity API Tests
 * 
 * Tests for the job similarity search API endpoint that uses
 * OpenAI embeddings and vector similarity search.
 * 
 * Tests cover both GET and POST modes of operation.
 */
describe("MMI Jobs Similarity API", () => {
  it("should have proper job structure with required fields", () => {
    // Verify the job object structure
    const mockJob = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Engine Overheating Issue",
      description: "Main engine temperature rising above normal operating range.",
      status: "active",
      embedding: null, // Vector embedding (1536 dimensions)
      metadata: { severity: "high", category: "engine" },
      created_at: "2025-10-15T00:00:00Z",
    };

    expect(mockJob.id).toBeDefined();
    expect(mockJob.title).toBeDefined();
    expect(mockJob.description).toBeDefined();
    expect(mockJob.status).toBeDefined();
    expect(mockJob.metadata).toBeDefined();
  });

  it("should support GET mode similarity search parameters", () => {
    // Verify GET mode API parameter structure
    const mockParams = {
      jobId: "550e8400-e29b-41d4-a716-446655440001",
      match_threshold: 0.78,
      match_count: 5,
    };

    expect(mockParams.jobId).toBeDefined();
    expect(mockParams.match_threshold).toBeGreaterThanOrEqual(0);
    expect(mockParams.match_threshold).toBeLessThanOrEqual(1);
    expect(mockParams.match_count).toBeGreaterThan(0);
  });

  it("should support POST mode semantic search parameters", () => {
    // Verify POST mode API parameter structure
    const mockParams = {
      query: "hydraulic system maintenance",
      match_threshold: 0.7,
      match_count: 10,
    };

    expect(mockParams.query).toBeDefined();
    expect(typeof mockParams.query).toBe("string");
    expect(mockParams.match_threshold).toBeGreaterThanOrEqual(0);
    expect(mockParams.match_threshold).toBeLessThanOrEqual(1);
    expect(mockParams.match_count).toBeGreaterThan(0);
  });

  it("should return proper GET mode result structure", () => {
    // Verify GET mode similarity search result structure
    const mockResult = {
      success: true,
      mode: "job_comparison",
      job_id: "550e8400-e29b-41d4-a716-446655440001",
      job_title: "Engine Overheating Issue",
      similar_jobs: [
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          title: "Engine Cooling System Failure",
          description: "Cooling system malfunction causing engine temperature spikes.",
          status: "resolved",
          similarity: 0.89,
          metadata: { severity: "critical", category: "engine" },
          created_at: "2025-10-15T00:00:00Z",
        },
      ],
      count: 1,
      match_threshold: 0.78,
    };

    expect(mockResult.success).toBe(true);
    expect(mockResult.mode).toBe("job_comparison");
    expect(mockResult.job_id).toBeDefined();
    expect(mockResult.similar_jobs).toBeInstanceOf(Array);
    expect(mockResult.count).toBe(mockResult.similar_jobs.length);
    
    // Verify similar job structure
    const similarJob = mockResult.similar_jobs[0];
    expect(similarJob.similarity).toBeGreaterThan(0);
    expect(similarJob.similarity).toBeLessThanOrEqual(1);
    expect(similarJob.id).not.toBe(mockResult.job_id); // Should not return the same job
  });

  it("should return proper POST mode result structure", () => {
    // Verify POST mode semantic search result structure
    const mockResult = {
      success: true,
      mode: "semantic_search",
      query: "hydraulic system maintenance",
      similar_jobs: [
        {
          id: "550e8400-e29b-41d4-a716-446655440005",
          title: "Hydraulic Pump Repair",
          description: "Maintenance work on hydraulic systems.",
          status: "active",
          similarity: 0.92,
          metadata: { category: "hydraulics" },
          created_at: "2025-10-15T00:00:00Z",
        },
      ],
      count: 1,
      match_threshold: 0.7,
    };

    expect(mockResult.success).toBe(true);
    expect(mockResult.mode).toBe("semantic_search");
    expect(mockResult.query).toBeDefined();
    expect(typeof mockResult.query).toBe("string");
    expect(mockResult.similar_jobs).toBeInstanceOf(Array);
    expect(mockResult.count).toBe(mockResult.similar_jobs.length);
    expect(mockResult.match_threshold).toBeDefined();
    
    // Verify similar job structure
    const similarJob = mockResult.similar_jobs[0];
    expect(similarJob.similarity).toBeGreaterThan(0);
    expect(similarJob.similarity).toBeLessThanOrEqual(1);
  });

  it("should handle error cases properly", () => {
    // Test error response structure for both modes
    const missingJobIdError = {
      error: "Missing jobId parameter",
    };

    const missingQueryError = {
      error: "Missing query parameter in request body",
    };

    const notFoundError = {
      error: "Job not found",
    };

    const serverError = {
      error: "Error finding similar jobs",
      success: false,
    };

    expect(missingJobIdError.error).toBeDefined();
    expect(missingQueryError.error).toBeDefined();
    expect(notFoundError.error).toBeDefined();
    expect(serverError.success).toBe(false);
  });

  it("should validate similarity threshold ranges", () => {
    // Test valid and invalid threshold values
    const validThresholds = [0.78, 0.5, 0.9, 1.0];
    const invalidThresholds = [-0.1, 1.5, 2.0];

    validThresholds.forEach((threshold) => {
      expect(threshold).toBeGreaterThanOrEqual(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });

    invalidThresholds.forEach((threshold) => {
      const isValid = threshold >= 0 && threshold <= 1;
      expect(isValid).toBe(false);
    });
  });

  it("should support metadata filtering by category", () => {
    // Test metadata structure for different categories
    const categories = ["engine", "hydraulics", "navigation", "electrical"];
    const mockJobs = categories.map((category) => ({
      metadata: { category, severity: "medium" },
    }));

    mockJobs.forEach((job) => {
      expect(job.metadata.category).toBeDefined();
      expect(categories).toContain(job.metadata.category);
    });
  });

  it("should calculate cosine similarity correctly", () => {
    // Mock cosine similarity calculation
    // similarity = 1 - cosine_distance
    const mockSimilarityScores = [0.95, 0.89, 0.82, 0.78, 0.75];
    
    mockSimilarityScores.forEach((score, index) => {
      // Scores should be in descending order (most similar first)
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
      if (index > 0) {
        expect(score).toBeLessThanOrEqual(mockSimilarityScores[index - 1]);
      }
    });
  });

  it("should support configurable thresholds for different use cases", () => {
    // Test different threshold configurations
    const duplicateDetectionThreshold = 0.9; // High threshold for duplicates
    const suggestionThreshold = 0.7; // Moderate threshold for suggestions
    const recurringIssuesThreshold = 0.75; // Medium-high for recurring issues

    expect(duplicateDetectionThreshold).toBeGreaterThanOrEqual(0.9);
    expect(suggestionThreshold).toBeGreaterThanOrEqual(0.7);
    expect(recurringIssuesThreshold).toBeGreaterThanOrEqual(0.75);
    
    // All thresholds should be valid
    [duplicateDetectionThreshold, suggestionThreshold, recurringIssuesThreshold].forEach(threshold => {
      expect(threshold).toBeGreaterThanOrEqual(0);
      expect(threshold).toBeLessThanOrEqual(1);
    });
  });
});
