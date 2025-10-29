/**
 * PATCH 546 - Incident Timeline Component Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

// Mock Supabase before imports
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

// Mock html2canvas
vi.mock("html2canvas", () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: vi.fn(() => "data:image/png;base64,mock"),
    })
  ),
}));

import { IncidentTimeline } from "@/modules/incident-reports/components/IncidentTimeline";

describe("IncidentTimeline Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the timeline component", async () => {
    await act(async () => {
      render(<IncidentTimeline />);
    });
    await waitFor(() => {
      expect(screen.getByText("Incident Timeline")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    render(<IncidentTimeline />);
    expect(screen.getByText("Carregando timeline...")).toBeInTheDocument();
  });

  it("should display export button", async () => {
    await act(async () => {
      render(<IncidentTimeline />);
    });
    await waitFor(() => {
      expect(screen.getByText("Exportar PNG")).toBeInTheDocument();
    });
  });

  it("should show empty state when no incidents", async () => {
    await act(async () => {
      render(<IncidentTimeline />);
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Nenhum incidente encontrado para os filtros selecionados"
        )
      ).toBeInTheDocument();
    });
  });

  it("should render with module filter", async () => {
    await act(async () => {
      render(<IncidentTimeline moduleFilter="Vessel-01" />);
    });
    await waitFor(() => {
      expect(screen.getByText("Incident Timeline")).toBeInTheDocument();
    });
  });

  it("should render with date filters", async () => {
    await act(async () => {
      render(<IncidentTimeline dateFrom="2025-01-01" dateTo="2025-12-31" />);
    });
    await waitFor(() => {
      expect(screen.getByText("Incident Timeline")).toBeInTheDocument();
    });
  });
});
