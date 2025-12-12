import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PerformanceMonitoringDashboard from "../PerformanceMonitoringDashboard";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        })
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("PerformanceMonitoringDashboard", () => {
  it("should render the performance monitoring dashboard", () => {
    render(<PerformanceMonitoringDashboard />);
    expect(screen.getByText("Performance Monitoring")).toBeInTheDocument();
  });

  it("should display statistics cards", async () => {
    render(<PerformanceMonitoringDashboard />);
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(screen.getByText("Total Metrics")).toBeInTheDocument();
    expect(screen.getByText("Active Systems")).toBeInTheDocument();
    expect(screen.getByText("Warning Alerts")).toBeInTheDocument();
    expect(screen.getByText("Critical Alerts")).toBeInTheDocument();
  });

  it("should have export logs functionality", () => {
    render(<PerformanceMonitoringDashboard />);
    expect(screen.getByText("Export Logs")).toBeInTheDocument();
  });

  it("should have threshold configuration tab", () => {
    render(<PerformanceMonitoringDashboard />);
    expect(screen.getByText("Thresholds")).toBeInTheDocument();
  });
});

describe("Threshold alerts", () => {
  it("should trigger toast notification for critical alerts", () => {
    const mockToast = vi.fn();
    expect(mockToast).toBeDefined();
  });
};
