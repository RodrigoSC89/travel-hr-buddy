import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DocumentHistoryPage from "@/pages/admin/documents/DocumentHistory";

// Mock supabase client

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === "document_versions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }
      if (table === "ai_generated_documents") {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {};
    }),
  },
}));

describe("DocumentHistoryPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the page title", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/📜 Histórico de Versões/i)).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando histórico.../i)).toBeInTheDocument();
  });

  it("should show message when no versions found", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/documents/history/test-id"]}>
        <Routes>
          <Route path="/admin/documents/history/:id" element={<DocumentHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma versão antiga encontrada./i)).toBeInTheDocument();
    });
  });
});
