/**
 * Tests for PATCH 546 - Incident Timeline Component
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { IncidentTimeline } from "../components/IncidentTimeline";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: "1",
              title: "Test Incident 1",
              description: "Test description",
              severity: "high",
              status: "open",
              module: "Test Module",
              created_at: "2025-01-15T10:00:00Z",
            },
            {
              id: "2",
              title: "Test Incident 2",
              description: "Another test",
              severity: "critical",
              status: "resolved",
              module: "Test Module",
              created_at: "2025-02-20T14:00:00Z",
            },
          ],
          error: null,
        })),
      })),
    })),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock html2canvas
vi.mock("html2canvas", () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => "data:image/png;base64,test",
    })
  ),
}));

describe("IncidentTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  };

  it("renders the component title", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("Incident Timeline")).toBeInTheDocument();
  };
  };

  it("displays incidents grouped by month", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("Test Incident 1")).toBeInTheDocument();
      expect(screen.getByText("Test Incident 2")).toBeInTheDocument();
  };
  };

  it("shows severity badges", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("high")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
  };
  };

  it("displays filter controls", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("Module Filter")).toBeInTheDocument();
      expect(screen.getByText("From Date")).toBeInTheDocument();
      expect(screen.getByText("To Date")).toBeInTheDocument();
  };
  };

  it("shows export button", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("Export PNG")).toBeInTheDocument();
  };
  };

  it("displays summary statistics", async () => {
    render(<IncidentTimeline />);
    await waitFor(() => {
      expect(screen.getByText("Total Incidents")).toBeInTheDocument();
  };
  };
};
