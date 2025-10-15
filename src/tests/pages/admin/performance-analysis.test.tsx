/**
 * Tests for Performance Analysis Dashboard
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PerformanceAnalysis from "@/pages/admin/PerformanceAnalysis";

// Mock the utils
vi.mock("@/utils/system-validator", () => ({
  runSystemValidation: vi.fn(() => 
    Promise.resolve({
      timestamp: "2024-01-15T10:00:00Z",
      overallStatus: "healthy",
      healthScore: 95,
      results: [
        {
          category: "Database",
          name: "Connection Test",
          status: "success",
          message: "Database connected (245ms)",
          duration: 245,
        },
        {
          category: "Authentication",
          name: "Session Check",
          status: "success",
          message: "Auth system operational",
          duration: 120,
        },
      ],
      summary: {
        total: 2,
        passed: 2,
        warnings: 0,
        errors: 0,
      },
    })
  ),
}));

vi.mock("@/utils/code-analyzer", () => ({
  runCodeAnalysis: vi.fn(() => ({
    timestamp: "2024-01-15T10:00:00Z",
    issues: [
      {
        type: "console.log",
        severity: "medium",
        file: "src/test.tsx",
        line: 10,
        message: "console.log statement found",
        suggestion: "Remove console.log",
      },
    ],
    recommendations: [
      {
        id: "test-rec",
        priority: "high",
        title: "Test Recommendation",
        description: "Test description",
        effort: "low",
        impact: "High impact",
        actionable: true,
      },
    ],
    metrics: {
      consoleLogCount: 45,
      anyTypeCount: 23,
      emptyCatchCount: 8,
      heavyOperationCount: 3,
      missingOptimizationCount: 6,
      unnecessaryApiCallCount: 5,
    },
    summary: {
      totalIssues: 1,
      highSeverity: 0,
      mediumSeverity: 1,
      lowSeverity: 0,
    },
  })),
  getPerformanceMetrics: vi.fn(() => ({
    pageLoadTime: 1245,
    timeToInteractive: 2134,
    firstContentfulPaint: 678,
    memoryUsage: 87,
    apiResponseTime: 245,
    bundleSize: 1234,
    renderTime: 56,
  })),
}));

// Mock toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PerformanceAnalysis", () => {
  describe("Initial Render", () => {
    it("should render the dashboard header", () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      expect(screen.getByText("Performance Analysis Dashboard")).toBeInTheDocument();
      expect(screen.getByText("System Validation & Code Quality Monitoring")).toBeInTheDocument();
    });

    it("should render the Run Analysis button", () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it("should not show results before analysis is run", () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      // Tabs should not be visible initially
      expect(screen.queryByRole("tab", { name: /validation/i })).not.toBeInTheDocument();
    });
  });

  describe("Running Analysis", () => {
    it("should show loading state when analysis is running", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      // Button should be disabled during analysis
      expect(button).toBeDisabled();
      expect(screen.getByText(/analyzing system/i)).toBeInTheDocument();
    });

    it("should display results after analysis completes", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /validation/i })).toBeInTheDocument();
      });
    });

    it("should show all tabs after analysis", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /validation/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /issues/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /recommendations/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /metrics/i })).toBeInTheDocument();
      });
    });
  });

  describe("Validation Tab", () => {
    it("should display system health overview", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("System Health Overview")).toBeInTheDocument();
        expect(screen.getByText(/overall status/i)).toBeInTheDocument();
        expect(screen.getByText(/health score/i)).toBeInTheDocument();
      });
    });

    it("should show health score", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("95%")).toBeInTheDocument();
      });
    });

    it("should display validation results", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText("Validation Results")).toBeInTheDocument();
        expect(screen.getByText(/database connected/i)).toBeInTheDocument();
      });
    });
  });

  describe("Issues Tab", () => {
    it("should have issues tab after analysis", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /issues/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Recommendations Tab", () => {
    it("should have recommendations tab after analysis", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /recommendations/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Metrics Tab", () => {
    it("should have metrics tab after analysis", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /metrics/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible tab navigation", async () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        const tabs = screen.getAllByRole("tab");
        expect(tabs.length).toBeGreaterThan(0);
        
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute("role", "tab");
        });
      });
    });

    it("should have descriptive button text", () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      expect(button.textContent).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("should handle analysis button clicks without crashing", () => {
      renderWithRouter(<PerformanceAnalysis />);
      
      const button = screen.getByRole("button", { name: /run analysis/i });
      
      expect(() => {
        fireEvent.click(button);
        fireEvent.click(button);
      }).not.toThrow();
    });
  });
});
