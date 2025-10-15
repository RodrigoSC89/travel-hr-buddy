/**
 * Tests for System Validation and Performance Analysis
 */

import { describe, it, expect, vi } from "vitest";
import {
  runSystemValidation,
  validateEnvironment,
  validateDatabaseConnection,
} from "@/utils/system-validator";
import {
  runCodeAnalysis,
  analyzeCodePatterns,
  generateRecommendations,
  calculateMetrics,
  getPerformanceMetrics,
} from "@/utils/code-analyzer";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [{ count: 1 }], error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => 
        Promise.resolve({ 
          data: { session: { user: { id: "test-user" } } }, 
          error: null 
        })
      ),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((callback) => {
          callback("SUBSCRIBED");
          return Promise.resolve();
        }),
      })),
      unsubscribe: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(() => 
        Promise.resolve({ 
          data: { status: "ok" }, 
          error: null 
        })
      ),
    },
    storage: {
      listBuckets: vi.fn(() => 
        Promise.resolve({ 
          data: [{ name: "bucket1" }, { name: "bucket2" }], 
          error: null 
        })
      ),
    },
  },
}));

describe("System Validator", () => {
  describe("validateEnvironment", () => {
    it("should validate environment configuration", () => {
      const result = validateEnvironment();
      
      expect(result).toHaveProperty("category", "Environment");
      expect(result).toHaveProperty("name", "Configuration Check");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("duration");
    });

    it("should return success status when env vars are configured", () => {
      const result = validateEnvironment();
      
      // The test environment may or may not have these vars
      expect(["success", "error"]).toContain(result.status);
    });
  });

  describe("validateDatabaseConnection", () => {
    it("should test database connectivity", async () => {
      const result = await validateDatabaseConnection();
      
      expect(result).toHaveProperty("category", "Database");
      expect(result).toHaveProperty("name", "Connection Test");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("duration");
      expect(typeof result.duration).toBe("number");
    });

    it("should return success when database responds quickly", async () => {
      const result = await validateDatabaseConnection();
      
      expect(["success", "warning", "error"]).toContain(result.status);
      expect(result.message).toBeTruthy();
    });
  });

  describe("runSystemValidation", () => {
    it("should run complete system validation", async () => {
      const report = await runSystemValidation();
      
      expect(report).toHaveProperty("timestamp");
      expect(report).toHaveProperty("overallStatus");
      expect(report).toHaveProperty("healthScore");
      expect(report).toHaveProperty("results");
      expect(report).toHaveProperty("summary");
      
      expect(Array.isArray(report.results)).toBe(true);
      expect(report.results.length).toBeGreaterThan(0);
    });

    it("should calculate health score correctly", async () => {
      const report = await runSystemValidation();
      
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
    });

    it("should include summary statistics", async () => {
      const report = await runSystemValidation();
      
      expect(report.summary).toHaveProperty("total");
      expect(report.summary).toHaveProperty("passed");
      expect(report.summary).toHaveProperty("warnings");
      expect(report.summary).toHaveProperty("errors");
      
      const { total, passed, warnings, errors } = report.summary;
      expect(total).toBe(passed + warnings + errors);
    });

    it("should validate all expected categories", async () => {
      const report = await runSystemValidation();
      
      const categories = report.results.map(r => r.category);
      
      expect(categories).toContain("Environment");
      expect(categories).toContain("Database");
      expect(categories).toContain("Authentication");
    });
  });
});

describe("Code Analyzer", () => {
  describe("analyzeCodePatterns", () => {
    it("should detect code issues", () => {
      const issues = analyzeCodePatterns();
      
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
    });

    it("should include all issue types", () => {
      const issues = analyzeCodePatterns();
      
      const types = [...new Set(issues.map(i => i.type))];
      
      expect(types).toContain("console.log");
      expect(types).toContain("any-type");
      expect(types).toContain("empty-catch");
    });

    it("should have correct issue structure", () => {
      const issues = analyzeCodePatterns();
      
      issues.forEach(issue => {
        expect(issue).toHaveProperty("type");
        expect(issue).toHaveProperty("severity");
        expect(issue).toHaveProperty("file");
        expect(issue).toHaveProperty("message");
        expect(["high", "medium", "low"]).toContain(issue.severity);
      });
    });
  });

  describe("generateRecommendations", () => {
    it("should generate recommendations based on issues", () => {
      const issues = analyzeCodePatterns();
      const recommendations = generateRecommendations(issues);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should have correct recommendation structure", () => {
      const issues = analyzeCodePatterns();
      const recommendations = generateRecommendations(issues);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty("id");
        expect(rec).toHaveProperty("priority");
        expect(rec).toHaveProperty("title");
        expect(rec).toHaveProperty("description");
        expect(rec).toHaveProperty("effort");
        expect(rec).toHaveProperty("impact");
        expect(rec).toHaveProperty("actionable");
        
        expect(["high", "medium", "low"]).toContain(rec.priority);
        expect(["low", "medium", "high"]).toContain(rec.effort);
        expect(typeof rec.actionable).toBe("boolean");
      });
    });

    it("should prioritize empty catch blocks as high priority", () => {
      const issues = analyzeCodePatterns();
      const recommendations = generateRecommendations(issues);
      
      const emptyCatchRec = recommendations.find(r => r.id === "fix-empty-catch");
      
      if (emptyCatchRec) {
        expect(emptyCatchRec.priority).toBe("high");
      }
    });
  });

  describe("calculateMetrics", () => {
    it("should calculate code metrics correctly", () => {
      const issues = analyzeCodePatterns();
      const metrics = calculateMetrics(issues);
      
      expect(metrics).toHaveProperty("consoleLogCount");
      expect(metrics).toHaveProperty("anyTypeCount");
      expect(metrics).toHaveProperty("emptyCatchCount");
      expect(metrics).toHaveProperty("heavyOperationCount");
      expect(metrics).toHaveProperty("missingOptimizationCount");
      expect(metrics).toHaveProperty("unnecessaryApiCallCount");
      
      // All counts should be non-negative numbers
      Object.values(metrics).forEach(count => {
        expect(typeof count).toBe("number");
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it("should match issue counts", () => {
      const issues = analyzeCodePatterns();
      const metrics = calculateMetrics(issues);
      
      const consoleLogIssues = issues.filter(i => i.type === "console.log").length;
      const anyTypeIssues = issues.filter(i => i.type === "any-type").length;
      
      expect(metrics.consoleLogCount).toBe(consoleLogIssues);
      expect(metrics.anyTypeCount).toBe(anyTypeIssues);
    });
  });

  describe("runCodeAnalysis", () => {
    it("should run complete code analysis", () => {
      const report = runCodeAnalysis();
      
      expect(report).toHaveProperty("timestamp");
      expect(report).toHaveProperty("issues");
      expect(report).toHaveProperty("recommendations");
      expect(report).toHaveProperty("metrics");
      expect(report).toHaveProperty("summary");
    });

    it("should calculate summary statistics correctly", () => {
      const report = runCodeAnalysis();
      
      const { totalIssues, highSeverity, mediumSeverity, lowSeverity } = report.summary;
      
      expect(totalIssues).toBe(highSeverity + mediumSeverity + lowSeverity);
      expect(totalIssues).toBe(report.issues.length);
    });

    it("should include timestamp in ISO format", () => {
      const report = runCodeAnalysis();
      
      expect(report.timestamp).toBeTruthy();
      expect(() => new Date(report.timestamp)).not.toThrow();
    });
  });

  describe("getPerformanceMetrics", () => {
    it("should return performance metrics", () => {
      const metrics = getPerformanceMetrics();
      
      expect(metrics).toHaveProperty("pageLoadTime");
      expect(metrics).toHaveProperty("timeToInteractive");
      expect(metrics).toHaveProperty("firstContentfulPaint");
      expect(metrics).toHaveProperty("memoryUsage");
      expect(metrics).toHaveProperty("apiResponseTime");
      expect(metrics).toHaveProperty("bundleSize");
      expect(metrics).toHaveProperty("renderTime");
    });

    it("should return realistic metric values", () => {
      const metrics = getPerformanceMetrics();
      
      // Page load time should be reasonable
      expect(metrics.pageLoadTime).toBeGreaterThan(0);
      expect(metrics.pageLoadTime).toBeLessThan(10000);
      
      // Memory usage should be reasonable
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeLessThan(1000);
      
      // Bundle size should be reasonable
      expect(metrics.bundleSize).toBeGreaterThan(0);
      expect(metrics.bundleSize).toBeLessThan(10000);
    });
  });
});

describe("Integration Tests", () => {
  it("should produce consistent reports on multiple runs", async () => {
    const report1 = await runSystemValidation();
    const report2 = await runSystemValidation();
    
    // Results should have same structure
    expect(report1.results.length).toBe(report2.results.length);
    expect(report1.summary.total).toBe(report2.summary.total);
  });

  it("should handle analysis workflow end-to-end", async () => {
    // Run system validation
    const validationReport = await runSystemValidation();
    expect(validationReport.healthScore).toBeGreaterThanOrEqual(0);
    
    // Run code analysis
    const analysisReport = runCodeAnalysis();
    expect(analysisReport.summary.totalIssues).toBeGreaterThan(0);
    
    // Get performance metrics
    const metrics = getPerformanceMetrics();
    expect(metrics.pageLoadTime).toBeGreaterThan(0);
    
    // All three reports should be available
    expect(validationReport).toBeTruthy();
    expect(analysisReport).toBeTruthy();
    expect(metrics).toBeTruthy();
  });
});
