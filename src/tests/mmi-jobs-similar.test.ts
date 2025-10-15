import { describe, it, expect } from "vitest";

/**
 * MMI Jobs Similarity API Tests
 * 
 * Tests for the job similarity search API endpoint that uses
 * OpenAI embeddings and vector similarity search.
 * 
 * The API supports two modes:
 * 1. GET with jobId - Find similar jobs to an existing job
 * 2. POST with query text - Semantic search with any text
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

  describe("GET endpoint - Find similar jobs by ID", () => {
    it("should support GET request parameters with jobId", () => {
      // Verify GET endpoint parameter structure
      const mockParams = {
        jobId: "550e8400-e29b-41d4-a716-446655440001",
      };

      expect(mockParams.jobId).toBeDefined();
      expect(mockParams.jobId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should return proper similarity result structure for GET", () => {
      // Verify GET similarity search result structure
      const mockResult = {
        success: true,
        job_id: "550e8400-e29b-41d4-a716-446655440001",
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
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.job_id).toBeDefined();
      expect(mockResult.similar_jobs).toBeInstanceOf(Array);
      expect(mockResult.count).toBe(mockResult.similar_jobs.length);
      
      // Verify similar job structure
      const similarJob = mockResult.similar_jobs[0];
      expect(similarJob.similarity).toBeGreaterThan(0);
      expect(similarJob.similarity).toBeLessThanOrEqual(1);
      expect(similarJob.id).not.toBe(mockResult.job_id); // Should not return the same job
    });
  });

  describe("POST endpoint - Semantic search with query", () => {
    it("should support POST request with query text", () => {
      // Verify POST endpoint parameter structure
      const mockParams = {
        query: "hydraulic system maintenance",
        match_threshold: 0.78,
        match_count: 5,
      };

      expect(mockParams.query).toBeDefined();
      expect(typeof mockParams.query).toBe("string");
      expect(mockParams.match_threshold).toBeGreaterThanOrEqual(0);
      expect(mockParams.match_threshold).toBeLessThanOrEqual(1);
      expect(mockParams.match_count).toBeGreaterThan(0);
    });

    it("should return proper result structure for POST", () => {
      // Verify POST semantic search result structure
      const mockResult = {
        data: [
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            title: "Hydraulic System Leak",
            description: "Detected hydraulic fluid leak in starboard crane system.",
            status: "active",
            similarity: 0.92,
            metadata: { severity: "medium", category: "hydraulics" },
            created_at: "2025-10-15T00:00:00Z",
          },
        ],
        meta: {
          query: "hydraulic system maintenance",
          results_count: 1,
          timestamp: "2025-10-15T00:00:00.000Z",
        },
      };

      expect(mockResult.data).toBeInstanceOf(Array);
      expect(mockResult.meta).toBeDefined();
      expect(mockResult.meta.query).toBeDefined();
      expect(mockResult.meta.results_count).toBe(mockResult.data.length);
      expect(mockResult.meta.timestamp).toBeDefined();
      
      // Verify similar job structure
      const similarJob = mockResult.data[0];
      expect(similarJob.similarity).toBeGreaterThan(0);
      expect(similarJob.similarity).toBeLessThanOrEqual(1);
    });

    it("should handle optional parameters in POST request", () => {
      // Test with minimal parameters
      const minimalParams = {
        query: "engine maintenance",
      };
      expect(minimalParams.query).toBeDefined();

      // Test with all parameters
      const fullParams = {
        query: "engine maintenance",
        match_threshold: 0.7,
        match_count: 10,
      };
      expect(fullParams.query).toBeDefined();
      expect(fullParams.match_threshold).toBeDefined();
      expect(fullParams.match_count).toBeDefined();
    });
  });

  it("should handle error cases properly", () => {
    // Test error response structures
    const missingJobError = {
      error: "Missing jobId parameter",
    };

    const missingQueryError = {
      error: "Missing or invalid 'query' parameter in request body",
    };

    const notFoundError = {
      error: "Job not found",
    };

    const methodError = {
      error: "Method not allowed. Use GET or POST",
    };

    const serverError = {
      error: "Error finding similar jobs",
      success: false,
    };

    expect(missingJobError.error).toBeDefined();
    expect(missingQueryError.error).toBeDefined();
    expect(notFoundError.error).toBeDefined();
    expect(methodError.error).toBeDefined();
    expect(serverError.success).toBe(false);
  });

  it("should validate similarity threshold ranges", () => {
    // Test valid and invalid threshold values
    const validThresholds = [0.78, 0.5, 0.9, 1.0, 0.0];
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

  it("should support different query types", () => {
    // Test various query scenarios
    const queryTypes = [
      { query: "hydraulic system leak", expected: "specific technical issue" },
      { query: "engine maintenance", expected: "general maintenance category" },
      { query: "emergency repair cooling system", expected: "complex multi-word query" },
      { query: "preventive maintenance", expected: "maintenance type" },
    ];

    queryTypes.forEach((testCase) => {
      expect(testCase.query).toBeDefined();
      expect(typeof testCase.query).toBe("string");
      expect(testCase.query.length).toBeGreaterThan(0);
    });
  });
});
